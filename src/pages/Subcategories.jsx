import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Tag,
  Package,
  AlertCircle,
  TrendingUp,
  Eye,
  X,
  Check,
  Loader2,
  Grid3X3,
  List,
  Calendar,
  Hash,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategories,
  getSubCategoriesByCategory,
  clearSuccess,
  clearError
} from '../redux/subcategorySlice'
import { getCategories } from '../redux/categorySlice'
// Import the uploadColorImage action from productSlice
import { uploadColorImage } from '../redux/productSlice'

export default function Subcategories() {
  const dispatch = useDispatch()
  const {
    subCategories = [],
    loading,
    error,
    success,
    createdSubCategory,
    updatedSubCategory,
    deletedSubCategoryId
  } = useSelector(state => state.subCategory || {})
  const { categories = [] } = useSelector(state => state.category || {})
  
  // Add product state for image upload
  const { 
    loading: imageUploading 
  } = useSelector(state => state.product || {})

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState('table')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSubcategory, setEditingSubcategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    image: null,  // Add image field
    isActive: true
  })

  const statuses = ['All', 'Active', 'Inactive']

  useEffect(() => {
    dispatch(getSubCategories())
    dispatch(getCategories())
  }, [dispatch])

  useEffect(() => {
    if (success) {
      if (createdSubCategory) {
        toast.success('Subcategory created successfully!')
        setShowAddModal(false)
        resetForm()
      }
      if (updatedSubCategory) {
        toast.success('Subcategory updated successfully!')
        setEditingSubcategory(null)
        resetForm()
      }
      if (deletedSubCategoryId) {
        toast.success('Subcategory deleted successfully!')
      }
      dispatch(clearSuccess())
    }
  }, [success, createdSubCategory, updatedSubCategory, deletedSubCategoryId, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred')
      dispatch(clearError())
    }
  }, [error, dispatch])

  const filtered = subCategories.filter(s => {
    const ms = s.name.toLowerCase().includes(search.toLowerCase()) ||
               s.description.toLowerCase().includes(search.toLowerCase())
    const mc = categoryFilter === 'All' || s.category === categoryFilter
    const mt = statusFilter === 'All' ||
               (statusFilter==='Active' && s.isActive) ||
               (statusFilter==='Inactive' && !s.isActive)
    return ms && mc && mt
  })
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      image: null,  // Reset image field
      isActive: true
    })
    setShowAddModal(false)
    setEditingSubcategory(null)
  }

  const handleInputChange = e => {
    const { name, value, type, checked, files } = e.target
    if (name === 'image') {
      setFormData(prev => ({ ...prev, image: files[0] }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.categoryId || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      let imageUrl = null

      // Upload image using Redux action if there's a new file
      if (formData.image) {
        toast.loading('Uploading image...', { id: 'image-upload' })
        
        // Create FormData for image upload
        const uploadFormData = new FormData()
        uploadFormData.append('image', formData.image)
        
        // Dispatch uploadColorImage action and wait for result
        const uploadResult = await dispatch(uploadColorImage(uploadFormData)).unwrap()
        
        console.log('Upload result:', uploadResult)
        
        // Extract image URL from the response structure: {data: Array(1), statusCode: 200, success: true}
        if (uploadResult && uploadResult.data && Array.isArray(uploadResult.data) && uploadResult.data.length > 0) {
          const firstImage = uploadResult.data[0]
          // Try different possible properties for the URL
          imageUrl = firstImage.url || firstImage.secure_url || firstImage.imageUrl || firstImage.src || firstImage
          console.log('Extracted imageUrl:', imageUrl)
        } else if (typeof uploadResult === 'string') {
          imageUrl = uploadResult
        } else if (uploadResult && typeof uploadResult === 'object') {
          // Fallback for other response structures
          imageUrl = uploadResult.url || uploadResult.imageUrl || uploadResult.secure_url
        }
        
        // Validate that imageUrl is a valid HTTP/HTTPS URL
        if (!imageUrl || typeof imageUrl !== 'string' || (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://'))) {
          console.error('Invalid or missing image URL:', imageUrl)
          console.error('Full upload result:', uploadResult)
          toast.error('Failed to get valid image URL from upload response')
          return
        }
        
        toast.success('Image uploaded successfully!', { id: 'image-upload' })
      } else if (editingSubcategory?.image) {
        // Keep existing image URL if editing and no new file selected
        imageUrl = editingSubcategory.image
      }

      // Prepare JSON data for subcategory creation/update
      const submitData = {
        name: formData.name,
        description: formData.description,
        category: formData.categoryId,
        isActive: formData.isActive
      }
      
      // Add image URL if available
      if (imageUrl) {
        submitData.image = imageUrl
      }

      console.log('Submitting subcategory data:', submitData)

      if (editingSubcategory) {
        await dispatch(updateSubCategory({
          id: editingSubcategory._id,
          updateData: submitData
        })).unwrap()
      } else {
        // Create new subcategory - require image
        if (!imageUrl) {
          toast.error('Please upload a subcategory image')
          return
        }
        await dispatch(createSubCategory(submitData)).unwrap()
      }

    } catch (error) {
      console.error('Submit error:', error)
      // More specific error handling
      if (error.message?.includes('Network Error') || error.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.')
      } else if (error.message?.includes('500')) {
        toast.error('Server error. Please try again or contact support.')
      } else {
        toast.error(error.message || 'Failed to save subcategory')
      }
    }
  }

  const handleEdit = sub => {
    setEditingSubcategory(sub)
    setFormData({
      name: sub.name,
      description: sub.description,
      categoryId: sub.categoryId?._id || '',
      image: null, // Don't prefill file input
      isActive: sub.isActive !== false
    })
    setShowAddModal(true)
  }

  const handleDelete = sub => {
    if (window.confirm(`Delete "${sub.name}"?`)) {
      dispatch(deleteSubCategory(sub._id))
    }
  }

  const handleCategoryFilter = id => {
    setCategoryFilter(id)
    if (id !== 'All') {
      dispatch(getSubCategoriesByCategory(id))
    } else {
      dispatch(getSubCategories())
    }
  }

  const stats = {
    total: filtered.length,
    active: filtered.filter(s => s.isActive).length,
    inactive: filtered.filter(s => !s.isActive).length,
    categories: new Set(filtered.map(s=>s.categoryId?._id)).size
  }

  const SubcategoryCard = ({ subcategory: s }) => {
    const categoryName = categories.find(cat => cat._id === s.category)?.name || 'Unknown'
    return (
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 group">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {s.image ? (
                  <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                ) : (
                  <Tag size={20} className="text-white" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-gray-900">{s.name}</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  s.isActive 
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    s.isActive ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></div>
                  {s.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={() => handleEdit(s)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => handleDelete(s)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{s.description}</p>

          {/* Category */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center">
              <Package size={14} className="mr-2 text-gray-400" />
              Parent Category
            </h4>
            <span className="px-3 py-1 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 rounded-full text-sm font-medium border border-pink-200">
              {categoryName}
            </span>
          </div>

          {/* Metadata */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <Calendar size={12} className="mr-1" />
                Created
              </span>
              <span className="text-gray-900 font-medium">
                {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center">
                <Hash size={12} className="mr-1" />
                ID
              </span>
              <span className="text-gray-900 font-mono text-xs">{s._id?.slice(-8) || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading && subCategories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
          <p className="text-gray-600">Loading subcategories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50/50 to-purple-50/20 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-gray-800 to-purple-600 bg-clip-text text-transparent">
            Subcategories Management
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Tag size={18} className="text-purple-400" />
            Organize your products with detailed subcategories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white/80 rounded-xl border border-gray-200 shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-3 rounded-l-xl transition-all duration-200 ${
                viewMode === 'table' 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-r-xl transition-all duration-200 ${
                viewMode === 'grid' 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-semibold"
          >
            <Plus size={18} />
            Add Subcategory
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Subcategories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Tag size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Active</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Inactive</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
              <AlertCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Categories</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.categories}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search subcategories by name or description..."
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 text-sm placeholder-gray-500 transition-all duration-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => handleCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 text-sm font-medium min-w-48"
          >
            <option value="All">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 text-sm font-medium min-w-40"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={32} className="animate-spin text-purple-500" />
        </div>
      )}

      {/* Subcategories Display */}
      {!loading && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((subcategory, index) => (
                <div key={subcategory._id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-slide-up">
                  <SubcategoryCard subcategory={subcategory} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50/80 to-purple-50/50 border-b border-gray-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Subcategory</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Category</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Description</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Status</th>
                      <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Created</th>
                      <th className="text-center py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((subcategory, index) => (
                      <tr 
                        key={subcategory._id} 
                        className="hover:bg-purple-50/30 transition-all duration-200 border-b border-gray-50/50 group"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {subcategory.image ? (
                                <img src={subcategory.image} alt={subcategory.name} className="w-full h-full object-cover" />
                              ) : (
                                <Tag size={16} className="text-white" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{subcategory.name}</p>
                              <p className="text-xs text-gray-500 font-mono">{subcategory._id?.slice(-8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                            {categories.find(cat => cat._id === subcategory.category)?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm text-gray-700 max-w-xs truncate" title={subcategory.description}>
                            {subcategory.description}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                            subcategory.isActive 
                              ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200' 
                              : 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200'
                          }`}>
                            {subcategory.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600">
                            {subcategory.createdAt ? new Date(subcategory.createdAt).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                              onClick={() => handleEdit(subcategory)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(subcategory)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <Tag size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No subcategories found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Subcategory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
              </h2>
              <button 
                onClick={resetForm}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                    placeholder="Subcategory name"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Category *</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                  >
                    <option value="">Select parent category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 resize-none"
                    placeholder="Brief description of the subcategory"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory Image</label>
                  <div className="relative">
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full px-4 py-8 bg-white/80 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 cursor-pointer transition-colors"
                    >
                      <div className="text-center">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                    {formData.image && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected: {formData.image.name}
                      </p>
                    )}
                    {editingSubcategory && editingSubcategory.image && !formData.image && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Current image:</p>
                        <img 
                          src={editingSubcategory.image} 
                          alt="Current" 
                          className="w-20 h-20 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500/20 focus:ring-2"
                  />
                  <label htmlFor="isActive" className="text-sm font-semibold text-gray-700">
                    Active subcategory
                  </label>
                </div>
              </form>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex-shrink-0">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                disabled={loading || imageUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || imageUploading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading || imageUploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {imageUploading ? 'Uploading image...' : (editingSubcategory ? 'Updating...' : 'Adding...')}
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    {editingSubcategory ? 'Update Subcategory' : 'Add Subcategory'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
