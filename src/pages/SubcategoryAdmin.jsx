import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  X
} from 'lucide-react';
import {
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getSubCategoriesPaginated,
  getSubCategoryById,
  clearSuccess,
  clearError
} from '../redux/subcategorySlice'; // Adjust import path as needed

const SubcategoryAdmin = () => {
  const dispatch = useDispatch();
  
  // Check if Redux store is properly configured
  const subCategoryState = useSelector(state => {
    if (!state.subCategory) {
      console.error('SubCategory slice not found in Redux store. Make sure to add it to your store configuration.');
      return {};
    }
    return state.subCategory;
  });
  
  const { 
    subCategories = [], 
    selectedSubCategory = null,
    pagination = { total: 0, totalPages: 0, currentPage: 1 },
    loading = false, 
    error = null, 
    success = false,
    createdSubCategory = null,
    updatedSubCategory = null,
    deletedSubCategoryId = null
  } = subCategoryState;

  // Local state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    isActive: true
  });

  // Load subcategories on component mount
  useEffect(() => {
    dispatch(getSubCategoriesPaginated({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  // Handle success/error messages
  useEffect(() => {
    if (success) {
      if (createdSubCategory || updatedSubCategory || deletedSubCategoryId) {
        setShowModal(false);
        resetForm();
        // Refresh the list
        dispatch(getSubCategoriesPaginated({ page: currentPage, limit: itemsPerPage }));
      }
      setTimeout(() => dispatch(clearSuccess()), 3000);
    }
  }, [success, createdSubCategory, updatedSubCategory, deletedSubCategoryId, dispatch, currentPage, itemsPerPage]);

  useEffect(() => {
    if (error) {
      setTimeout(() => dispatch(clearError()), 5000);
    }
  }, [error, dispatch]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      categoryId: '',
      isActive: true
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = () => {
    if (modalMode === 'create') {
      dispatch(createSubCategory(formData));
    } else if (modalMode === 'edit' && selectedSubCategory) {
      dispatch(updateSubCategory({ 
        id: selectedSubCategory._id, 
        updateData: formData 
      }));
    }
  };

  const handleEdit = (subcategory) => {
    setFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      categoryId: subcategory.categoryId || '',
      isActive: subcategory.isActive !== false
    });
    setModalMode('edit');
    setShowModal(true);
    dispatch(getSubCategoryById(subcategory._id));
  };

  const handleView = (subcategory) => {
    setModalMode('view');
    setShowModal(true);
    dispatch(getSubCategoryById(subcategory._id));
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      dispatch(deleteSubCategory(id));
    }
  };

  const handleCreate = () => {
    resetForm();
    setModalMode('create');
    setShowModal(true);
  };

  const filteredSubCategories = subCategories?.filter(sub =>
    sub.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Subcategory Management</h1>
          <p className="text-gray-600">Manage your product subcategories</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-pink-100 border border-pink-300 rounded-lg text-pink-800">
            Operation completed successfully!
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
            {typeof error === 'object' ? error.message : error}
          </div>
        )}

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search subcategories..."
                className="pl-10 pr-4 py-2 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Subcategory
          </button>
        </div>

        {/* Subcategories Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pink-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Loading subcategories...
                    </td>
                  </tr>
                ) : filteredSubCategories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No subcategories found
                    </td>
                  </tr>
                ) : (
                  filteredSubCategories.map((subcategory) => (
                    <tr key={subcategory._id} className="hover:bg-pink-25">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {subcategory.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {subcategory.description || 'No description'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          subcategory.isActive !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subcategory.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleView(subcategory)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(subcategory)}
                            className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subcategory._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} results
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  Page {currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {modalMode === 'create' && 'Create Subcategory'}
                    {modalMode === 'edit' && 'Edit Subcategory'}
                    {modalMode === 'view' && 'View Subcategory'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {modalMode === 'view' ? (
                  <div className="space-y-4">
                    {selectedSubCategory && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <p className="text-gray-900">{selectedSubCategory.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <p className="text-gray-900">{selectedSubCategory.description || 'No description'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                            selectedSubCategory.isActive !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedSubCategory.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category ID
                      </label>
                      <input
                        type="text"
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-400"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-pink-500 focus:ring-pink-400"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                        Active
                      </label>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Update'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubcategoryAdmin;