// src/pages/Orders.jsx
import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Search, Filter, Package, Clock, Truck, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import {
  fetchAdminOrders,
  updateOrderStatus,
  clearSuccess,
  clearError
} from '../redux/orderSlice'

const statusConfig = {
  'pending': { color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, dot: 'bg-amber-500' },
  'processing': { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Package, dot: 'bg-blue-500' },
  'shipped': { color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck, dot: 'bg-purple-500' },
  'delivered': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle, dot: 'bg-green-500' },
  'cancelled': { color: 'bg-red-100 text-red-800 border-red-200', icon: Clock, dot: 'bg-red-500' }
}

const paymentConfig = {
  'cod': 'bg-orange-50 text-orange-700 border border-orange-200',
  'razorpay': 'bg-blue-50 text-blue-700 border border-blue-200',
  'upi': 'bg-green-50 text-green-700 border border-green-200',
  'card': 'bg-purple-50 text-purple-700 border border-purple-200',
}

export default function Orders() {
  const dispatch = useDispatch()
  const {
    orders = [],
    pagination = {},
    loading,
    error,
    success
  } = useSelector(state => state.order || {})

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)

  // Load orders on mount and when filters change
  useEffect(() => {
    const filters = {
      page: currentPage,
      limit: 10
    }
    
    if (statusFilter !== 'All') {
      filters.status = statusFilter.toLowerCase()
    }
    
    if (search.trim()) {
      filters.search = search.trim()
    }

    dispatch(fetchAdminOrders(filters))
  }, [dispatch, currentPage, statusFilter, search])

  // Handle success/error states
  useEffect(() => {
    if (success) {
      toast.success('Order updated successfully!')
      dispatch(clearSuccess())
      // Refresh orders after update
      dispatch(fetchAdminOrders({ 
        page: currentPage, 
        limit: 10,
        ...(statusFilter !== 'All' && { status: statusFilter.toLowerCase() }),
        ...(search.trim() && { search: search.trim() })
      }))
    }
  }, [success, dispatch, currentPage, statusFilter, search])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred')
      dispatch(clearError())
    }
  }, [error, dispatch])

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ 
        id: orderId, 
        status: newStatus.toLowerCase() 
      })).unwrap()
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  // Fixed format order data to match actual API response structure
  const formatOrdersForUI = (apiOrders) => {
    return apiOrders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber || `#ORD${order._id?.slice(-4)}`,
      date: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      // Customer name from shippingAddress.name
      customer: order.shippingAddress?.name || 'N/A',
      contact: order.shippingAddress?.phone || 'N/A',
      // Items count from items array
      items: order.items?.length || 0,
      // Product names from items array
      products: order.items?.map(item => item.productName || 'Unknown Product').join(', ') || 'N/A',
      // Total amount from order.total
      total: `₹${order.total?.toLocaleString('en-IN') || 0}`,
      payment: order.paymentMethod || 'N/A',
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'pending',
      // Additional data for potential use
      subtotal: order.subtotal || 0,
      taxAmount: order.taxAmount || 0,
      shippingCharge: order.shippingCharge || 0,
      notes: order.notes || '',
      estimatedDeliveryDate: order.estimatedDeliveryDate || null
    }))
  }

  const formattedOrders = formatOrdersForUI(orders)
  
  const filtered = formattedOrders.filter(o => {
    const matchesStatus = statusFilter === 'All' || o.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesSearch = o.customer.toLowerCase().includes(search.toLowerCase()) ||
                         o.orderNumber.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status) => {
    const config = statusConfig[status.toLowerCase()] || statusConfig['pending']
    const Icon = config?.icon
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <div className={`w-2 h-2 rounded-full ${config.dot}`}></div>
        <Icon size={12} />
        <span className="capitalize">{status}</span>
      </div>
    )
  }

  const getPaymentBadge = (payment) => {
    const paymentKey = payment.toLowerCase()
    const config = paymentConfig[paymentKey] || 'bg-gray-50 text-gray-700 border border-gray-200'
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config}`}>
        {payment.toUpperCase()}
      </span>
    )
  }

  const handleStatusChange = (order, newStatus) => {
    handleStatusUpdate(order.id, newStatus)
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Order Management</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track and manage all customer orders
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{pagination.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">
                  {filtered.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Clock size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Processing</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {filtered.filter(o => o.status === 'processing').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Package size={24} className="text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">Delivered</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {filtered.filter(o => o.status === 'delivered').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <CheckCircle size={24} className="text-white" />
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
                placeholder="Search by customer name or order number..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-40"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-purple-500" />
          </div>
        )}

        {/* Orders Table */}
        {!loading && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-purple-50/50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Order Details
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Customer
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Items
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Total
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Payment
                    </th>
                    <th className="text-left py-4 px-6 font-bold text-gray-800 uppercase tracking-wide text-sm">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order, index) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-purple-50/30 transition-all duration-200 border-b border-gray-50/50"
                    >
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-bold text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">{order.date}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{order.customer}</p>
                          <p className="text-sm text-gray-600">{order.contact}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{order.items} items</p>
                          <p className="text-sm text-gray-600 truncate max-w-48" title={order.products}>
                            {order.products}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900">{order.total}</p>
                      </td>
                      <td className="py-4 px-6">
                        {getPaymentBadge(order.payment)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          {getStatusBadge(order.status)}
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order, e.target.value)}
                            className="text-xs border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-purple-500"
                            disabled={loading}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
              disabled={currentPage === pagination.totalPages || loading}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
