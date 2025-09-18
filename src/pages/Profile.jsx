import React, { useState, useEffect } from 'react'
import { User, Mail, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { getAdminProfile } from '../redux/authSlice' // update with actual path

export default function Profile() {
  const dispatch = useDispatch()
  const { user, loading, error } = useSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: ''
  })

  useEffect(() => {
    dispatch(getAdminProfile())
  }, [dispatch])

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || ''
      })
    }
  }, [user])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to fetch profile')
    }
  }, [error])

  const fieldConfig = {
    firstName: { icon: User, label: 'First Name' },
    lastName: { icon: User, label: 'Last Name' },
    phoneNumber: { icon: Phone, label: 'Phone Number' },
    email: { icon: Mail, label: 'Email Address' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {user && user.firstName
                  ? user.firstName[0].toUpperCase() +
                    (user.lastName ? user.lastName[0].toUpperCase() : '')
                  : 'AU'}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-600 mb-4">Account information</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Online
                </span>
                <span>Last updated: Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
          <div className="space-y-6">
            {Object.entries(fieldConfig).map(([field, config]) => {
              const Icon = config.icon
              return (
                <div key={field} className="flex items-center gap-4">
                  <Icon size={24} className="text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">{config.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{formData[field]}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
