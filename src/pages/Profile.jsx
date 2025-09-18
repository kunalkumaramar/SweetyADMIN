// src/pages/Profile.jsx
import React, { useState } from 'react'
import { User, Mail, Phone, Edit3, Save, X, Camera, Shield, Bell, Settings, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Profile() {
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@sweetyintimates.com',
    phone: '+919876543210',
  })
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handlePasswordChange = e =>
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = () => {
    toast.success('Profile updated successfully!')
    setEditing(false)
  }

  const handlePasswordSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match!')
      return
    }
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters!')
      return
    }
    toast.success('Password updated successfully!')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
  }

  const fieldConfig = {
    name: { icon: User, label: 'Full Name', type: 'text' },
    email: { icon: Mail, label: 'Email Address', type: 'email' },
    phone: { icon: Phone, label: 'Phone Number', type: 'tel' }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                AU
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 transition-colors duration-200 shadow-sm">
                <Camera size={14} />
              </button>
            </div>
            
            {/* Info Section */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-600 mb-4">Manage your account information and preferences</p>
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

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-2">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Profile Tab Content */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Personal Information</h2>
                <p className="text-gray-600">Update your personal details and contact information</p>
              </div>
              {!editing && (
                <button 
                  onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                >
                  <Edit3 size={16} />
                  Edit Profile
                </button>
              )}
            </div>

            <div className="space-y-6">
              {Object.entries(fieldConfig).map(([field, config]) => {
                const Icon = config.icon
                return (
                  <div key={field} className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {config.label}
                    </label>
                    <div className="relative">
                      <Icon size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                      {editing ? (
                        <input
                          type={config.type}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                          placeholder={`Enter your ${config.label.toLowerCase()}`}
                        />
                      ) : (
                        <div className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/30 text-gray-700 font-medium">
                          {formData[field]}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {editing && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                <button 
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                >
                  <Save size={16} />
                  Save Changes
                </button>
                <button 
                  onClick={() => setEditing(false)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors duration-200"
                >
                  <X size={16} />
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Security Tab Content */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h2>
              <p className="text-gray-600">Manage your password and security preferences</p>
            </div>

            <div className="space-y-6">
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Shield size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Shield size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="Enter new password"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Shield size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100">
                <button 
                  onClick={handlePasswordSave}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
                >
                  <Save size={16} />
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications Tab Content */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Preferences</h2>
              <p className="text-gray-600">Choose what notifications you'd like to receive</p>
            </div>

            <div className="space-y-6">
              {[
                { id: 'email-orders', label: 'Email notifications for new orders', description: 'Receive emails when new orders are placed' },
                { id: 'email-reports', label: 'Weekly summary reports', description: 'Get weekly business performance summaries' },
                { id: 'sms-alerts', label: 'SMS alerts for urgent matters', description: 'Receive SMS for critical business alerts' },
                { id: 'push-notifications', label: 'Push notifications', description: 'Browser notifications for real-time updates' }
              ].map(option => (
                <div key={option.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50/50 transition-colors">
                  <input 
                    type="checkbox" 
                    id={option.id}
                    defaultChecked={option.id !== 'sms-alerts'}
                    className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <div className="flex-1">
                    <label htmlFor={option.id} className="font-medium text-gray-900 cursor-pointer">
                      {option.label}
                    </label>
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences Tab Content */}
        {activeTab === 'preferences' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Application Preferences</h2>
              <p className="text-gray-600">Customize your application experience</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Language
                  </label>
                  <select className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white">
                    <option>English (US)</option>
                    <option>Hindi</option>
                    <option>Tamil</option>
                    <option>Telugu</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white">
                    <option>Asia/Kolkata (IST)</option>
                    <option>UTC</option>
                    <option>Asia/Dubai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white">
                    <option>DD/MM/YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency Display
                  </label>
                  <select className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 bg-gray-50/50 hover:bg-white">
                    <option>₹ (Indian Rupee)</option>
                    <option>$ (US Dollar)</option>
                    <option>€ (Euro)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}