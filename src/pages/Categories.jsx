import React, { useState } from 'react'
import { Plus, Edit, Trash2, Filter, Search, Package, Tag, Calendar, Hash, BarChart3, X } from 'lucide-react'

const Categories = () => {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'Bras & Bralettes',
      description: 'Comfortable and stylish bras for everyday wear',
      subcategories: ['Push-up Bras', 'Sports Bras', 'Wireless Bras', 'Lace Bralettes'],
      status: 'Active',
      hsn: '61083100',
      created: '2025-09-01',
      updated: '2025-09-15'
    },
    {
      id: 2,
      name: 'Panties & Underwear',
      description: 'Premium collection of comfortable undergarments',
      subcategories: ['Bikini', 'Briefs', 'Thongs', 'Boyshorts'],
      status: 'Active',
      hsn: '61083200',
      created: '2025-09-01',
      updated: '2025-09-10'
    },
    {
      id: 3,
      name: 'Nightwear',
      description: 'Elegant sleepwear and nightgowns',
      subcategories: ['Nightgowns', 'Pajama Sets', 'Robes', 'Sleep Shorts'],
      status: 'Active',
      hsn: '61083300',
      created: '2025-09-02',
      updated: '2025-09-12'
    },
    {
      id: 4,
      name: 'Shapewear',
      description: 'Body-shaping undergarments for confidence',
      subcategories: ['Bodysuits', 'Waist Trainers', 'Shapewear Shorts', 'Control Camisoles'],
      status: 'Active',
      hsn: '61083400',
      created: '2025-09-03',
      updated: '2025-09-14'
    },
    {
      id: 5,
      name: 'Activewear',
      description: 'Sports and fitness intimate apparel',
      subcategories: ['Sports Bras', 'Athletic Underwear', 'Yoga Sets', 'Compression Wear'],
      status: 'Inactive',
      hsn: '61083500',
      created: '2025-09-05',
      updated: '2025-09-08'
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subcategories: [''],
    hsn: '',
    status: 'Active'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubcategoryChange = (index, value) => {
    const newSubcategories = [...formData.subcategories]
    newSubcategories[index] = value
    setFormData(prev => ({
      ...prev,
      subcategories: newSubcategories
    }))
  }

  const addSubcategoryField = () => {
    setFormData(prev => ({
      ...prev,
      subcategories: [...prev.subcategories, '']
    }))
  }

  const removeSubcategoryField = (index) => {
    if (formData.subcategories.length > 1) {
      const newSubcategories = formData.subcategories.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        subcategories: newSubcategories
      }))
    }
  }

  const handleSubmit = (e) => {
    e && e.preventDefault()
    
    const validSubcategories = formData.subcategories.filter(sub => sub.trim() !== '')
    
    if (!formData.name || !formData.description || validSubcategories.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    const categoryData = {
      ...formData,
      subcategories: validSubcategories,
      id: editingCategory ? editingCategory.id : Date.now(),
      created: editingCategory ? editingCategory.created : new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0]
    }

    if (editingCategory) {
      setCategories(prev => prev.map(cat => cat.id === editingCategory.id ? categoryData : cat))
    } else {
      setCategories(prev => [...prev, categoryData])
    }

    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      subcategories: [''],
      hsn: '',
      status: 'Active'
    })
    setShowForm(false)
    setEditingCategory(null)
  }

  const editCategory = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      subcategories: [...category.subcategories],
      hsn: category.hsn,
      status: category.status
    })
    setShowForm(true)
  }

  const deleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== id))
    }
  }

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'All Status' || category.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const categoryIcons = [
    { bg: 'from-pink-500 to-rose-500', icon: Tag },
    { bg: 'from-purple-500 to-indigo-500', icon: Package },
    { bg: 'from-blue-500 to-cyan-500', icon: BarChart3 },
    { bg: 'from-emerald-500 to-teal-500', icon: Filter },
    { bg: 'from-orange-500 to-amber-500', icon: Hash }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              Categories
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              Organize your products into categories with beautiful, intuitive management
            </p>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg flex items-center space-x-3"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <Plus size={20} className="relative z-10" />
            <span className="relative z-10">Add Category</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 text-gray-700 placeholder-gray-400 shadow-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 text-gray-700 shadow-sm min-w-48"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Categories Grid */}
        {!showForm ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCategories.map((category, index) => {
              const iconData = categoryIcons[index % categoryIcons.length]
              const IconComponent = iconData.icon
              
              return (
                <div key={category.id} className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 overflow-hidden">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  
                  <div className="relative p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-14 h-14 bg-gradient-to-br ${iconData.bg} rounded-2xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110`}>
                          <IconComponent size={24} className="text-white" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                            {category.name}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all ${
                            category.status === 'Active' 
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                              : 'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              category.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'
                            }`}></div>
                            {category.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => editCategory(category)}
                          className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-500 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-3 text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-pink-500 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">{category.description}</p>

                    {/* Subcategories */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Package size={16} className="mr-2 text-gray-400" />
                        Subcategories
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.map((sub, subIndex) => (
                          <span key={subIndex} className="px-3 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="border-t border-gray-100 pt-6 space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-gray-500 flex items-center">
                            <Hash size={14} className="mr-1" />
                            HSN Code
                          </span>
                          <span className="text-gray-900 font-mono font-medium">{category.hsn}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-gray-500 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            Updated
                          </span>
                          <span className="text-gray-900 font-medium">{new Date(category.updated).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Category Form */
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-8 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h2>
                  <button 
                    onClick={resetForm}
                    className="text-white hover:text-gray-200 p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Category Name */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Bras & Bralettes"
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 text-gray-700"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the category"
                    rows={4}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 text-gray-700 resize-none"
                    required
                  />
                </div>

                {/* HSN Code */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">HSN Code</label>
                  <input
                    type="text"
                    name="hsn"
                    value={formData.hsn}
                    onChange={handleInputChange}
                    placeholder="e.g., 61083100"
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 text-gray-700 font-mono"
                  />
                </div>

                {/* Subcategories */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Subcategories <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-4">
                    {formData.subcategories.map((subcategory, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <input
                          type="text"
                          value={subcategory}
                          onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                          placeholder={`Subcategory ${index + 1}`}
                          className="flex-1 px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 text-gray-700"
                        />
                        {formData.subcategories.length > 1 && (
                          <button
                            onClick={() => removeSubcategoryField(index)}
                            className="p-3 text-red-500 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-300 hover:scale-110"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addSubcategoryField}
                      className="flex items-center text-pink-500 hover:text-pink-600 font-medium transition-colors"
                    >
                      <Plus size={16} className="mr-2" />
                      Add Subcategory
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-500 transition-all duration-300 text-gray-700"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex items-center space-x-4 pt-6 border-t border-gray-100">
                  <button 
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
                  >
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </button>
                  <button 
                    onClick={resetForm}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {!showForm && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-3xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-4xl font-bold">{categories.length}</h3>
                  <p className="text-pink-100 mt-2 font-medium">Total Categories</p>
                </div>
                <Package size={40} className="text-pink-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-4xl font-bold">
                    {categories.filter(cat => cat.status === 'Active').length}
                  </h3>
                  <p className="text-emerald-100 mt-2 font-medium">Active Categories</p>
                </div>
                <BarChart3 size={40} className="text-emerald-200" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-3xl p-8 text-white shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-4xl font-bold">
                    {categories.reduce((total, cat) => total + cat.subcategories.length, 0)}
                  </h3>
                  <p className="text-blue-100 mt-2 font-medium">Total Subcategories</p>
                </div>
                <Tag size={40} className="text-blue-200" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories