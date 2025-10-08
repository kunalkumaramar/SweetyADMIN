import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Image,
  ExternalLink,
  AlertCircle,
  Eye,
  Grid3X3,
  List,
  Check,
  Loader2,
  X,
  Upload
} from 'lucide-react'
import toast from 'react-hot-toast'
import {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
  clearSuccess,
  clearError
} from '../redux/bannerSlice'
import { uploadColorImage } from '../redux/productSlice'

export default function Banner() {
  const dispatch = useDispatch()
  const {
    banners = [],
    loading,
    error,
    success,
    createdBanner,
    updatedBanner
  } = useSelector(state => state.banner || {})

  const { uploadedImages = [] } = useSelector(state => state.product || {})

  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('grid')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    link: '',
    imageUrl: ''
  })
  const [uploadingImage, setUploadingImage] = useState(false)

  const initializeForm = () => {
    setForm({
      name: '',
      link: '',
      imageUrl: ''
    })
  }

  useEffect(() => {
    dispatch(getBanners())
  }, [dispatch])

  useEffect(() => {
    if (success) {
      toast.success(createdBanner ? 'Banner created successfully!' : 'Banner updated successfully!')
      dispatch(clearSuccess())
      setShowModal(false)
      setEditing(null)
      initializeForm()
      dispatch(getBanners())
    }
  }, [success, createdBanner, updatedBanner, dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'An error occurred')
      dispatch(clearError())
    }
  }, [error, dispatch])

  // Update form imageUrl when image is uploaded
  useEffect(() => {
    if (uploadedImages && uploadedImages.length > 0) {
      setForm(f => ({ ...f, imageUrl: uploadedImages[0] }))
      setUploadingImage(false)
      toast.dismiss()
      toast.success('Image uploaded successfully!')
    }
  }, [uploadedImages])

  const handleInput = (e) => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleImageUpload = async (files) => {
    if (!files || files.length === 0) return

    try {
      setUploadingImage(true)
      toast.loading('Uploading image...')
      
      const file = files[0]
      const formData = new FormData()
      formData.append('image', file)

      // Use the uploadColorImage API from productSlice
      await dispatch(uploadColorImage(formData)).unwrap()
      
    } catch (error) {
      setUploadingImage(false)
      toast.dismiss()
      console.error('Image upload error:', error)
      toast.error('Image upload failed: ' + (error.message || 'Unknown error'))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!form.name.trim()) {
      toast.error('Banner name is required')
      return
    }
    if (!form.imageUrl.trim()) {
      toast.error('Banner image is required')
      return
    }

    try {
      const payload = {
        name: form.name.trim(),
        link: form.link.trim() || '',
        imageUrl: form.imageUrl.trim()
      }

      if (editing) {
        await dispatch(updateBanner({ id: editing._id, bannerData: payload })).unwrap()
      } else {
        await dispatch(createBanner(payload)).unwrap()
      }
    } catch (error) {
      toast.error('Error processing request: ' + (error.message || 'Unknown error'))
    }
  }

  const handleEdit = (banner) => {
    setEditing(banner)
    setForm({
      name: banner.name,
      link: banner.link || '',
      imageUrl: banner.imageUrl
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return
    
    try {
      await dispatch(deleteBanner(id)).unwrap()
      toast.success('Banner deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete banner: ' + (error.message || 'Unknown error'))
    }
  }

  const handleAddNew = () => {
    setShowModal(true)
    setEditing(null)
    initializeForm()
  }

  const filtered = banners.filter(banner => {
    const q = search.toLowerCase()
    return banner.name.toLowerCase().includes(q)
  })

  if (loading && banners.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          <Loader2 className="animate-spin text-3xl text-pink-500 mx-auto mb-4" />
          <span className="text-pink-600 font-medium">Loading banners...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Banner Management</h1>
              <p className="text-pink-100">Manage your website banners with style</p>
            </div>
            <button
              onClick={handleAddNew}
              className="flex items-center bg-white text-pink-600 px-6 py-3 rounded-xl hover:bg-pink-50 transition-all duration-200 shadow-lg font-medium"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add New Banner
            </button>
          </div>
        </div>

        {/* Search and View Toggle */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-pink-100">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-pink-400 h-5 w-5" />
              <input
                placeholder="Search banners by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-2 border-pink-200 px-12 py-3 rounded-xl w-full focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white/80 placeholder-pink-300"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg'
                    : 'bg-white/70 border border-pink-200 text-pink-600 hover:bg-pink-50'
                }`}
              >
                <Grid3X3 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg'
                    : 'bg-white/70 border border-pink-200 text-pink-600 hover:bg-pink-50'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Banners Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(banner => (
              <div
                key={banner._id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-pink-100 hover:border-pink-200"
              >
                <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 relative overflow-hidden">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.name}
                      className="object-cover h-full w-full transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="text-center flex items-center justify-center h-full">
                      <Image className="text-pink-300 h-16 w-16 mx-auto mb-2" />
                    </div>
                  )}
                  {banner.link && (
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2">
                      <ExternalLink className="h-4 w-4 text-pink-600" />
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-xl text-gray-800 truncate">{banner.name}</h3>
                  
                  {banner.link && (
                    <p className="text-sm text-pink-600 truncate">
                      <ExternalLink className="inline h-4 w-4 mr-1" />
                      {banner.link}
                    </p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(banner.createdAt).toLocaleDateString()}
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => handleEdit(banner)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl hover:from-yellow-500 hover:to-orange-500 transition-all duration-200 shadow-md font-medium"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-xl hover:from-red-500 hover:to-pink-500 transition-all duration-200 shadow-md font-medium"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-pink-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-pink-500 to-rose-400 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Link</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-sm font-bold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {filtered.map((banner, index) => (
                    <tr
                      key={banner._id}
                      className={`hover:bg-pink-50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-pink-50/30'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="h-12 w-20 rounded-lg overflow-hidden bg-pink-100">
                          {banner.imageUrl ? (
                            <img
                              src={banner.imageUrl}
                              alt={banner.name}
                              className="object-cover h-full w-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Image className="h-6 w-6 text-pink-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">{banner.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                        {banner.link || 'No link'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(banner.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="p-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-lg hover:from-yellow-500 hover:to-orange-500 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            className="p-2 bg-gradient-to-r from-red-400 to-pink-400 text-white rounded-lg hover:from-red-500 hover:to-pink-500 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl border border-pink-200">
              <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-8 rounded-t-3xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-white">
                      {editing ? 'Edit Banner' : 'Create New Banner'}
                    </h2>
                    <p className="text-pink-100 mt-1">Fill in the banner details below</p>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors text-white"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {/* Banner Name */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Banner Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleInput}
                    placeholder="Enter banner name..."
                    className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                    required
                  />
                </div>

                {/* Banner Link */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Link (Optional)</label>
                  <input
                    name="link"
                    value={form.link}
                    onChange={handleInput}
                    placeholder="https://example.com"
                    className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 focus:border-pink-400 bg-white"
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-bold mb-2 text-gray-700">Banner Image *</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files)}
                      className="w-full border-2 border-pink-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-pink-300 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200"
                      disabled={uploadingImage}
                    />
                    {uploadingImage && (
                      <Loader2 className="animate-spin h-6 w-6 text-pink-500" />
                    )}
                  </div>
                  
                  {form.imageUrl && (
                    <div className="mt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Preview</div>
                      <div className="relative">
                        <img
                          src={form.imageUrl}
                          alt="Banner preview"
                          className="w-full h-48 object-cover rounded-xl border-2 border-pink-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t-2 border-pink-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-8 py-3 border-2 border-pink-300 text-pink-600 rounded-xl hover:bg-pink-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || uploadingImage || !form.imageUrl}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white rounded-xl hover:from-pink-600 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg font-medium"
                  >
                    {(loading || uploadingImage) && <Loader2 className="animate-spin h-5 w-5 mr-2" />}
                    {editing ? 'Update Banner' : 'Create Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
