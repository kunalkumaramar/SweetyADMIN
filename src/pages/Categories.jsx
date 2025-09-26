import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Search, 
  Package, 
  Tag, 
  Calendar, 
  Hash, 
  BarChart3, 
  X,
  Loader2,
  Upload,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  clearSuccess,
  clearError
} from '../redux/categorySlice'

const Categories = () => {
  const dispatch = useDispatch()
  const {
    categories = [],
    loading,
    error,
    success,
    createdCategory,
    updatedCategory,
    deletedCategoryId
  } = useSelector(state => state.category || {})

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null,
    isActive: true
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')

  // Load categories on mount
  useEffect(() => {
    dispatch(getCategories())
  }, [dispatch])

  // Handle success states
  useEffect(() => {
    if (success) {
      if (createdCategory) {
        toast.success('Category created successfully!')
        resetForm()
      }
      if (updatedCategory) {
        toast.success('Category updated successfully!')
        resetForm()
      }
      if (deletedCategoryId) {
        toast.success('Category deleted successfully!')
      }
      dispatch(clearSuccess())
      dispatch(getCategories()) // Refresh list
    }
  }, [success, createdCategory, updatedCategory, deletedCategoryId, dispatch])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred')
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleInputChange = (e) => {
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
  e && e.preventDefault()
  
  if (!formData.name.trim() || !formData.description.trim()) {
    toast.error('Please fill in all required fields')
    return
  }

  try {
    // Always use FormData for consistency
    const submitData = new FormData()
    submitData.append('name', formData.name.trim())
    submitData.append('description', formData.description.trim())
    submitData.append('isActive', formData.isActive)
    
    // Only append image if one is selected
    if (formData.image) {
      submitData.append('image', formData.image)
    }

    if (editingCategory) {
      dispatch(updateCategory({ 
        id: editingCategory._id, 
        updateData: submitData 
      }))
    } else {
      dispatch(createCategory(submitData))
    }
  } catch (error) {
    toast.error('Error processing request: ' + error.message)
  }
}

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image: null,
      isActive: true
    })
    setShowForm(false)
    setEditingCategory(null)
  }

  const editCategory = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
      image: null, // Don't prefill file input
      isActive: category.isActive !== false
    })
    setShowForm(true)
  }

  const handleDelete = (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      dispatch(deleteCategory(category._id))
    }
  }

  // Filter categories based on search and status
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All Status' || 
                         (statusFilter === 'Active' && category.isActive) ||
                         (statusFilter === 'Inactive' && !category.isActive)
    return matchesSearch && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: filteredCategories.length,
    active: filteredCategories.filter(c => c.isActive).length,
    inactive: filteredCategories.filter(c => !c.isActive).length
  }

  const categoryIcons = [
    { bg: 'from-pink-500 to-rose-500', icon: Tag },
    { bg: 'from-purple-500 to-indigo-500', icon: Package },
    { bg: 'from-blue-500 to-cyan-500', icon: BarChart3 },
    { bg: 'from-emerald-500 to-teal-500', icon: Filter },
    { bg: 'from-orange-500 to-amber-500', icon: Hash }
  ]

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
          <p className="text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Categories Management
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Organize your products into categories with beautiful, intuitive management
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add New Category
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Categories</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Active Categories</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{stats.active}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Check size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Inactive Categories</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                <X size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-purple-500" />
          </div>
        )}

        {/* Categories Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category, index) => {
              const IconComponent = categoryIcons[index % categoryIcons.length].icon
              const bgGradient = categoryIcons[index % categoryIcons.length].bg
              
              return (
                <div
                  key={category._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 group"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${bgGradient} rounded-xl flex items-center justify-center shadow-lg overflow-hidden`}>
                          {category.image ? (
                            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                          ) : (
                            <IconComponent size={20} className="text-white" />
                          )}
                        </div>
                        <div className="space-y-1 flex-1">
                          <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            category.isActive 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              category.isActive ? 'bg-emerald-500' : 'bg-red-500'
                            }`}></div>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => editCategory(category)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed line-clamp-3">
                      {category.description || 'No description available'}
                    </p>

                    {/* Metadata */}
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center">
                          <Calendar size={12} className="mr-1" />
                          Created
                        </span>
                        <span className="text-gray-900 font-medium">
                          {category.createdAt ? new Date(category.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 flex items-center">
                          <Hash size={12} className="mr-1" />
                          ID
                        </span>
                        <span className="text-gray-900 font-mono text-xs">{category._id?.slice(-8) || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Package size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== 'All Status' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by creating your first category'}
            </p>
            {(!searchTerm && statusFilter === 'All Status') && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Create Category
              </button>
            )}
          </div>
        )}

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col">
              {/* Fixed Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button 
                  onClick={resetForm}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                      placeholder="Enter category name"
                    />
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
                      placeholder="Brief description of the category"
                    />
                  </div>
        
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category Image</label>
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
                      {editingCategory && editingCategory.image && !formData.image && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Current image:</p>
                          <img 
                            src={editingCategory.image} 
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
                      Active category
                    </label>
                  </div>
                </form>
              </div>
        
              {/* Fixed Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl flex-shrink-0">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      {editingCategory ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      {editingCategory ? 'Update Category' : 'Create Category'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories
