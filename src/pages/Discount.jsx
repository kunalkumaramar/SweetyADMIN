// src/pages/Discount.jsx
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Filter, 
  Tag, 
  Calendar, 
  Users, 
  Percent, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  X,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createDiscount,
  updateDiscount,
  deleteDiscount,
  getAllDiscounts,
  clearSuccess,
  clearError
} from '../redux/discountSlice'

const statusConfig = {
  'Active': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, dot: 'bg-green-500' },
  'Inactive': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle, dot: 'bg-gray-500' },
  'Expired': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertTriangle, dot: 'bg-red-500' }
}

const typeConfig = {
  'fixed': { color: 'bg-blue-50 text-blue-700 border border-blue-200', icon: DollarSign },
  'percentage': { color: 'bg-purple-50 text-purple-700 border border-purple-200', icon: Percent }
}

export default function Discount() {
  const dispatch = useDispatch()
  const {
    discounts = [], // This should be the actual discounts array from API
    pagination = {},
    loading,
    error,
    success,
    createdDiscount,
    updatedDiscount,
    deletedDiscountId
  } = useSelector(state => state.discount || {})

  const [filterStatus, setFilterStatus] = useState('All Status')
  const [showModal, setShowModal] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState(null)
  const [formData, setFormData] = useState({
    code: '',
    type: 'coupon',
    discountType: 'percentage',
    value: '',
    minPurchase: '',
    validUntil: '',
    usageLimit: '',
    isActive: true
  })

  // Load discounts on mount
  useEffect(() => {
    dispatch(getAllDiscounts())
  }, [dispatch])

  // Handle success states
  useEffect(() => {
    if (success) {
      if (createdDiscount) {
        toast.success('Discount created successfully!')
        closeModal()
      }
      if (updatedDiscount) {
        toast.success('Discount updated successfully!')
        closeModal()
      }
      if (deletedDiscountId) {
        toast.success('Discount deleted successfully!')
      }
      dispatch(clearSuccess())
      dispatch(getAllDiscounts()) // Refresh list
    }
  }, [success, createdDiscount, updatedDiscount, deletedDiscountId, dispatch])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred')
      dispatch(clearError())
    }
  }, [error, dispatch])

  const initializeForm = () => {
    setFormData({
      code: '',
      type: 'coupon',
      discountType: 'percentage',
      value: '',
      minPurchase: '',
      validUntil: '',
      usageLimit: '',
      isActive: true
    })
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDiscount(null)
    initializeForm()
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.code.trim() || !formData.value) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      // Prepare data according to your simplified JSON format
      const submitData = {
        code: formData.code.trim(),
        type: formData.type,
        discountType: formData.discountType,
        value: parseFloat(formData.value),
        isActive: formData.isActive
      }

      // Add optional fields only if they have values
      if (formData.minPurchase) submitData.minPurchase = parseFloat(formData.minPurchase)
      if (formData.validUntil) submitData.validUntil = new Date(formData.validUntil).toISOString()
      if (formData.usageLimit) submitData.usageLimit = parseInt(formData.usageLimit)

      if (editingDiscount) {
        dispatch(updateDiscount({ 
          id: editingDiscount._id, 
          updateData: submitData 
        }))
      } else {
        dispatch(createDiscount(submitData))
      }
    } catch (error) {
      toast.error('Error processing request: ' + error.message)
    }
  }

  const handleEdit = (discount) => {
    setEditingDiscount(discount)
    setFormData({
      code: discount.code || '',
      type: discount.type || 'coupon',
      discountType: discount.discountType || 'percentage',
      value: discount.value?.toString() || '',
      minPurchase: discount.minPurchase?.toString() || '',
      validUntil: discount.validUntil ? new Date(discount.validUntil).toISOString().split('T')[0] : '',
      usageLimit: discount.usageLimit?.toString() || '',
      isActive: discount.isActive !== false
    })
    setShowModal(true)
  }

  const handleDelete = (discount) => {
    if (window.confirm(`Are you sure you want to delete discount "${discount.code}"?`)) {
      dispatch(deleteDiscount(discount._id))
    }
  }

  const handleAddNew = () => {
    setShowModal(true)
    setEditingDiscount(null)
    initializeForm()
  }

  // Format discounts for UI display - updated to match your API response structure
  const formatDiscountsForUI = (apiDiscounts) => {
    // Ensure apiDiscounts is an array
    if (!Array.isArray(apiDiscounts)) {
      console.log('apiDiscounts is not an array:', apiDiscounts)
      return []
    }
    
    return apiDiscounts.map(discount => ({
      id: discount._id,
      name: `${discount.code} Discount`,
      code: discount.code,
      type: discount.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount',
      value: discount.discountType === 'percentage' ? `${discount.value}%` : `₹${discount.value}`,
      minOrder: discount.minPurchase ? `₹${discount.minPurchase}` : '',
      // Updated usage to use actual usedCount and usageLimit from API
      usage: `${discount.usedCount || 0} / ${discount.usageLimit || 'Unlimited'}`,
      start: discount.createdAt ? new Date(discount.createdAt).toLocaleDateString() : '',
      end: discount.validUntil ? new Date(discount.validUntil).toLocaleDateString() : '',
      // Check if expired based on validUntil date
      status: !discount.isActive ? 'Inactive' : 
               (discount.validUntil && new Date(discount.validUntil) < new Date()) ? 'Expired' : 'Active',
      originalData: discount
    }))
  }

  // Use it with proper fallback - ensure we're using the right discounts array
  const formattedDiscounts = formatDiscountsForUI(Array.isArray(discounts) ? discounts : [])
  
  const filtered = formattedDiscounts.filter(d => 
    filterStatus === 'All Status' || d.status === filterStatus
  )

  const getStatusBadge = (status) => {
    const config = statusConfig[status]
    const Icon = config?.icon
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        <Icon size={12} />
        <span>{status}</span>
      </div>
    )
  }

  const getTypeBadge = (type) => {
    const config = typeConfig[type.toLowerCase()]
    const Icon = config?.icon || DollarSign
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${config?.color || 'bg-gray-50 text-gray-700 border border-gray-200'}`}>
        <Icon size={12} />
        <span>{type}</span>
      </div>
    )
  }

  const getUsageProgress = (usage) => {
    const [used, total] = usage.split(' / ')
    const usedNum = parseInt(used) || 0
    const totalNum = total === 'Unlimited' ? 0 : parseInt(total) || 0
    const percentage = totalNum === 0 ? 0 : (usedNum / totalNum) * 100
    
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span>{usage}</span>
          <span>{totalNum > 0 ? `${Math.round(percentage)}%` : ''}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              percentage > 80 ? 'bg-red-500' : percentage > 50 ? 'bg-yellow-500' : 'bg-blue-500'
            }`}
            style={{ width: totalNum > 0 ? `${Math.min(percentage, 100)}%` : '0%' }}
          />
        </div>
      </div>
    )
  }

  // Debug logging
  console.log('Redux discounts state:', discounts)
  console.log('Formatted discounts:', formattedDiscounts)

  if (loading && (!Array.isArray(discounts) || discounts.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
          <p className="text-gray-600">Loading discounts...</p>
        </div>
      </div>
    )
  }

  // Stats calculations with actual API data
  const totalDiscounts = Array.isArray(discounts) ? discounts.length : 0
  const activeDiscounts = Array.isArray(discounts) ? discounts.filter(d => d.isActive).length : 0
  const expiredDiscounts = Array.isArray(discounts) ? 
    discounts.filter(d => d.validUntil && new Date(d.validUntil) < new Date()).length : 0
  const totalUsage = Array.isArray(discounts) ? 
    discounts.reduce((sum, d) => sum + (d.usedCount || 0), 0) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Discount Management
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create and manage discount codes and promotions
          </p>
          <button
            onClick={handleAddNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <Plus size={20} />
            Add Discount
          </button>
        </div>

        {/* Stats Cards - with actual API data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Discounts</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalDiscounts}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Tag size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Active Discounts</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{activeDiscounts}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Expired Discounts</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{expiredDiscounts}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center">
                <AlertTriangle size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Usage</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{totalUsage}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
          <div className="flex items-center gap-4">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-purple-500" />
          </div>
        )}

        {/* Discounts Table */}
        {!loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-purple-50/50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Discount Details
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Code & Type
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Value & Limits
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Usage
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Status
                    </th>
                    <th className="text-center py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, index) => (
                    <tr 
                      key={d.id} 
                      className="hover:bg-purple-50/30 transition-all duration-200 border-b border-gray-50/50"
                    >
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900">{d.name}</p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Start: {d.start}</p>
                            <p>End: {d.end || 'No expiry'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <p className="font-mono font-bold text-gray-900">{d.code}</p>
                          {getTypeBadge(d.type)}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-purple-600">{d.value}</p>
                          {d.minOrder && (
                            <p className="text-xs text-gray-600">Min: {d.minOrder}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 min-w-32">
                        {getUsageProgress(d.usage)}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(d.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button 
                            onClick={() => handleEdit(d.originalData)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(d.originalData)}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No discounts found</h3>
                <p className="text-gray-600">Try adjusting your filter criteria or create a new discount</p>
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Discount Modal - Simplified */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl flex flex-col">
              {/* Fixed Header */}
              <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-2xl flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingDiscount ? 'Edit Discount' : 'Add New Discount'}
                </h2>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-white/80 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Discount Code *
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="e.g., ST15"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Discount Type *
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                      >
                        <option value="coupon">Coupon</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Value Type *
                      </label>
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                      >
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Value *
                      </label>
                      <input
                        type="number"
                        name="value"
                        value={formData.value}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder={formData.discountType === 'percentage' ? '40' : '500'}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.discountType === 'percentage' ? 'Enter percentage (e.g., 40 for 40%)' : 'Enter amount in rupees'}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Minimum Purchase (Optional)
                      </label>
                      <input
                        type="number"
                        name="minPurchase"
                        value={formData.minPurchase}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Valid Until (Optional)
                      </label>
                      <input
                        type="date"
                        name="validUntil"
                        value={formData.validUntil}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Usage Limit (Optional)
                      </label>
                      <input
                        type="number"
                        name="usageLimit"
                        value={formData.usageLimit}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400/20 focus:border-purple-400"
                        placeholder="100"
                      />
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
                      Active discount
                    </label>
                  </div>
                </form>
              </div>

              {/* Fixed Footer */}
              <div className="p-6 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50 rounded-b-2xl flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
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
                      {editingDiscount ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      {editingDiscount ? 'Update Discount' : 'Create Discount'}
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
