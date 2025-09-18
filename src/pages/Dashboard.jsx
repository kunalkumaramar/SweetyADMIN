import React from 'react'
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  Calendar,
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  Settings,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Percent
} from 'lucide-react'

const Dashboard = () => {
  // Mock data based on Daadi's dashboard structure
  const stats = [
    {
      title: "Today's Orders",
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'from-pink-500 to-rose-500',
      total: 'Total: 1,247',
      bgColor: 'from-pink-50 to-rose-50'
    },
    {
      title: "Today's Revenue",
      value: '₹12,450',
      change: '+8.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      total: '₹2.1L total',
      bgColor: 'from-emerald-50 to-teal-50'
    },
    {
      title: 'Total Products',
      value: '156',
      change: '+3 new',
      changeType: 'positive',
      icon: Package,
      color: 'from-blue-500 to-indigo-500',
      total: '5 low stock',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      title: 'Active Customers',
      value: '892',
      change: '+15%',
      changeType: 'positive',
      icon: Users,
      color: 'from-amber-500 to-orange-500',
      total: '45 new this week',
      bgColor: 'from-amber-50 to-orange-50'
    }
  ]

  const orderStatus = [
    { status: 'Pending Orders', count: 12, color: 'from-yellow-400 to-amber-500', bgColor: 'from-yellow-50 to-amber-50', description: 'Awaiting confirmation' },
    { status: 'Processing', count: 8, color: 'from-blue-400 to-indigo-500', bgColor: 'from-blue-50 to-indigo-50', description: 'Being prepared' },
    { status: 'Shipped', count: 15, color: 'from-purple-400 to-violet-500', bgColor: 'from-purple-50 to-violet-50', description: 'On the way' },
    { status: 'Delivered', count: 32, color: 'from-green-400 to-emerald-500', bgColor: 'from-green-50 to-emerald-50', description: 'Successfully delivered' }
  ]

  const recentOrders = [
    {
      id: '#ORD1001',
      customer: 'Priya Sharma',
      product: 'Lace Bralette Set',
      amount: '₹2,499',
      status: 'Processing',
      time: '2h ago',
      avatar: 'PS'
    },
    {
      id: '#ORD1002',
      customer: 'Ananya Patel',
      product: 'Silk Nightgown',
      amount: '₹3,999',
      status: 'Shipped',
      time: '4h ago',
      avatar: 'AP'
    },
    {
      id: '#ORD1003',
      customer: 'Kavya Singh',
      product: 'Cotton Comfort Set',
      amount: '₹1,899',
      status: 'Delivered',
      time: '6h ago',
      avatar: 'KS'
    },
    {
      id: '#ORD1004',
      customer: 'Meera Gupta',
      product: 'Premium Lingerie Set',
      amount: '₹4,299',
      status: 'Pending',
      time: '8h ago',
      avatar: 'MG'
    }
  ]

  const topProducts = [
    {
      rank: 1,
      name: 'Lace Bralette Set',
      units: 145,
      revenue: '₹21,306',
      trend: '+12%'
    },
    {
      rank: 2,
      name: 'Silk Nightgown',
      units: 98,
      revenue: '₹18,450',
      trend: '+8%'
    },
    {
      rank: 3,
      name: 'Cotton Comfort Set',
      units: 87,
      revenue: '₹15,230',
      trend: '+5%'
    },
    {
      rank: 4,
      name: 'Premium Lingerie Set',
      units: 76,
      revenue: '₹12,890',
      trend: '+3%'
    }
  ]

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
      case 'processing':
        return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200'
      case 'shipped':
        return 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border-purple-200'
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const activities = [
    { type: 'order', message: 'New order #ORD1001 from Priya Sharma', time: '2h ago', amount: '₹2,499' },
    { type: 'product', message: '3 new products added to inventory', time: '4h ago', amount: null },
    { type: 'customer', message: '15 new customers registered today', time: '6h ago', amount: null },
    { type: 'revenue', message: 'Daily revenue target achieved', time: '8h ago', amount: '₹12,450' }
  ]

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-50/50 to-pink-50/20 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-gray-800 to-pink-600 bg-clip-text text-transparent">
            Welcome to Sweety Intimates Dashboard
          </h1>
          <p className="text-gray-600 mt-3 text-lg flex items-center gap-2">
            <Sparkles size={18} className="text-pink-400" />
            Sweet moments, sweeter business - Here's your today overview
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-5 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Annual</option>
          </select>
          <button className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-medium">
            <BarChart3 size={16} />
            Reports
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div 
              key={index} 
              className={`relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1.5 rounded-full">
                    <ArrowUpRight size={14} />
                    <span>{stat.change}</span>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2 mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 font-medium">{stat.total}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderStatus.map((order, index) => (
          <div 
            key={index} 
            className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${order.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            
            <div className="relative z-10">
              <h3 className="font-bold text-gray-800 mb-3 text-lg">{order.status}</h3>
              <p className={`text-4xl font-bold mb-3 bg-gradient-to-r ${order.color} bg-clip-text text-transparent`}>
                {order.count}
              </p>
              <span className="inline-block px-4 py-2 bg-white/80 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                {order.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-pink-50/50">
            <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-pink-500" />
              Recent Orders
            </h2>
            <button className="flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm font-semibold hover:bg-pink-50 px-3 py-2 rounded-lg transition-all duration-200">
              <Eye size={16} />
              View All
            </button>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-pink-50/20 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100/50 group">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-sm">{order.avatar}</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{order.id}</p>
                      <p className="text-sm text-gray-700 font-medium">{order.customer}</p>
                      <p className="text-xs text-gray-500 mt-1">{order.product} • {order.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg">{order.amount}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-pink-50/50">
            <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-pink-500" />
              Top Selling Products
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between group hover:bg-pink-50/30 p-3 rounded-xl transition-all duration-200">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 bg-gradient-to-br ${
                      product.rank === 1 ? 'from-yellow-400 to-amber-500' :
                      product.rank === 2 ? 'from-gray-400 to-gray-500' :
                      product.rank === 3 ? 'from-orange-400 to-red-500' :
                      'from-pink-400 to-rose-500'
                    } rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                      #{product.rank}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.units} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{product.revenue}</p>
                    <p className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                      <ArrowUpRight size={12} />
                      {product.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed and Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Feed */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-pink-50/50">
            <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
              <Activity size={20} className="text-pink-500" />
              Activity Feed
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4 p-3 hover:bg-pink-50/30 rounded-xl transition-all duration-200 group">
                  <div className="w-3 h-3 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full mt-2 shadow-sm group-hover:scale-110 transition-transform duration-200" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium leading-relaxed">
                      {activity.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500 font-medium">{activity.time}</p>
                      {activity.amount && (
                        <p className="text-sm font-bold text-gray-900">{activity.amount}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stock Alerts */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-pink-50/50">
            <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-pink-500" />
              Stock Alerts
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">All Stock Levels Good!</h3>
              <p className="text-gray-600 mb-2">All products are well stocked</p>
              <p className="text-sm text-gray-500">You'll be notified when stock runs low</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Sparkles size={24} className="text-pink-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105">
            <Plus size={20} />
            Add New Product
          </button>
          <button className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105">
            <Settings size={20} />
            Manage Categories
          </button>
          <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-105">
            <Percent size={20} />
            Create Discount
          </button>
          <button className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105">
            <BarChart3 size={20} />
            View Reports
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard