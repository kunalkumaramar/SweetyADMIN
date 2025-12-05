import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Plus, Edit, Trash2, Search, Package, AlertCircle, TrendingUp, Eye, Grid3X3, List, Check, Loader2, X, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { createProduct, updateProduct, getProducts, uploadColorImage, addProductSubcategories, deleteProductSubcategory, filterProductsBySubcategories, deleteProduct, clearSuccess, clearError } from '../redux/productSlice'
import { getCategories } from '../redux/categorySlice'
import { getSubCategoriesByCategory } from '../redux/subcategorySlice'

export default function Products() {
  const dispatch = useDispatch()
  const { products = [], pagination = {}, loading, error, success, createdProduct, updatedProduct, uploadedImages = [] } = useSelector(state => state.product || {})
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
    subheading: '',
    code: '',
    category: '',
    subcategory: '',
    subcategories: [],
    price: '',
    originalPrice: '',
    description: '',
    specifications: [],
    sizeChart: '',
    tags: '',
    hsn: '', // Added HSN field
    colors: [{
      colorName: '',
      colorHex: '#000000',
      images: [],
      sizeStock: [{ size: '', stock: 0 }]
    }]
  })

  const initializeForm = () => {
    setForm({
      name: '',
      subheading: '',
      code: '',
      category: '',
      subcategory: '',
      subcategories: [],
      price: '',
      originalPrice: '',
      description: '',
      specifications: [],
      sizeChart: '',
      tags: '',
      hsn: '', // Added HSN field
      colors: [{
        colorName: '',
        colorHex: '#000000',
        images: [],
        sizeStock: [{ size: '', stock: 0 }]
      }]
    })
  }

  useEffect(() => {
    dispatch(getProducts({ page: 1, limit: 100 }))
    dispatch(getCategories())
  }, [dispatch])

  useEffect(() => {
    if (form.category && form.category !== '') {
      dispatch(getSubCategoriesByCategory(form.category))
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
      dispatch(getProducts({ page: 1, limit: 50 }))
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
    if (name === 'category') {
      setForm(f => ({
        ...f,
        [name]: value,
        subcategory: '',
        subcategories: []
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

  const addSpecification = () => {
    setForm(f => ({
      ...f,
      specifications: [
        ...f.specifications,
        { label: '', description: '', order: f.specifications.length + 1 }
      ]
    }))
  }

  const removeSpecification = (specIndex) => {
    const newSpecs = form.specifications.filter((_, index) => index !== specIndex)
    const reorderedSpecs = newSpecs.map((spec, index) => ({ ...spec, order: index + 1 }))
    setForm(f => ({ ...f, specifications: reorderedSpecs }))
  }

  const handleSpecificationChange = (specIndex, field, value) => {
    const newSpecs = [...form.specifications]
    newSpecs[specIndex] = { ...newSpecs[specIndex], [field]: value }
    setForm(f => ({ ...f, specifications: newSpecs }))
  }

  const moveSpecification = (specIndex, direction) => {
    const newSpecs = [...form.specifications]
    const targetIndex = direction === 'up' ? specIndex - 1 : specIndex + 1
    if (targetIndex < 0 || targetIndex >= newSpecs.length) return
    [newSpecs[specIndex], newSpecs[targetIndex]] = [newSpecs[targetIndex], newSpecs[specIndex]]
    newSpecs[specIndex].order = specIndex + 1
    newSpecs[targetIndex].order = targetIndex + 1
    setForm(f => ({ ...f, specifications: newSpecs }))
  }

  const handleImageUpload = async (colorIndex, files) => {
    if (!files || files.length === 0) return
    try {
      toast.loading('Uploading images...')
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append('image', file)
        const result = await dispatch(uploadColorImage(formData)).unwrap()
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          return result.data[0]
        }
        return result.imageUrl || result.url || result
      })
      const imageUrls = await Promise.all(uploadPromises)
      const validImageUrls = imageUrls.filter(url => typeof url === 'string' && url.trim())
      if (validImageUrls.length > 0) {
        const newColors = [...form.colors]
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

  const removeImage = (colorIndex, imageIndex) => {
    const newColors = [...form.colors]
    newColors[colorIndex].images = newColors[colorIndex].images.filter((_, index) => index !== imageIndex)
    setForm(f => ({ ...f, colors: newColors }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
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
      const colorsData = form.colors.map(color => ({
        colorName: color.colorName,
        colorHex: color.colorHex,
        images: color.images,
        sizeStock: color.sizeStock
          .filter(ss => ss.size.trim() && ss.stock > 0)
          .map(ss => ({
            size: ss.size.toLowerCase(),
            stock: parseInt(ss.stock)
          }))
      }))

      const payload = {
        name: form.name,
        subheading: form.subheading || undefined,
        code: form.code,
        category: form.category,
        subcategory: form.subcategory || undefined,
        subcategories: form.subcategories.length > 0 ? form.subcategories : undefined,
        price: parseFloat(form.price),
        originalPrice: form.originalPrice ? parseFloat(form.originalPrice) : undefined,
        description: form.description,
        specifications: form.specifications.length > 0 ? form.specifications : undefined,
        sizeChart: form.sizeChart || undefined,
        tags: typeof form.tags === 'string' ? form.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : form.tags || [],
        hsn: form.hsn && form.hsn.trim() !== '' ? Number(form.hsn) : undefined, // Added HSN field
        colors: colorsData
      }

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
      subheading: p.subheading || '',
      code: p.code,
      category: p.category,
      subcategory: p.subcategory,
      subcategories: p.subcategories || [],
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : '',
      description: p.description,
      specifications: p.specifications || [],
      sizeChart: p.sizeChart || '',
      tags: Array.isArray(p.tags) ? p.tags.join(', ') : '',
      hsn: p.hsn ? String(p.hsn) : '', // Added HSN field
      colors: p.colors.map(color => ({
        colorName: color.colorName,
        colorHex: color.colorHex,
        images: color.images || [],
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) return
    try {
      await dispatch(deleteProduct(id)).unwrap()
      toast.success('Product deleted successfully!')
      dispatch(getProducts({ page: 1, limit: 50 }))
    } catch (error) {
      toast.error('Failed to delete product: ' + (error.message || 'Unknown error'))
    }
  }

  const filtered = products.filter(p => {
    const matchCat = categoryFilter === 'All' || p.category === categoryFilter
    const q = search.toLowerCase()
    const matchSearch = p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
    const productSubIds = p.subcategories ? p.subcategories.map(sub => sub._id || sub) : p.subcategory ? [p.subcategory] : []
    const matchSub = subcategoryFilter === 'All' || (productSubIds.length > 0 && productSubIds.includes(subcategoryFilter))
    return matchCat && matchSub && matchSearch
  })

  const getName = (list, id) => list.find(x => x._id === id)?.name || 'Unknown'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Package className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">Product Management</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Manage your product inventory with style
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Products</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Categories</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Grid3X3 size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Low Stock</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {products.filter(p => {
                    const stock = p.colors?.reduce((sum, c) => sum + c.sizeStock.reduce((s, ss) => s + ss.stock, 0), 0)
                    return stock < 10
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center">
                <AlertCircle size={24} className="text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Value</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  ₹{products.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 flex flex-col sm:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[160px]"
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>

              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[160px]"
                value={subcategoryFilter}
                onChange={e => setSubcategoryFilter(e.target.value)}
              >
                <option value="All">All Subcategories</option>
                {subCategories.map(sub => (
                  <option key={sub._id} value={sub._id}>{sub.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? <List size={20} /> : <Grid3X3 size={20} />}
              </button>
              <button
                onClick={handleAddNew}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={48} className="animate-spin text-purple-500" />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => {
              const stock = p.colors?.reduce((sum, c) => sum + c.sizeStock.reduce((s, ss) => s + ss.stock, 0), 0) || 0
              return (
                <div
                  key={p._id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 group"
                >
                  <div className="space-y-4">
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100 rounded-xl overflow-hidden">
                      {p.colors?.[0]?.images?.[0] ? (
                        <img
                          src={p.colors[0].images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={48} className="text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 bg-white/90 hover:bg-blue-500 hover:text-white rounded-lg transition-all"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="p-2 bg-white/90 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{p.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">Code: {p.code}</p>
                      {p.hsn && (
                        <p className="text-sm text-gray-600 mb-2">HSN: {p.hsn}</p>
                      )}
                      <p className="text-sm text-gray-600 mb-2">
                        Category: {getName(categories, p.category)}
                      </p>
                      {p.subcategories && p.subcategories.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-500 mb-1">Subcategories:</p>
                          <div className="flex flex-wrap gap-1">
                            {p.subcategories.map((sub, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
                              >
                                {getName(subCategories, sub._id || sub)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Price & Stock */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-2xl font-bold text-purple-600">₹{p.price}</p>
                        {p.originalPrice && (
                          <p className="text-sm text-gray-500 line-through">₹{p.originalPrice}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">Stock</p>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          stock > 10 ? 'bg-green-100 text-green-700' :
                          stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HSN</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategories</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filtered.map(p => {
                    const stock = p.colors?.reduce((sum, c) => sum + c.sizeStock.reduce((s, ss) => s + ss.stock, 0), 0) || 0
                    return (
                      <tr key={p._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              {p.colors?.[0]?.images?.[0] ? (
                                <img className="h-10 w-10 rounded-full object-cover" src={p.colors[0].images[0]} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <Package size={20} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{p.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.hsn || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getName(categories, p.category)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {p.subcategories && p.subcategories.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {p.subcategories.map((sub, idx) => (
                                <span key={idx} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                                  {getName(subCategories, sub._id || sub)}
                                </span>
                              ))}
                            </div>
                          ) : p.subcategory ? (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                              {getName(subCategories, p.subcategory)}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{p.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            stock > 10 ? 'bg-green-100 text-green-700' :
                            stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {stock}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(p)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl flex flex-col my-8">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editing ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditing(null)
                    initializeForm()
                  }}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <p className="text-gray-600 text-sm mb-4">Fill in the product details below</p>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleInput}
                        required
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="Enter product name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Product Code *</label>
                      <input
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleInput}
                        required
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="Enter product code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subheading</label>
                      <input
                        type="text"
                        name="subheading"
                        value={form.subheading}
                        onChange={handleInput}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="Enter subheading"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">HSN Code (optional)</label>
                      <input
                        type="number"
                        name="hsn"
                        value={form.hsn}
                        onChange={handleInput}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="Enter HSN code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                      <select
                        name="category"
                        value={form.category}
                        onChange={handleInput}
                        required
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
                      <select
                        name="subcategory"
                        value={form.subcategory}
                        onChange={handleInput}
                        disabled={!form.category}
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">Select Subcategory</option>
                        {subCategories.map(sub => (
                          <option key={sub._id} value={sub._id}>{sub.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleInput}
                        required
                        step="0.01"
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="Enter price"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price</label>
                      <input
                        type="number"
                        name="originalPrice"
                        value={form.originalPrice}
                        onChange={handleInput}
                        step="0.01"
                        className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="Enter original price"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleInput}
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 resize-none"
                      placeholder="Enter product description"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      name="tags"
                      value={form.tags}
                      onChange={handleInput}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                      placeholder="e.g., summer, casual, trending"
                    />
                  </div>

                  {/* Specifications */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-semibold text-gray-700">Specifications</label>
                      <button
                        type="button"
                        onClick={addSpecification}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                      >
                        + Add Specification
                      </button>
                    </div>
                    <div className="space-y-3">
                      {form.specifications.map((spec, specIdx) => (
                        <div key={specIdx} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg">
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={spec.label}
                              onChange={(e) => handleSpecificationChange(specIdx, 'label', e.target.value)}
                              placeholder="Label (e.g., Material)"
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                            />
                            <input
                              type="text"
                              value={spec.description}
                              onChange={(e) => handleSpecificationChange(specIdx, 'description', e.target.value)}
                              placeholder="Description (e.g., 100% Cotton)"
                              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              onClick={() => moveSpecification(specIdx, 'up')}
                              disabled={specIdx === 0}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSpecification(specIdx, 'down')}
                              disabled={specIdx === form.specifications.length - 1}
                              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                            >
                              ↓
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSpecification(specIdx)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Size Chart */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Size Chart (optional)</label>
                    <textarea
                      name="sizeChart"
                      value={form.sizeChart}
                      onChange={handleInput}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400 resize-none"
                      placeholder="Enter size chart information"
                    />
                  </div>

                  {/* Colors Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Color Variants *</h3>
                      <button
                        type="button"
                        onClick={addColor}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium"
                      >
                        + Add Color
                      </button>
                    </div>

                    {form.colors.map((color, colorIdx) => (
                      <div key={colorIdx} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-700">Color {colorIdx + 1}</h4>
                          {form.colors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColor(colorIdx)}
                              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              Remove Color
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color Name *</label>
                            <input
                              type="text"
                              value={color.colorName}
                              onChange={(e) => handleColorChange(colorIdx, 'colorName', e.target.value)}
                              required
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                              placeholder="e.g., Navy Blue"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color Hex</label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={color.colorHex}
                                onChange={(e) => handleColorChange(colorIdx, 'colorHex', e.target.value)}
                                className="w-16 h-10 border border-gray-200 rounded-lg cursor-pointer"
                              />
                              <input
                                type="text"
                                value={color.colorHex}
                                onChange={(e) => handleColorChange(colorIdx, 'colorHex', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                                placeholder="#000000"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Image Upload */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(colorIdx, e.target.files)}
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                          />
                          {color.images.length > 0 && (
                            <div className="mt-3 grid grid-cols-4 gap-2">
                              {color.images.map((img, imgIdx) => (
                                <div key={imgIdx} className="relative group">
                                  <img
                                    src={img}
                                    alt={`Preview ${imgIdx}`}
                                    className="w-full h-20 object-cover rounded-lg border border-gray-200"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeImage(colorIdx, imgIdx)}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Size & Stock */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Size & Stock *</label>
                            <button
                              type="button"
                              onClick={() => addSizeStock(colorIdx)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                            >
                              + Add Size
                            </button>
                          </div>
                          <div className="space-y-2">
                            {color.sizeStock.map((ss, ssIdx) => (
                              <div key={ssIdx} className="flex gap-2">
                                <input
                                  type="text"
                                  value={ss.size}
                                  onChange={(e) => handleSizeStockChange(colorIdx, ssIdx, 'size', e.target.value)}
                                  required
                                  placeholder="Size (e.g., M, L, XL)"
                                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                                />
                                <input
                                  type="number"
                                  value={ss.stock}
                                  onChange={(e) => handleSizeStockChange(colorIdx, ssIdx, 'stock', e.target.value)}
                                  required
                                  min="0"
                                  placeholder="Stock"
                                  className="w-24 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                                />
                                {color.sizeStock.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeSizeStock(colorIdx, ssIdx)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                  >
                                    <X size={16} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl flex-shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditing(null)
                    initializeForm()
                  }}
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
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Processing...' : (editing ? 'Update Product' : 'Create Product')}
                  {!loading && <Check size={18} />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
