// src/pages/Discount.jsx
import React, { useState } from 'react'
import { Plus, Edit, Trash2, Filter, Tag, Calendar, Users, Percent, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const mockDiscounts = [
  {
    id: 1,
    name: 'FIRST1 Discount',
    code: 'FIRST1',
    type: 'Fixed Amount',
    value: '₹12',
    minOrder: '₹150',
    usage: '1 / 500',
    start: '2025-09-11',
    end: '2025-09-26',
    status: 'Active',
  },
  {
    id: 2,
    name: 'TEST11 Discount',
    code: 'TEST11',
    type: 'Fixed Amount',
    value: '₹500',
    minOrder: '₹398',
    usage: '0 / 500',
    start: '2025-09-10',
    end: '2025-09-20',
    status: 'Active',
  },
  {
    id: 3,
    name: 'DDNEW Discount',
    code: 'DDNEW',
    type: 'Percentage',
    value: '20%',
    minOrder: '₹100',
    maxOrder: '₹1000',
    usage: '78 / 100',
    start: '2025-09-05',
    end: '2027-08-01',
    status: 'Active',
  },
  {
    id: 4,
    name: 'SUMMER2025 Sale',
    code: 'SUMMER2025',
    type: 'Percentage',
    value: '15%',
    minOrder: '₹299',
    usage: '245 / 1000',
    start: '2025-06-01',
    end: '2025-05-31',
    status: 'Expired',
  },
  {
    id: 5,
    name: 'NEWCUSTOMER Welcome',
    code: 'WELCOME50',
    type: 'Fixed Amount',
    value: '₹50',
    minOrder: '₹200',
    usage: '0 / 200',
    start: '2025-10-01',
    end: '2025-12-31',
    status: 'Inactive',
  },
]

const statusConfig = {
  'Active': { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: CheckCircle,
    dot: 'bg-green-500'
  },
  'Inactive': { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: XCircle,
    dot: 'bg-gray-500'
  },
  'Expired': { 
    color: 'bg-red-100 text-red-800 border-red-200', 
    icon: AlertTriangle,
    dot: 'bg-red-500'
  }
}

const typeConfig = {
  'Fixed Amount': { 
    color: 'bg-blue-50 text-blue-700 border border-blue-200',
    icon: DollarSign
  },
  'Percentage': { 
    color: 'bg-purple-50 text-purple-700 border border-purple-200',
    icon: Percent
  }
}

export default function Discount() {
  const [discounts, setDiscounts] = useState(mockDiscounts)
  const [filterStatus, setFilterStatus] = useState('All Status')

  const filtered = discounts.filter(d =>
    filterStatus === 'All Status' || d.status === filterStatus
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

  const getTypeBadge = (type) => {
    const config = typeConfig[type] || 'bg-gray-50 text-gray-700 border border-gray-200'
    const Icon = config?.icon
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${config?.color}`}>
        {Icon && <Icon size={12} />}
        {type}
      </div>
    )
  }

  const getUsageProgress = (usage) => {
    const [used, total] = usage.split(' / ').map(n => parseInt(n))
    const percentage = (used / total) * 100
    
    let colorClass = 'bg-blue-500'
    if (percentage > 80) colorClass = 'bg-red-500'
    else if (percentage > 60) colorClass = 'bg-yellow-500'
    else if (percentage > 30) colorClass = 'bg-orange-500'
    
    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-900">{usage}</span>
          <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    )
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Discount Management</h1>
              <p className="text-gray-600">Create and manage discount codes and promotions</p>
            </div>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Plus size={18} />
              Add Discount
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Discounts</p>
                <p className="text-2xl font-bold text-gray-900">{discounts.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Discounts</p>
                <p className="text-2xl font-bold text-green-600">{discounts.filter(d => d.status === 'Active').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expired Discounts</p>
                <p className="text-2xl font-bold text-red-600">{discounts.filter(d => d.status === 'Expired').length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Usage</p>
                <p className="text-2xl font-bold text-purple-600">
                  {discounts.reduce((sum, d) => sum + parseInt(d.usage.split(' / ')[0]), 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Filter size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="pl-12 pr-8 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 hover:bg-white min-w-[160px] appearance-none bg-[url('data:image/svg+xml,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 20 20%27%3e%3cpath stroke=%27%236b7280%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27 stroke-width=%271.5%27 d=%27M6 8l4 4 4-4%27/%3e%3c/svg%3e')] bg-no-repeat bg-right-3 bg-center"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Expired</option>
              </select>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>{filtered.length} discounts found</span>
            </div>
          </div>
        </div>

        {/* Discounts Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    DISCOUNT DETAILS
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    CODE & TYPE
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    VALUE & LIMITS
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    USAGE
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    STATUS
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm tracking-wide">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, index) => (
                  <tr 
                    key={d.id} 
                    className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-150 ${
                      index % 2 === 0 ? 'bg-white' : 'bg-slate-50/20'
                    }`}
                  >
                    <td className="py-5 px-6">
                      <div className="space-y-2">
                        <div className="font-semibold text-gray-900">{d.name}</div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar size={12} />
                          <span>{formatDate(d.start)} – {formatDate(d.end)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-2">
                        <div className="font-mono font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded text-sm inline-block">
                          {d.code}
                        </div>
                        <div>{getTypeBadge(d.type)}</div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="space-y-1">
                        <div className="font-bold text-lg text-purple-600">{d.value}</div>
                        {d.minOrder && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>Min: {d.minOrder}</span>
                          </div>
                        )}
                        {d.maxOrder && (
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span>Max: {d.maxOrder}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="w-32">
                        {getUsageProgress(d.usage)}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200">
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this discount?')) {
                              setDiscounts(prev => prev.filter(x => x.id !== d.id))
                              toast.success(`Deleted discount: ${d.name}`)
                            }
                          }}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-12 text-center">
            <Tag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No discounts found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your filter criteria or create a new discount</p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200">
              <Plus size={18} />
              Add First Discount
            </button>
          </div>
        )}
      </div>
    </div>
  )
}