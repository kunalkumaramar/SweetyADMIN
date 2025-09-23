import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Tag, 
  Tags,
  ShoppingCart, 
  Percent, 
  User, 
  X,
  HelpCircle,
  Sparkles
} from 'lucide-react'

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation()

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      badge: null
    },
    {
      name: 'Products',
      icon: Package,
      path: '/products',
      badge: '24'
    },
    {
      name: 'Categories',
      icon: Tag,
      path: '/categories',
      badge: null
    },
    {
      name: 'Orders',
      icon: ShoppingCart,
      path: '/orders',
      badge: '3'
    },
    {
      name: 'Discounts',
      icon: Percent,
      path: '/discount',
      badge: null
    },
    {
      name: 'Profile',
      icon: User,
      path: '/profile',
      badge: null
    }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white/95 backdrop-blur-md shadow-2xl z-50 
        transform transition-all duration-300 ease-out border-r border-gray-100
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-pink-50/50 to-rose-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-all duration-200">
              <span className="text-white font-bold text-sm tracking-wide">SI</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-gray-800 text-lg">Sweety Intimates</h1>
              <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <Sparkles size={12} className="text-pink-400" />
                Admin Panel
              </p>
            </div>
          </div>
          
          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 rounded-xl hover:bg-white/80 hover:shadow-sm transition-all duration-200 transform hover:scale-105"
          >
            <X size={20} className="text-gray-600 hover:text-gray-800" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`
                  group relative flex items-center justify-between px-4 py-3.5 rounded-xl font-medium
                  transition-all duration-200 transform hover:scale-[1.02] hover:shadow-sm
                  ${isActive 
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-200' 
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-700'
                  }
                `}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <div className="flex items-center space-x-3">
                  <Icon 
                    size={20} 
                    className={`transition-all duration-200 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-600 group-hover:text-pink-600 group-hover:scale-110'
                    }`} 
                  />
                  <span className={`font-semibold ${isActive ? 'text-white' : ''}`}>
                    {item.name}
                  </span>
                </div>
                
                {/* Badge */}
                {item.badge && (
                  <span className={`
                    px-2.5 py-1 rounded-full text-xs font-bold
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-pink-100 text-pink-600 group-hover:bg-pink-200'
                    }
                  `}>
                    {item.badge}
                  </span>
                )}
                
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-sm" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-pink-50/50">
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 p-5 rounded-2xl border border-pink-100/50 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                <HelpCircle size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 mb-1 text-sm">Need Help?</h3>
                <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                  Get instant support and guidance for your admin tasks
                </p>
                <button className="text-pink-600 text-sm font-semibold hover:text-pink-700 hover:underline transition-all duration-200 flex items-center gap-1 group/btn">
                  Get Support
                  <Sparkles size={12} className="group-hover/btn:rotate-12 transition-transform duration-200" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Version info */}
          <div className="mt-3 text-center">
            <p className="text-xs text-gray-400 font-medium">Admin Panel v2.1.0</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar