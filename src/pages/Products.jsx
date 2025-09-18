import React, { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Package,
  AlertCircle,
  TrendingUp,
  Eye,
  Star,
  MoreHorizontal,
  ArrowUpDown,
  Grid3X3,
  List,
  Tag,
  X,
  Upload,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

const mockProducts = [
  {
    id: 1,
    image: '', // placeholder
    name: 'Lace Bralette Set',
    code: 'LBSET001',
    category: 'Bras & Bralettes',
    subcategory: 'Lace Collection',
    price: 2499,
    originalPrice: 3299,
    stock: 45,
    status: 'Active',
    rating: 4.8,
    sales: 145,
    colors: ['Pink', 'Black', 'White'],
    sizes: ['S', 'M', 'L', 'XL'],
    sizeStock: {"S": 10, "M": 15, "L": 12, "XL": 8},
    tags: ['women', 'summer'],
    description: 'Elegant lace bralette set'
  },
  {
    id: 2,
    image: '',
    name: 'Silk Nightgown',
    code: 'SNIGHT002',
    category: 'Nightwear',
    subcategory: 'Premium Collection',
    price: 3999,
    originalPrice: 4999,
    stock: 12,
    status: 'Active',
    rating: 4.9,
    sales: 98,
    colors: ['Rose', 'Champagne', 'Navy'],
    sizes: ['XS', 'S', 'M', 'L'],
    sizeStock: {"XS": 2, "S": 3, "M": 4, "L": 3},
    tags: ['women', 'luxury'],
    description: 'Luxurious silk nightgown'
  },
  {
    id: 3,
    image: '',
    name: 'Cotton Comfort Panty',
    code: 'CPANT003',
    category: 'Panties & Underwear',
    subcategory: 'Everyday Essentials',
    price: 899,
    originalPrice: 1199,
    stock: 5,
    status: 'Low Stock',
    rating: 4.6,
    sales: 234,
    colors: ['White', 'Nude', 'Black'],
    sizes: ['S', 'M', 'L'],
    sizeStock: {"S": 1, "M": 2, "L": 2},
    tags: ['women', 'comfort'],
    description: 'Comfortable cotton panty'
  },
  {
    id: 4,
    image: '',
    name: 'Premium Shapewear',
    code: 'PSHAPE004',
    category: 'Shapewear',
    subcategory: 'Body Shapers',
    price: 4299,
    originalPrice: 5199,
    stock: 0,
    status: 'Out of Stock',
    rating: 4.7,
    sales: 67,
    colors: ['Nude', 'Black'],
    sizes: ['M', 'L', 'XL'],
    sizeStock: {"M": 0, "L": 0, "XL": 0},
    tags: ['women', 'shapewear'],
    description: 'Premium quality shapewear'
  }
]

const categories = {
  'Bras & Bralettes': ['Lace Collection', 'Sports Bras', 'Everyday Comfort', 'Push-up', 'Strapless'],
  'Panties & Underwear': ['Everyday Essentials', 'Lace Collection', 'Seamless', 'Cotton Comfort'],
  'Nightwear': ['Premium Collection', 'Cotton Comfort', 'Silk & Satin', 'Robes'],
  'Shapewear': ['Body Shapers', 'Waist Trainers', 'Full Body', 'Tummy Control']
}

export default function Products() {
  const [products, setProducts] = useState(mockProducts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [viewMode, setViewMode] = useState('table')
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    sizeStock: {},
    price: '',
    originalPrice: '',
    tags: '',
    images: null,
    description: '',
    code: '',
    sizeChart: ''
  })

  const statuses = ['All', 'Active', 'Low Stock', 'Out of Stock']

  const filtered = products.filter(p =>
    (categoryFilter === 'All' || p.category === categoryFilter) &&
    (statusFilter === 'All' || p.status === statusFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
      case 'Low Stock':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200'
      case 'Out of Stock':
        return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStockLevel = (stock) => {
    if (stock === 0) return 'text-red-600'
    if (stock <= 10) return 'text-yellow-600'
    return 'text-green-600'
  }

  const handleDelete = (id, name) => {
    setProducts(prev => prev.filter(x => x.id !== id))
    toast.success(`${name} deleted successfully`)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSizeStockChange = (size, stock) => {
    setFormData(prev => ({
      ...prev,
      sizeStock: { ...prev.sizeStock, [size]: parseInt(stock) || 0 }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Calculate total stock
    const totalStock = Object.values(formData.sizeStock).reduce((sum, stock) => sum + stock, 0)
    
    // Create new product
    const newProduct = {
      id: Date.now(),
      name: formData.name,
      category: formData.category,
      subcategory: formData.subcategory,
      price: parseFloat(formData.price),
      originalPrice: parseFloat(formData.originalPrice),
      stock: totalStock,
      status: totalStock === 0 ? 'Out of Stock' : totalStock <= 10 ? 'Low Stock' : 'Active',
      rating: 0,
      sales: 0,
      colors: [],
      sizes: Object.keys(formData.sizeStock),
      sizeStock: formData.sizeStock,
      tags: formData.tags.split(',').map(tag => tag.trim()),
      description: formData.description,
      code: formData.code,
      image: ''
    }
    
    setProducts(prev => [...prev, newProduct])
    toast.success('Product added successfully!')
    setShowAddModal(false)
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      sizeStock: {},
      price: '',
      originalPrice: '',
      tags: '',
      images: null,
      description: '',
      code: '',
      sizeChart: ''
    })
  }

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

  const ProductCard = ({ product }) => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 group">
      <div className="relative mb-4">
        <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center overflow-hidden">
          <Package size={48} className="text-pink-400" />
        </div>
        <div className="absolute top-3 right-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(product.status)}`}>
            {product.status}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 font-medium">{product.code}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
            {product.category}
          </span>
          <div className="flex items-center space-x-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{product.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Stock</p>
            <p className={`font-bold ${getStockLevel(product.stock)}`}>{product.stock}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <TrendingUp size={14} className="text-green-500" />
            <span className="text-sm font-medium text-gray-700">{product.sales} sold</span>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200">
              <Eye size={16} />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
              <Edit size={16} />
            </button>
            <button 
              onClick={() => handleDelete(product.id, product.name)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50/50 to-pink-50/20 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-gray-800 to-pink-600 bg-clip-text text-transparent">
            Products Management
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <Package size={18} className="text-pink-400" />
            Manage your product inventory and details
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-white/80 rounded-xl border border-gray-200 shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-3 rounded-l-xl transition-all duration-200 ${
                viewMode === 'table' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List size={18} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-r-xl transition-all duration-200 ${
                viewMode === 'grid' 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid3X3 size={18} />
            </button>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-semibold"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Products</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Package size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Active Products</p>
              <p className="text-3xl font-bold text-emerald-600 mt-1">{products.filter(p => p.status === 'Active').length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{products.filter(p => p.status === 'Low Stock').length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center">
              <AlertCircle size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{products.filter(p => p.status === 'Out of Stock').length}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
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
              placeholder="Search products by name, code, or category..."
              className="w-full pl-12 pr-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 text-sm placeholder-gray-500 transition-all duration-200"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 text-sm font-medium min-w-48"
          >
            <option value="All">All Categories</option>
            {Object.keys(categories).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 text-sm font-medium min-w-40"
          >
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product, index) => (
            <div key={product.id} style={{ animationDelay: `${index * 0.1}s` }} className="animate-slide-up">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50/80 to-pink-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Product</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Code</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Category</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Price</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Stock</th>
                  <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Status</th>
                  <th className="text-center py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className="hover:bg-pink-50/30 transition-all duration-200 border-b border-gray-50/50 group"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package size={20} className="text-pink-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{product.name}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Star size={12} className="text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">{product.rating}</span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">{product.sales} sold</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{product.code}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                        {product.category}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <span className="font-bold text-gray-900">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold ${getStockLevel(product.stock)}`}>{product.stock}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(product.status)}`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-2 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-all duration-200">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200">
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.name)}
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
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-pink-50 to-rose-50">
              <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/80 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400"
                    placeholder="Product name"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400"
                  >
                    <option value="">Select category</option>
                    {Object.keys(categories).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                {formData.category && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory *</label>
                    <select
                      name="subcategory"
                      value={formData.subcategory}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400"
                    >
                      <option value="">Select subcategory</option>
                      {categories[formData.category]?.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Code */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Code *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400"
                    placeholder="PDW352"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400"
                    placeholder="1000"
                  />
                </div>

                {/* Original Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Original Price *</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400"
                    placeholder="1700"
                  />
                </div>

                {/* Tags */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400"
                    placeholder='["women", "summer"] - comma separated'
                  />
                </div>

                {/* Size Stock */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Size Stock *</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {availableSizes.map(size => (
                      <div key={size} className="relative">
                        <label className="block text-xs font-medium text-gray-600 mb-1">{size}</label>
                        <input
                          type="number"
                          value={formData.sizeStock[size] || ''}
                          onChange={(e) => handleSizeStockChange(size, e.target.value)}
                          className="w-full px-3 py-2 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 text-sm"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Images</label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.files }))}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex items-center justify-center w-full px-4 py-8 bg-white/80 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-400 cursor-pointer transition-colors"
                    >
                      <div className="text-center">
                        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                    </label>
                    {formData.images && (
                      <p className="mt-2 text-sm text-gray-600">
                        {formData.images.length} file(s) selected
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 resize-none"
                    placeholder="Stylish and natural blend..."
                  />
                </div>

                {/* Size Chart URL */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Size Chart URL</label>
                  <input
                    type="url"
                    name="sizeChart"
                    value={formData.sizeChart}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400"
                    placeholder="https://size-chart.com"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-semibold"
                >
                  <Check size={18} />
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}