// src/pages/Orders.jsx
import React, { useState } from 'react'
import { Search, Filter, Package, Clock, Truck, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const mockOrders = [
  {
    id: '#ORD1001',
    date: '15 Sept 2025, 11:39 am',
    customer: 'Priya Sharma',
    contact: '+919876543210',
    items: 3,
    products: 'Lace Bralette, Silk Nightgown',
    total: '₹3,499',
    payment: 'COD',
    status: 'Pending',
  },
  {
    id: '#ORD1002',
    date: '15 Sept 2025, 10:20 am',
    customer: 'Ananya Patel',
    contact: '+918765432109',
    items: 1,
    products: 'Cotton Comfort Set',
    total: '₹1,899',
    payment: 'Razorpay',
    status: 'Processing',
  },
  {
    id: '#ORD1003',
    date: '14 Sept 2025, 05:45 pm',
    customer: 'Kavya Singh',
    contact: '+917654321098',
    items: 2,
    products: 'Premium Lingerie Set',
    total: '₹8,598',
    payment: 'Razorpay',
    status: 'Shipped',
  },
  {
    id: '#ORD1004',
    date: '14 Sept 2025, 02:15 pm',
    customer: 'Meera Reddy',
    contact: '+916543210987',
    items: 4,
    products: 'Comfort Bra Set, Sleep Shorts',
    total: '₹4,299',
    payment: 'UPI',
    status: 'Delivered',
  },
]

const statusConfig = {
  'Pending': { 
    color: 'bg-amber-100 text-amber-800 border-amber-200', 
    icon: Clock,
    dot: 'bg-amber-500'
  },
  'Processing': { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Package,
    dot: 'bg-blue-500'
  },
  'Shipped': { 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: Truck,
    dot: 'bg-purple-500'
  },
  'Delivered': { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle,
    dot: 'bg-green-500'
  }
}

const paymentConfig = {
  'COD': 'bg-orange-50 text-orange-700 border border-orange-200',
  'Razorpay': 'bg-blue-50 text-blue-700 border border-blue-200',
  'UPI': 'bg-green-50 text-green-700 border border-green-200',
}

export default function Orders() {
  const [orders, setOrders] = useState(mockOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const filtered = orders.filter(o =>
    (statusFilter === 'All' || o.status === statusFilter) &&
    o.customer.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status) => {
    const config = statusConfig[status]
    const Icon = config?.icon
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config?.color}`}>
        {Icon && <Icon size={12} />}
        {status}
      </div>
    )
  }

  const getPaymentBadge = (payment) => {
    const config = paymentConfig[payment] || 'bg-gray-50 text-gray-700 border border-gray-200'
    return (
      <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${config}`}>
        {payment}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Management</h1>
              <p className="text-gray-600">Track and manage all customer orders</p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>{filtered.length} orders found</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                placeholder="Search by customer name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 hover:bg-white min-w-[160px] appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e')] bg-no-repeat bg-right-3 bg-center"
              >
                <option>All</option>
                <option>Pending</option>
                <option>Processing</option>
                <option>Shipped</option>
                <option>Delivered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    ORDER DETAILS
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    CUSTOMER
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    ITEMS
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    TOTAL
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    PAYMENT
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    STATUS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, index) => (
                  <tr 
                    key={o.id} 
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'
                    }`}
                  >
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900 text-sm">{o.id}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock size={12} />
                          {o.date}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <div className="font-medium text-gray-900">{o.customer}</div>
                        <div className="text-xs text-gray-500">{o.contact}</div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-gray-400" />
                          <span className="font-medium text-gray-900">{o.items} items</span>
                        </div>
                        <div className="text-xs text-gray-500 max-w-[200px] truncate" title={o.products}>
                          {o.products}
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-bold text-lg text-gray-900">{o.total}</div>
                    </td>
                    <td className="py-5 px-6">
                      {getPaymentBadge(o.payment)}
                    </td>
                    <td className="py-5 px-6">
                      <select
                        value={o.status}
                        onChange={e => {
                          const newStatus = e.target.value
                          setOrders(prev =>
                            prev.map(x => (x.id === o.id ? { ...x, status: newStatus } : x))
                          )
                          toast.success(`Order ${o.id} status updated to ${newStatus}`)
                        }}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-sm font-medium bg-white hover:bg-gray-50"
                      >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}