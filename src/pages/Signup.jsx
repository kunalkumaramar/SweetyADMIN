import React, { useState, useEffect } from 'react'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  Shield,
  Sparkles
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDispatch, useSelector } from 'react-redux'
import { adminSignup } from '../redux/authSlice' // update with actual path

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirm: ''
  })
  const [showPwd, setShowPwd] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Get loading, success, error from Redux auth slice
  const { loading, error, success } = useSelector((state) => state.auth)

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const getPasswordStrength = (password) => {
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const passwordStrength = getPasswordStrength(form.password)
  const strengthColors = [
    'bg-red-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ]
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Signup failed')
    }
  }, [error])

  useEffect(() => {
    if (success) {
      toast.success('Account created successfully! Welcome aboard!')
      navigate('/dashboard')
    }
  }, [success, navigate])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }
    if (passwordStrength < 3) {
      toast.error('Please use a stronger password')
      return
    }

    // Prepare payload for signup
    const signupData = {
      firstName: form.firstName,
      lastName: form.lastName,
      phoneNumber: form.phoneNumber,
      email: form.email,
      password: form.password
    }

    dispatch(adminSignup(signupData))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-teal-200/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/25">
              <div className="relative">
                <span className="text-white font-bold text-2xl">SI</span>
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-white/80" />
              </div>
            </div>
            <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-3xl mx-auto blur-xl opacity-50"></div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">
            Create Account
          </h1>
          <p className="text-gray-600 text-lg">Join the Sweety Intimates team</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* First Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                First Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={20}
                    className="text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                  />
                </div>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Last Name Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Last Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={20}
                    className="text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                  />
                </div>
                <input
                  type="text"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Phone Number
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User
                    size={20}
                    className="text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                  />
                </div>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail
                    size={20}
                    className="text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                  />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@sweetyintimates.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    size={20}
                    className="text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                  />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-14 py-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-100/50 rounded-r-2xl transition-colors duration-200"
                >
                  {showPwd ? (
                    <EyeOff
                      size={20}
                      className="text-gray-400 hover:text-gray-600"
                    />
                  ) : (
                    <Eye size={20} className="text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          i < passwordStrength
                            ? strengthColors[passwordStrength - 1]
                            : 'bg-gray-200'
                        }`}
                      ></div>
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      passwordStrength < 3
                        ? 'text-red-600'
                        : passwordStrength < 4
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}
                  >
                    {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock
                    size={20}
                    className="text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200"
                  />
                </div>
                <input
                  type={showPwd ? 'text' : 'password'}
                  name="confirm"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-14 py-4 bg-gray-50/50 border border-gray-200/50 rounded-2xl focus:bg-white focus:border-emerald-300 focus:ring-4 focus:ring-emerald-500/10 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  required
                />
                {form.confirm && form.password && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {form.password === form.confirm ? (
                      <Check size={20} className="text-green-500" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-gray-200/50 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 leading-relaxed">
                  By creating an account, you agree to our{' '}
                  <Link
                    to="#"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    to="#"
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white font-semibold py-4 px-6 rounded-2xl hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 focus:ring-4 focus:ring-emerald-500/20 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
              {loading ? (
                <div className="flex items-center justify-center relative z-10">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center justify-center relative z-10">
                  <span>Create Account</span>
                  <ArrowRight
                    size={18}
                    className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
                  />
                </div>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 rounded-full">
                Already have an account?
              </span>
            </div>
          </div>

          {/* Sign In Link */}
          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center w-full py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-2xl transition-all duration-200 group"
            >
              Sign In Instead
              <ArrowRight
                size={16}
                className="ml-2 group-hover:translate-x-1 transition-transform duration-200"
              />
            </Link>
          </div>
        </div>

        {/* Security Notice */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 flex items-center justify-center gap-2">
            <Shield size={16} className="text-emerald-500" />
            Your data is protected with enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  )
}
