import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  AlertCircle,
  TrendingUp,
  Eye,
  Grid3X3,
  List,
  Check,
  Loader2,
  X,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createProduct,
  updateProduct,
  getProducts,
  uploadColorImage,
  addProductSubcategories,
  deleteProductSubcategory,
  filterProductsBySubcategories,
  clearSuccess,
  clearError
} from '../redux/productSlice'
import { getCategories } from '../redux/categorySlice'
import { getSubCategoriesByCategory } from '../redux/subcategorySlice'

export default function Products() {
  const dispatch = useDispatch()
  const {
    products = [],
    pagination = {},
    loading,
    error,
    success,
    createdProduct,
    updatedProduct,
    uploadedImages = [] // Add this from your slice
  } = useSelector(state => state.product || {})
  const { categories = [] } = useSelector(state => state.category || {})
  const { subCategories = [] } = useSelector(state => state.subCategory || {})

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [subcategoryFilter, setSubcategoryFilter] = useState('All')
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    code: '',
    category: '',
    subcategory: '',
    subcategories: [], // Array for multiple subcategories
    price: '',
    originalPrice: '',
    description: '',
    sizeChart: '',
    tags: '',
    colors: [{ // Initialize with one empty color
      colorName: '',
      colorHex: '#000000',
      images: [],
      sizeStock: [{ size: '', stock: 0 }]
    }]
  })

  const initializeForm = () => {
    setForm({
      name: '',
      code: '',
      category: '',
      subcategory: '',
      subcategories: [],
      price: '',
      originalPrice: '',
      description: '',
      sizeChart: '',
      tags: '',
      colors: [{
        colorName: '',
        colorHex: '#000000',
        images: [],
        sizeStock: [{ size: '', stock: 0 }]
      }]
    })
  }

  useEffect(() => {
    dispatch(getProducts({ page: 1, limit: 12 }))
    dispatch(getCategories())
  }, [dispatch])

  useEffect(() => {
  // Clear subcategory when category changes in form
  if (form.category && form.category !== '') {
    dispatch(getSubCategoriesByCategory(form.category))
    // Reset subcategory when category changes
    setForm(f => ({ ...f, subcategory: '' }))
  }
}, [form.category, dispatch])

  useEffect(() => {
    if (success) {
      toast.success(createdProduct ? 'Product created successfully!' : 'Product updated successfully!')
      dispatch(clearSuccess())
      setShowModal(false)
      setEditing(null)
      initializeForm()
      dispatch(getProducts({ page: 1, limit: 12 }))
    }
  }, [success, createdProduct, updatedProduct, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred')
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleInput = (e) => {
  const { name, value } = e.target
  
  // If category is changing, reset subcategory and subcategories
  if (name === 'category') {
    setForm(f => ({ 
      ...f, 
      [name]: value,
      subcategory: '', // Reset subcategory when category changes
      subcategories: [] // Reset subcategories array
    }))
  } else {
    setForm(f => ({ ...f, [name]: value }))
  }
}

  const handleColorChange = (colorIndex, field, value) => {
    const newColors = [...form.colors]
    newColors[colorIndex] = { ...newColors[colorIndex], [field]: value }
    setForm(f => ({ ...f, colors: newColors }))
  }

  const handleSizeStockChange = (colorIndex, sizeIndex, field, value) => {
    const newColors = [...form.colors]
    const newSizeStock = [...newColors[colorIndex].sizeStock]
    newSizeStock[sizeIndex] = { ...newSizeStock[sizeIndex], [field]: value }
    newColors[colorIndex] = { ...newColors[colorIndex], sizeStock: newSizeStock }
    setForm(f => ({ ...f, colors: newColors }))
  }

  const addColor = () => {
    setForm(f => ({
      ...f,
      colors: [...f.colors, {
        colorName: '',
        colorHex: '#000000',
        images: [],
        sizeStock: [{ size: '', stock: 0 }]
      }]
    }))
  }

  const removeColor = (colorIndex) => {
    if (form.colors.length > 1) {
      const newColors = form.colors.filter((_, index) => index !== colorIndex)
      setForm(f => ({ ...f, colors: newColors }))
    }
  }

  const addSizeStock = (colorIndex) => {
    const newColors = [...form.colors]
    newColors[colorIndex].sizeStock.push({ size: '', stock: 0 })
    setForm(f => ({ ...f, colors: newColors }))
  }

  const removeSizeStock = (colorIndex, sizeIndex) => {
    const newColors = [...form.colors]
    if (newColors[colorIndex].sizeStock.length > 1) {
      newColors[colorIndex].sizeStock = newColors[colorIndex].sizeStock.filter((_, index) => index !== sizeIndex)
      setForm(f => ({ ...f, colors: newColors }))
    }
  }

  // Updated image upload function using your API
  const handleImageUpload = async (colorIndex, files) => {
    if (!files || files.length === 0) return

    try {
      toast.loading('Uploading images...')
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('image', file) // Adjust field name based on your API
        
        const result = await dispatch(uploadColorImage(formData)).unwrap()
        // Extract the actual URL from the API response
        // Based on your response structure, it seems to be in result.data[0]
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          return result.data[0] // Get the first URL from the data array
        }
        // Fallback to other possible response structures
        return result.imageUrl || result.url || result
      })

      const imageUrls = await Promise.all(uploadPromises)
      // Filter out any invalid URLs
      const validImageUrls = imageUrls.filter(url => typeof url === 'string' && url.trim())
      
        if (validImageUrls.length > 0) {
        const newColors = [...form.colors]
        // Ensure existing images are strings, not objects
        const existingImages = newColors[colorIndex].images.filter(img => typeof img === 'string')
        
        newColors[colorIndex] = { 
          ...newColors[colorIndex], 
          images: [...existingImages, ...validImageUrls]
        }
        setForm(f => ({ ...f, colors: newColors }))
        
        toast.dismiss()
        toast.success('Images uploaded successfully!')
      } else {
        toast.dismiss()
        toast.error('No valid images were uploaded')
      }
    } catch (error) {
      toast.dismiss()
      console.error('Image upload error:', error)
      toast.error('Image upload failed: ' + (error.message || 'Unknown error'))
    }
  }

  // Also add a function to remove individual images
  const removeImage = (colorIndex, imageIndex) => {
    const newColors = [...form.colors]
    newColors[colorIndex].images = newColors[colorIndex].images.filter((_, index) => index !== imageIndex)
    setForm(f => ({ ...f, colors: newColors }))
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    if (!form.colors.length) {
      toast.error('At least one color must be provided')
      return
    }

    const hasValidColor = form.colors.some(color => 
      color.colorName.trim() && 
      color.sizeStock.some(sizeStock => sizeStock.size.trim() && sizeStock.stock > 0)
    )

    if (!hasValidColor) {
      toast.error('At least one color with size and stock must be provided')
      return
    }

    try {
      // Prepare payload
      const colorsData = form.colors.map(color => ({
        colorName: color.colorName,
        colorHex: color.colorHex,
        images: color.images, // Images are already uploaded URLs
        sizeStock: color.sizeStock
          .filter(ss => ss.size.trim() && ss.stock > 0)
          .map(ss => ({
            size: ss.size.toLowerCase(),
            stock: parseInt(ss.stock)
          }))
      }))

      const payload = {
        name: form.name,
        code: form.code,
        category: form.category,
        subcategory: form.subcategory || undefined,
        subcategories: form.subcategories.length > 0 ? form.subcategories : undefined,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        description: form.description,
        sizeChart: form.sizeChart || undefined,
        tags: typeof form.tags === 'string' ? 
          form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
          form.tags || [],
        colors: colorsData
      }

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined) {
          delete payload[key]
        }
      })

      if (editing) {
        dispatch(updateProduct({ id: editing._id, productData: payload }))
      } else {
        dispatch(createProduct(payload))
      }
    } catch (error) {
      toast.error('Error processing request: ' + error.message)
    }
  }

  const handleEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name,
      code: p.code,
      category: p.category,
      subcategory: p.subcategory,
      subcategories: p.subcategories || [],
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
      description: p.description,
      sizeChart: p.sizeChart || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      colors: p.colors.map(color => ({
        colorName: color.colorName,
        colorHex: color.colorHex,
        images: color.images || [], // Existing images
        sizeStock: color.sizeStock.map(ss => ({
          size: ss.size,
          stock: ss.stock.toString()
        }))
      }))
    })
    setShowModal(true)
  }

  const handleAddNew = () => {
    setShowModal(true)
    setEditing(null)
    initializeForm()
  }

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    const q = search.toLowerCase()
    const matchSearch = p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    
    // For subcategory filtering, check both subcategories array and legacy subcategory field
    const productSubIds = p.subcategories 
      ? p.subcategories.map(sub => sub._id || sub)
      : p.subcategory 
        ? [p.subcategory]
        : []
    
    const matchSub = subcategoryFilter === 'All' || (
      productSubIds.length > 0 && productSubIds.includes(subcategoryFilter)
    )
    
    return matchCat && matchSub && matchSearch
  })

  const getName = (list, id) => list.find(x => x._id === id)?.name || 'Unknown'

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="p-6 space-y-8">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Product Management</h1>
              <p className="text-pink-100">Manage your product inventory with style</p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center bg-white text-pink-600 px-6 py-3 rounded-xl hover:bg-pink-50 transition-all duration-200 shadow-lg font-medium"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Enhanced Filters Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 h-5 w-5" />
              <input
                placeholder="Search products by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-2 border-pink-200 px-12 py-3 rounded-xl w-full focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white/80 placeholder-pink-300"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setSubcategoryFilter('All') }}
              className="border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 bg-white/80 min-w-[180px]"
            >
              <option value="All">All Categories</option>
              {categories.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <select
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              disabled={categoryFilter === 'All'}
              className="border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 bg-white/80 disabled:bg-gray-100 min-w-[200px]"
            >
              <option value="All">All Subcategories</option>
              {subCategories.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-3 rounded-xl transition-all duration-200 ${
              viewMode === 'grid' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg' 
                : 'bg-white/70 border border-pink-200 text-pink-600 hover:bg-pink-50'
            }`}
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-3 rounded-xl transition-all duration-200 ${
              viewMode === 'list' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg' 
                : 'bg-white/70 border border-pink-200 text-pink-600 hover:bg-pink-50'
            }`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
              <Loader2 className="animate-spin text-3xl text-pink-500 mx-auto mb-4" />
              <span className="text-pink-600 font-medium">Loading products...</span>
            </div>
          </div>
        )}

        {/* Products Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => {
              const firstColor = p.colors?.[0] || {}
              const stock = firstColor.sizeStock?.reduce((sum, s) => sum + s.stock, 0) || 0
              const img = firstColor.images?.[0] || null
              return (
                <div key={p._id} className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 hover:border-pink-200">
                  <div className="h-56 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center relative overflow-hidden">
                    {img ? (
                      <img src={img} alt={p.name} className="object-cover h-full w-full transition-transform duration-300 hover:scale-105" />
                    ) : (
                      <div className="text-center">
                        <Package className="text-pink-300 h-16 w-16 mx-auto mb-2" />
                        <span className="text-pink-400 text-sm">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-xl text-gray-800 truncate">{p.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p className="flex items-center"><span className="font-medium text-pink-600">Code:</span> <span className="ml-2">{p.code}</span></p>
                      <p className="flex items-center"><span className="font-medium text-pink-600">Category:</span> <span className="ml-2 truncate">{getName(categories, p.category)}</span></p>
                      <p className="flex items-center gap-1">
                        <span className="font-medium text-pink-600">Subcategories:</span>
                        <div className="flex flex-wrap gap-1 ml-2">
                          {p.subcategories ? (
                            p.subcategories.map(sub => (
                              <span key={sub._id || sub} className="inline-block px-2 py-0.5 bg-pink-50 text-pink-700 rounded-full text-xs border border-pink-100">
                                {getName(subCategories, sub._id || sub)}
                              </span>
                            ))
                          ) : p.subcategory ? (
                            <span className="inline-block px-2 py-0.5 bg-pink-50 text-pink-700 rounded-full text-xs border border-pink-100">
                              {getName(subCategories, p.subcategory)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">None</span>
                          )}
                        </div>
                      </p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-pink-100">
                      <span className="text-2xl font-bold text-gray-800">₹{p.price}</span>
                      <div className="flex items-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stock > 10 ? 'bg-green-100 text-green-700' : stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          Stock: {stock}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => handleEdit(p)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 shadow-md font-medium"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </button>
                      <button
                        onClick={() => toast.success('Delete functionality to be implemented')}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-xl hover:from-red-500 hover:to-pink-500 transition-all duration-200 shadow-md font-medium"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-pink-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-500 to-rose-400 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Code</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Subcategories</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {filtered.map((p, index) => {
                    const stock = p.colors?.[0]?.sizeStock?.reduce((s, i) => s + i.stock, 0) || 0
                    return (
                      <tr key={p._id} className={`hover:bg-pink-50 transition-colors duration-200 ${index % 2 === 0 ? 'bg-white/50' : 'bg-pink-50/30'}`}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{p.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getName(categories, p.category)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {p.subcategories ? (
                              p.subcategories.map(sub => (
                                <span key={sub._id || sub} className="inline-block px-2 py-0.5 bg-pink-50 text-pink-700 rounded-full text-xs border border-pink-100">
                                  {getName(subCategories, sub._id || sub)}
                                </span>
                              ))
                            ) : p.subcategory ? (
                              <span className="inline-block px-2 py-0.5 bg-pink-50 text-pink-700 rounded-full text-xs border border-pink-100">
                                {getName(subCategories, p.subcategory)}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-lg text-gray-800">₹{p.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${stock > 10 ? 'bg-green-100 text-green-700' : stock > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                            {stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleEdit(p)}
                              className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-200"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => toast.success('Delete functionality to be implemented')}
                              className="p-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-lg hover:from-red-500 hover:to-pink-500 transition-all duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-auto shadow-2xl border border-pink-200">
              <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-8 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white">{editing ? 'Edit Product' : 'Create New Product'}</h2>
                    <p className="text-pink-100 mt-1">Fill in the product details below</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Basic Information */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <Package className="mr-3 text-pink-500" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Product Name *</label>
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleInput}
                        placeholder="Enter product name"
                        className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Product Code *</label>
                      <input
                        name="code"
                        value={form.code}
                        onChange={handleInput}
                        placeholder="Enter product code"
                        className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Category *</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleInput}
                        className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    {/* Subcategories Multi-select */}
                      {form.category && subCategories.length > 0 && (
                        <div className="col-span-2">
                          <label className="block text-sm font-bold mb-2 text-gray-700">
                            Subcategories <span className="text-gray-400">(Optional)</span>
                          </label>
                          <div className="space-y-3">
                            <select
                              multiple
                              value={form.subcategories}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value);
                                setForm(f => ({ ...f, subcategories: selected }));
                              }}
                              className="w-full p-3 border-2 border-pink-200 rounded-xl focus:ring-2 focus:ring-pink-300 bg-white min-h-[120px]"
                            >
                              {subCategories.map(sub => (
                                <option key={sub._id} value={sub._id}>
                                  {sub.name}
                                </option>
                              ))}
                            </select>
                            
                            {/* Selected subcategories display */}
                            {form.subcategories.length > 0 && (
                              <div className="flex flex-wrap gap-2 p-3 bg-pink-50 rounded-xl border border-pink-100">
                                <div className="w-full text-sm font-medium text-gray-700 mb-1">Selected Subcategories:</div>
                                {form.subcategories.map(subId => {
                                  const sub = subCategories.find(s => s._id === subId);
                                  return sub ? (
                                    <div 
                                      key={sub._id}
                                      className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-pink-200"
                                    >
                                      <span className="text-sm text-gray-700">{sub.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setForm(f => ({
                                            ...f,
                                            subcategories: f.subcategories.filter(id => id !== sub._id)
                                          }));
                                        }}
                                        className="ml-1 text-pink-400 hover:text-pink-600"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  ) : null;
                                })}
                              </div>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-gray-500">
                            Hold Ctrl (Windows) or Cmd (Mac) to select multiple subcategories
                          </p>
                        </div>
                      )}
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Price *</label>
                      <input
                        name="price"
                        type="number"
                        value={form.price}
                        onChange={handleInput}
                        placeholder="Enter price"
                        className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                        required
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Original Price</label>
                      <input
                        name="originalPrice"
                        type="number"
                        value={form.originalPrice}
                        onChange={handleInput}
                        placeholder="Enter original price"
                        className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <label className="block text-sm font-bold mb-2 text-gray-700">Description *</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInput}
                      placeholder="Enter product description"
                      rows="4"
                      className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white resize-none"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Size Chart URL</label>
                      <input
                        name="sizeChart"
                        value={form.sizeChart}
                        onChange={handleInput}
                        placeholder="Enter size chart URL"
                        className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2 text-gray-700">Tags</label>
                      <input
                        name="tags"
                        value={form.tags}
                        onChange={handleInput}
                        placeholder="tag1, tag2, tag3"
                        className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Colors Section */}
                <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-pink-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mr-3"></div>
                      Colors & Inventory
                    </h3>
                    <button
                      type="button"
                      onClick={addColor}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-200 shadow-md font-medium"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Color
                    </button>
                  </div>

                  {form.colors.map((color, colorIndex) => (
                    <div key={colorIndex} className="bg-white rounded-2xl p-6 mb-6 shadow-md border border-pink-100">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-lg text-gray-800 flex items-center">
                          <div 
                            className="w-5 h-5 rounded-full mr-3 border-2 border-gray-300"
                            style={{ backgroundColor: color.colorHex }}
                          ></div>
                          Color {colorIndex + 1}
                        </h4>
                        {form.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeColor(colorIndex)}
                            className="p-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-lg hover:from-red-500 hover:to-pink-500 transition-all duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-bold mb-2 text-gray-700">Color Name *</label>
                          <input
                            value={color.colorName}
                            onChange={(e) => handleColorChange(colorIndex, 'colorName', e.target.value)}
                            placeholder="e.g., Red, Blue"
                            className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 text-gray-700">Color Code</label>
                          <div className="relative">
                            <input
                              type="color"
                              value={color.colorHex}
                              onChange={(e) => handleColorChange(colorIndex, 'colorHex', e.target.value)}
                              className="w-full border-2 border-pink-200 rounded-xl h-12 cursor-pointer"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600 pointer-events-none">
                              {color.colorHex}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold mb-2 text-gray-700">Images</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(colorIndex, e.target.files)}
                            className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                          />
                          
                          {/* Display existing images */}
                          {color.images && color.images.length > 0 && (
                            <div className="mt-4">
                              <div className="text-sm font-medium text-gray-700 mb-3">
                                {color.images.filter(img => typeof img === 'string').length} image(s) uploaded
                              </div>
                              <div className="flex flex-wrap gap-3">
                                {color.images.map((image, imageIndex) => {
                                  // Only display valid string URLs
                                  if (typeof image !== 'string') return null
                                  
                                  return (
                                    <div key={imageIndex} className="relative group">
                                      <img 
                                        src={image} 
                                        alt={`Color ${colorIndex + 1} - Image ${imageIndex + 1}`}
                                        className="w-20 h-20 object-cover rounded-xl border-2 border-pink-200 shadow-sm"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeImage(colorIndex, imageIndex)}
                                        className="absolute -top-2 -right-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-all duration-200 font-bold shadow-md"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Size & Stock */}
                      <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-4">
                          <label className="block text-sm font-bold text-gray-700">Size & Stock Management</label>
                          <button
                            type="button"
                            onClick={() => addSizeStock(colorIndex)}
                            className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-lg text-sm hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-md font-medium"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Size
                          </button>
                        </div>
                        {color.sizeStock.map((sizeStock, sizeIndex) => (
                          <div key={sizeIndex} className="flex gap-3 mb-3 items-center bg-white rounded-lg p-3 shadow-sm">
                            <input
                              value={sizeStock.size}
                              onChange={(e) => handleSizeStockChange(colorIndex, sizeIndex, 'size', e.target.value)}
                              placeholder="Size (S, M, L, XL)"
                              className="flex-1 border-2 border-pink-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 bg-white"
                              required
                            />
                            <input
                              type="number"
                              value={sizeStock.stock}
                              onChange={(e) => handleSizeStockChange(colorIndex, sizeIndex, 'stock', e.target.value)}
                              placeholder="Stock quantity"
                              className="flex-1 border-2 border-pink-200 px-3 py-2 rounded-lg focus:ring-2 focus:ring-pink-300 bg-white"
                              min="0"
                              required
                            />
                            {color.sizeStock.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeSizeStock(colorIndex, sizeIndex)}
                                className="p-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-lg hover:from-red-500 hover:to-pink-500 transition-all duration-200"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t-2 border-pink-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 border-2 border-pink-300 text-pink-600 rounded-xl hover:bg-pink-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl hover:from-pink-600 hover:to-rose-500 disabled:opacity-50 transition-all duration-200 shadow-lg font-medium"
                  >
                    {loading && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                    {editing ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}