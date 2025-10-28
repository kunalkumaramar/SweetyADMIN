import React, { useEffect, useState } from 'react'
import { Search, Menu, LogOut, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../../redux/authSlice.js'

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // ✅ Read from both Redux and localStorage (instant load)
  const { user: reduxUser } = useSelector((state) => state.auth)
  const storedUser = JSON.parse(localStorage.getItem('user'))
  const user = reduxUser || storedUser

  const [localEmail, setLocalEmail] = useState('')

  useEffect(() => {
    // Fallback: try to get user email from localStorage (for display)
    if (storedUser?.email) setLocalEmail(storedUser.email)
  }, [storedUser])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch(logout())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const email = user?.email || localEmail || ''
  const displayName = user?.firstName || (email ? email.split('@')[0] : 'Guest')
  const userInitial = email ? email.charAt(0).toUpperCase() : '?'

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100 sticky top-0 z-50 h-16 transition-all duration-300">
      <div className="flex items-center justify-between px-6 h-full max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:shadow-sm transition-all duration-200 transform hover:scale-105"
          >
            <Menu size={20} className="text-gray-600 hover:text-pink-600 transition-colors" />
          </button>

          <div className="flex items-center space-x-3 lg:hidden">
            <div className="w-9 h-9 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-sm tracking-wide">SI</span>
            </div>
            <h1 className="font-heading font-semibold text-gray-800 text-lg">Sweety Intimates</h1>
          </div>

          {/* Search Bar */}
          <div className="relative hidden md:block group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200">
              <Search size={18} className="text-gray-400 group-focus-within:text-pink-500" />
            </div>
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              className="w-96 pl-12 pr-6 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400/20 focus:border-pink-400 focus:bg-white text-sm placeholder-gray-500 transition-all duration-200 hover:bg-gray-50"
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <button className="flex items-center space-x-3 p-2 pr-4 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-pink-50 hover:shadow-sm transition-all duration-200 border border-transparent hover:border-gray-100">
              <div className="w-9 h-9 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-xl shadow-md flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200 overflow-hidden">
                {user?.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <span className="text-white font-semibold text-sm">{userInitial}</span>
                )}
              </div>

              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-800">
                  {displayName}
                </p>
              </div>
            </button>

            {/* Dropdown */}
            <div className="absolute right-0 top-full mt-3 w-56 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-10">
              <div className="py-3">
                <div className="pt-2">
                  <button
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-700 transition-all duration-200 group/item"
                    onClick={() => navigate('/profile')}
                  >
                    <Settings size={16} className="group-hover/item:rotate-90 transition-transform duration-300" />
                    <span className="font-medium">Profile Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-700 transition-all duration-200 group/logout mt-1"
                  >
                    <LogOut size={16} className="group-hover/logout:-translate-x-1 transition-transform duration-200" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar
