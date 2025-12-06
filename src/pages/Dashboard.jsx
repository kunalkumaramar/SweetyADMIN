import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { TrendingUp, Package, ShoppingCart, Users, DollarSign, Calendar, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, Eye, Plus, Settings, BarChart3, Sparkles, CheckCircle2, Percent, Tag, Clock, Truck, AlertTriangle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

// Import your Redux actions
import { getProducts } from '../redux/productSlice'
import { getCategories } from '../redux/categorySlice'
import { getSubCategories } from '../redux/subcategorySlice'
import { fetchAdminOrders } from '../redux/orderSlice'
import { getAllDiscounts } from '../redux/discountSlice'
import { getAdminProfile, logout } from '../redux/authSlice'


const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  // Get data from all Redux stores
  const { products = [], loading: productsLoading } = useSelector(state => state.product || {})
  const { categories = [], loading: categoriesLoading } = useSelector(state => state.category || {})
  const { subCategories = [], loading: subCategoriesLoading } = useSelector(state => state.subCategory || {})
  const { orders = [], pagination = {}, loading: ordersLoading } = useSelector(state => state.order || {})
  const { discounts = [], loading: discountsLoading } = useSelector(state => state.discount || {})
  
  // Add auth state
  const { isAuthenticated, accessToken, error: authError } = useSelector(state => state.auth || {})

  // Local state for dashboard-specific data
  const [dateRange, setDateRange] = useState('Today')
  const [refreshing, setRefreshing] = useState(false)
  const [profileVerified, setProfileVerified] = useState(false)

  // ✅ VERIFY TOKEN ON MOUNT - This is the key change
  useEffect(() => {
    const verifyAuthentication = async () => {
      const token = localStorage.getItem('token')
      
      if (!token) {
        toast.error('Session expired. Please login again.')
        dispatch(logout())
        navigate('/login')
        return
      }

      try {
        // Call profile to verify token
        await dispatch(getAdminProfile()).unwrap()
        setProfileVerified(true)
      } catch (error) {
        console.error('Token verification failed:', error)
        toast.error('Session expired. Please login again.')
        dispatch(logout())
        navigate('/login')
      }
    }

    verifyAuthentication()
  }, [dispatch, navigate])

  // ✅ Watch for auth errors
  useEffect(() => {
    if (authError && !isAuthenticated) {
      toast.error('Your session has expired. Please login again.')
      navigate('/login')
    }
  }, [authError, isAuthenticated, navigate])

  // Load all data only after profile is verified
  useEffect(() => {
    if (!profileVerified) return

    const loadAllData = async () => {
      setRefreshing(true)
      try {
        await Promise.all([
          dispatch(getProducts({ page: 1, limit: 50 })),
          dispatch(getCategories()),
          dispatch(getSubCategories()),
          dispatch(fetchAdminOrders({ page: 1, limit: 50 })),
          dispatch(getAllDiscounts())
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        
        // If any API call fails with auth error, logout
        if (error?.message?.includes('Unauthorized') || error?.statusCode === 401) {
          toast.error('Session expired. Please login again.')
          dispatch(logout())
          navigate('/login')
        }
      } finally {
        setRefreshing(false)
      }
    }

    loadAllData()
  }, [dispatch, profileVerified, navigate])


  // MOVED: Helper functions BEFORE calculateStats
  const getTimeAgo = (date) => {
    const now = new Date()
    const orderDate = new Date(date)
    const diff = Math.floor((now - orderDate) / (1000 * 60 * 60))
    
    if (diff < 1) return 'Just now'
    if (diff < 24) return `${diff}h ago`
    return `${Math.floor(diff / 24)}d ago`
  }


  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }


  const getStatusColor = (status) => {
    const statusColors = {
      delivered: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200',
      processing: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border-blue-200',
      shipped: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border-purple-200',
      pending: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border-yellow-200',
      cancelled: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200'
    }
    return statusColors[status?.toLowerCase()] || statusColors.pending
  }


  const calculateStats = () => {
    // Product stats
    const totalProducts = products.length
    const lowStockProducts = products.filter(product => {
      const totalStock = product.colors?.reduce((total, color) => {
        return total + (color.sizeStock?.reduce((sum, size) => sum + size.stock, 0) || 0)
      }, 0) || 0
      return totalStock <= 5
    }).length

    // Order stats
    const todayOrders = orders.filter(order => {
      const today = new Date().toDateString()
      return new Date(order.createdAt).toDateString() === today
    })

    const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

    // Order status breakdown
    const ordersByStatus = orders.reduce((acc, order) => {
      const status = order.status?.toLowerCase() || 'pending'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Customer stats (unique customers from orders)
    const uniqueCustomers = new Set(orders.map(order => order.shippingAddress?.name || order.customerId)).size

    // Discount stats
    const activeDiscounts = discounts.filter(d => d.isActive).length
    const expiredDiscounts = discounts.filter(d => 
      d.validUntil && new Date(d.validUntil) < new Date()
    ).length

    // Recent activity - FIXED: Create copy before sorting
    const recentOrders = [...orders]  // Create copy first
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4)
      .map(order => ({
        id: order._id,
        orderNumber: order.orderNumber || `#ORD${order._id?.slice(-4)}`,
        customer: order.shippingAddress?.name || 'Unknown Customer',
        product: order.items?.[0]?.productName || 'Multiple Items',
        amount: `₹${order.total?.toLocaleString('en-IN') || 0}`,
        status: order.status || 'pending',
        time: getTimeAgo(order.createdAt),
        avatar: getInitials(order.shippingAddress?.name || 'U')
      }))

    // Top selling products - FIXED: Create copy before sorting
    const productSales = products.map(product => {
      const sales = orders.reduce((total, order) => {
        const productInOrder = order.items?.find(item => item.productId === product._id)
        return total + (productInOrder?.quantity || 0)
      }, 0)

      const revenue = orders.reduce((total, order) => {
        const productInOrder = order.items?.find(item => item.productId === product._id)
        return total + ((productInOrder?.quantity || 0) * (productInOrder?.price || 0))
      }, 0)

      return {
        ...product,
        unitsSold: sales,
        revenue: revenue
      }
    }).filter(p => p.unitsSold > 0)

    // Create copy before sorting
    const topProducts = [...productSales]
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 4)

    return {
      todayOrders: todayOrders.length,
      todayRevenue,
      totalRevenue,
      totalProducts,
      lowStockProducts,
      uniqueCustomers,
      activeDiscounts,
      expiredDiscounts,
      ordersByStatus,
      recentOrders,
      topProducts
    }
  }

  // Show loading state while verifying profile
  if (!profileVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Verifying session...</p>
        </div>
      </div>
    )
  }

  const stats = calculateStats()


  // Rest of your component stays the same...
  // Main stats cards data
  const mainStats = [
    {
      title: "Today's Orders",
      value: stats.todayOrders.toString(),
      change: '+12%',
      changeType: 'positive',
      icon: ShoppingCart,
      color: 'from-pink-500 to-rose-500',
      total: `Total: ${orders.length}`,
      bgColor: 'from-pink-50 to-rose-50',
      link: '/orders'
    },
    {
      title: "Today's Revenue",
      value: `₹${stats.todayRevenue.toLocaleString('en-IN')}`,
      change: '+8.5%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'from-emerald-500 to-teal-500',
      total: `₹${Math.floor(stats.totalRevenue/100000)}L total`,
      bgColor: 'from-emerald-50 to-teal-50',
      link: '/orders'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      change: `${stats.lowStockProducts} low stock`,
      changeType: stats.lowStockProducts > 0 ? 'warning' : 'positive',
      icon: Package,
      color: 'from-blue-500 to-indigo-500',
      total: `${categories.length} categories`,
      bgColor: 'from-blue-50 to-indigo-50',
      link: '/products'
    },
    {
      title: 'Active Customers',
      value: stats.uniqueCustomers.toString(),
      change: '+15%',
      changeType: 'positive',
      icon: Users,
      color: 'from-amber-500 to-orange-500',
      total: '45 new this week',
      bgColor: 'from-amber-50 to-orange-50',
      link: '/orders'
    }
  ]


  // Order status cards data
  const orderStatus = [
    {
      status: 'Pending Orders',
      count: stats.ordersByStatus.pending || 0,
      color: 'from-yellow-400 to-amber-500',
      bgColor: 'from-yellow-50 to-amber-50',
      description: 'Awaiting confirmation',
      icon: Clock
    },
    {
      status: 'Processing',
      count: stats.ordersByStatus.processing || 0,
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50', 
      description: 'Being prepared',
      icon: Package
    },
    {
      status: 'Shipped',
      count: stats.ordersByStatus.shipped || 0,
      color: 'from-purple-400 to-violet-500',
      bgColor: 'from-purple-50 to-violet-50',
      description: 'On the way',
      icon: Truck
    },
    {
      status: 'Delivered',
      count: stats.ordersByStatus.delivered || 0,
      color: 'from-green-400 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      description: 'Successfully delivered',
      icon: CheckCircle2
    }
  ]


  // Activity feed data
  const activities = [
    {
      type: 'order',
      message: `${stats.todayOrders} new orders received today`,
      time: '2h ago',
      amount: `₹${stats.todayRevenue.toLocaleString('en-IN')}`
    },
    {
      type: 'product',
      message: `${stats.lowStockProducts} products running low on stock`,
      time: '4h ago',
      amount: null
    },
    {
      type: 'customer',
      message: `${stats.uniqueCustomers} total active customers`,
      time: '6h ago',
      amount: null
    },
    {
      type: 'discount',
      message: `${stats.activeDiscounts} active discounts available`,
      time: '8h ago',
      amount: `${stats.expiredDiscounts} expired`
    }
  ]


  const isLoading = productsLoading || categoriesLoading || subCategoriesLoading || ordersLoading || discountsLoading || refreshing


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
            Sweet moments, sweeter business - Here's your overview
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            className="px-5 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
            <option>Annual</option>
          </select>
          <Link to="/orders">
            <button className="px-5 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center gap-2 font-medium">
              <BarChart3 size={16} />
              Reports
            </button>
          </Link>
        </div>
      </div>


      {/* Loading Indicator */}
      {isLoading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center px-4 py-2 bg-white/80 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-500 border-t-transparent mr-3"></div>
            <span className="text-gray-600">Loading dashboard data...</span>
          </div>
        </div>
      )}


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={index} to={stat.link} className="block">
              <div 
                className={`relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group animate-slide-up cursor-pointer`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      stat.changeType === 'positive' ? 'text-emerald-600' : 
                      stat.changeType === 'warning' ? 'text-amber-600' : 'text-red-600'
                    } font-bold text-sm ${
                      stat.changeType === 'positive' ? 'bg-emerald-50' : 
                      stat.changeType === 'warning' ? 'bg-amber-50' : 'bg-red-50'
                    } px-3 py-1.5 rounded-full`}>
                      {stat.changeType === 'positive' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
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
            </Link>
          )
        })}
      </div>


      {/* Order Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {orderStatus.map((order, index) => {
          const Icon = order.icon
          return (
            <Link key={index} to="/orders" className="block">
              <div 
                className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/50 overflow-hidden group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${order.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${order.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 mb-3 text-lg">{order.status}</h3>
                  <p className={`text-4xl font-bold mb-3 bg-gradient-to-r ${order.color} bg-clip-text text-transparent`}>
                    {order.count}
                  </p>
                  <span className="inline-block px-4 py-2 bg-white/80 text-gray-700 rounded-full text-sm font-medium border border-gray-200">
                    {order.description}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
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
            <Link to="/orders">
              <button className="flex items-center gap-2 text-pink-600 hover:text-pink-700 text-sm font-semibold hover:bg-pink-50 px-3 py-2 rounded-lg transition-all duration-200">
                <Eye size={16} />
                View All
              </button>
            </Link>
          </div>
          <div className="p-6">
            {stats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {stats.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50/50 to-pink-50/20 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100/50 group">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-sm">{order.avatar}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{order.orderNumber}</p>
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
            ) : (
              <div className="text-center py-8">
                <ShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No recent orders</p>
              </div>
            )}
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
            {stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between group hover:bg-pink-50/30 p-3 rounded-xl transition-all duration-200">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 bg-gradient-to-br ${
                        index === 0 ? 'from-yellow-400 to-amber-500' :
                        index === 1 ? 'from-gray-400 to-gray-500' :
                        index === 2 ? 'from-orange-400 to-red-500' :
                        'from-pink-400 to-rose-500'
                      } rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.unitsSold} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{product.revenue.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <ArrowUpRight size={12} />
                        +{Math.floor(Math.random() * 20) + 5}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No sales data yet</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Activity Feed and Quick Stats */}
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


        {/* System Status */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-pink-50/50">
            <h2 className="text-xl font-heading font-bold text-gray-900 flex items-center gap-2">
              <AlertCircle size={20} className="text-pink-500" />
              System Status
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Stock Status */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
              <div className="flex items-center space-x-3">
                <AlertTriangle size={20} className="text-red-500" />
                <div>
                  <p className="font-bold text-gray-900">Stock Alert</p>
                  <p className="text-sm text-gray-600">{stats.lowStockProducts} products low on stock</p>
                </div>
              </div>
              <Link to="/products">
                <button className="text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
                  View
                </button>
              </Link>
            </div>


            {/* Active Discounts */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3">
                <Percent size={20} className="text-green-500" />
                <div>
                  <p className="font-bold text-gray-900">Active Discounts</p>
                  <p className="text-sm text-gray-600">{stats.activeDiscounts} discounts running</p>
                </div>
              </div>
              <Link to="/discount">
                <button className="text-green-600 hover:bg-green-100 px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
                  Manage
                </button>
              </Link>
            </div>


            {/* Categories Status */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3">
                <Tag size={20} className="text-blue-500" />
                <div>
                  <p className="font-bold text-gray-900">Categories</p>
                  <p className="text-sm text-gray-600">{categories.length} categories, {subCategories.length} subcategories</p>
                </div>
              </div>
              <Link to="/categories">
                <button className="text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm font-semibold transition-colors">
                  View
                </button>
              </Link>
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
          <Link to="/products">
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 w-full">
              <Plus size={20} />
              Add New Product
            </button>
          </Link>
          <Link to="/categories">
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 w-full">
              <Settings size={20} />
              Manage Categories
            </button>
          </Link>
          <Link to="/discount">
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-700 border-2 border-gray-200 hover:border-pink-300 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 w-full">
              <Percent size={20} />
              Create Discount
            </button>
          </Link>
          <Link to="/orders">
            <button className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 hover:scale-105 w-full">
              <BarChart3 size={20} />
              View Reports
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}


export default Dashboard
