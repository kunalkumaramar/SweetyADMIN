import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Import Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Categories from './pages/Categories'
import Subcategories from './pages/Subcategories'
import Orders from './pages/Orders'
import Discount from './pages/Discount'
import Profile from './pages/Profile'

// Import Layout Components
import Navbar from './components/common/Navbar'
import Sidebar from './components/common/Sidebar'
import SubcategoryAdmin from './pages/SubcategoryAdmin'

// Mock Authentication
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  )
  
  const login = () => {
    localStorage.setItem('isAuthenticated', 'true')
    setIsAuthenticated(true)
  }
  
  const logout = () => {
    localStorage.removeItem('isAuthenticated')
    setIsAuthenticated(false)
  }
  
  return { isAuthenticated, login, logout }
}

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Layout Component
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-64 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/products" element={
            <ProtectedRoute>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/categories" element={
            <ProtectedRoute>
              <Layout>
                <Categories />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="/subcategory" element={
            <ProtectedRoute>
              <Layout>
                <SubcategoryAdmin/>
              </Layout>
            </ProtectedRoute>
          }/>
          
          <Route path="/subcategories" element={
            <ProtectedRoute>
              <Layout>
                <Subcategories />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/discount" element={
            <ProtectedRoute>
              <Layout>
                <Discount />
              </Layout>
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#111827',
              border: '1px solid #E5E7EB',
            },
            success: {
              style: {
                border: '1px solid #10B981',
              },
            },
            error: {
              style: {
                border: '1px solid #EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App