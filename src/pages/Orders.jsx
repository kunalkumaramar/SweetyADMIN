// src/pages/Orders.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  Filter,
  Package,
  Clock,
  Truck,
  CheckCircle,
  Loader2,
  Eye,
  X,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  fetchAdminOrders,
  updateOrderStatus,
  fetchAdminOrderById,
  clearSuccess,
  clearError,
  clearCurrentOrder,
} from "../redux/orderSlice";


const statusConfig = {
  pending: {
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
    dot: "bg-amber-500",
  },
  processing: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Package,
    dot: "bg-blue-500",
  },
  shipped: {
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Truck,
    dot: "bg-purple-500",
  },
  delivered: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    dot: "bg-green-500",
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: Clock,
    dot: "bg-red-500",
  },
};


const paymentConfig = {
  cod: "bg-orange-50 text-orange-700 border border-orange-200",
  razorpay: "bg-blue-50 text-blue-700 border border-blue-200",
  upi: "bg-green-50 text-green-700 border border-green-200",
  card: "bg-purple-50 text-purple-700 border border-purple-200",
};


export default function Orders() {
  const dispatch = useDispatch();
  const {
    orders = [],
    pagination = {},
    loading,
    error,
    success,
    currentOrder,
  } = useSelector((state) => state.order || {});


  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);


  // Load orders on mount and when filters change
  useEffect(() => {
    const filters = { page: currentPage, limit: itemsPerPage };
    if (statusFilter !== "All") {
      filters.status = statusFilter.toLowerCase();
    }
    if (search.trim()) {
      filters.search = search.trim();
    }
    dispatch(fetchAdminOrders(filters));
  }, [dispatch, currentPage, itemsPerPage, statusFilter, search]);


  // Handle success/error states
  useEffect(() => {
    if (success) {
      toast.success("Order updated successfully!");
      dispatch(clearSuccess());
      dispatch(
        fetchAdminOrders({
          page: currentPage,
          limit: itemsPerPage,
          ...(statusFilter !== "All" && { status: statusFilter.toLowerCase() }),
          ...(search.trim() && { search: search.trim() }),
        })
      );
    }
  }, [success, dispatch, currentPage, itemsPerPage, statusFilter, search]);


  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
      dispatch(clearError());
    }
  }, [error, dispatch]);


  // Handle view details
  const handleViewDetails = async (orderId) => {
    setSelectedOrderId(orderId);
    await dispatch(fetchAdminOrderById(orderId));
    setShowDetailsModal(true);
  };


  // Close modal
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedOrderId(null);
    dispatch(clearCurrentOrder());
  };


  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(
        updateOrderStatus({ id: orderId, status: newStatus.toLowerCase() })
      ).unwrap();
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // Reset to first page when changing items per page
  };


  // Format order data
  const formatOrdersForUI = (apiOrders) => {
    return apiOrders.map((order) => ({
      id: order._id,
      orderNumber: order.orderNumber || `#ORD${order._id?.slice(-4)}`,
      date: new Date(order.createdAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      customer: order.shippingAddress?.name || "N/A",
      contact: order.shippingAddress?.phone || "N/A",
      items: order.items?.length || 0,
      products:
        order.items
          ?.map((item) => item.productName || "Unknown Product")
          .join(", ") || "N/A",
      total: `₹${order.total?.toLocaleString("en-IN") || 0}`,
      payment: order.paymentMethod || "N/A",
      status: order.status || "pending",
      paymentStatus: order.paymentStatus || "pending",
      subtotal: order.subtotal || 0,
      taxAmount: order.taxAmount || 0,
      shippingCharge: order.shippingCharge || 0,
      notes: order.notes || "",
      estimatedDeliveryDate: order.estimatedDeliveryDate || null,
    }));
  };


  const formattedOrders = formatOrdersForUI(orders);
  const filtered = formattedOrders.filter((o) => {
    const matchesStatus =
      statusFilter === "All" ||
      o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });


  const getStatusBadge = (status) => {
    const config =
      statusConfig[status.toLowerCase()] || statusConfig["pending"];
    const Icon = config?.icon;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
        <Icon className="w-3.5 h-3.5" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };


  const getPaymentBadge = (payment) => {
    const config =
      paymentConfig[payment.toLowerCase()] ||
      "bg-gray-50 text-gray-700 border border-gray-200";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${config}`}
      >
        {payment.toUpperCase()}
      </span>
    );
  };


  if (loading && !showDetailsModal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
          <p className="text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-pink-50 via-white to-purple-50 min-h-screen">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Management
        </h1>
        <p className="text-gray-600">Track and manage all customer orders</p>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Orders"
          value={pagination.total || 0}
          icon={Package}
          color="pink"
        />
        <StatsCard
          title="Pending"
          value={filtered.filter((o) => o.status === "pending").length}
          icon={Clock}
          color="amber"
        />
        <StatsCard
          title="Processing"
          value={filtered.filter((o) => o.status === "processing").length}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Delivered"
          value={filtered.filter((o) => o.status === "delivered").length}
          icon={CheckCircle}
          color="green"
        />
      </div>


      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer name or order number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>


      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium mb-1">
                      No orders found
                    </p>
                    <p className="text-sm text-gray-400">
                      Try adjusting your search or filter criteria
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">{order.date}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customer}
                        </p>
                        <p className="text-sm text-gray-500">{order.contact}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.items} items
                        </p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">
                          {order.products}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">
                        {order.total}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getPaymentBadge(order.payment)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewDetails(order.id)}
                        className="p-2 text-pink-500 hover:bg-pink-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filtered.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Results info */}
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium text-gray-900">
                  {(currentPage - 1) * itemsPerPage + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-gray-900">
                  {Math.min(currentPage * itemsPerPage, pagination.total || 0)}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-900">
                  {pagination.total || 0}
                </span>{" "}
                results
              </div>

              {/* Pagination controls */}
              <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const totalPages = pagination.pages || Math.ceil((pagination.total || 0) / itemsPerPage);
                    const pageNumbers = [];
                    const maxVisible = 5;

                    if (totalPages <= maxVisible) {
                      // Show all pages if total is less than max visible
                      for (let i = 1; i <= totalPages; i++) {
                        pageNumbers.push(i);
                      }
                    } else {
                      // Always show first page
                      pageNumbers.push(1);

                      if (currentPage > 3) {
                        pageNumbers.push('...');
                      }

                      // Show pages around current page
                      const start = Math.max(2, currentPage - 1);
                      const end = Math.min(totalPages - 1, currentPage + 1);

                      for (let i = start; i <= end; i++) {
                        pageNumbers.push(i);
                      }

                      if (currentPage < totalPages - 2) {
                        pageNumbers.push('...');
                      }

                      // Always show last page
                      pageNumbers.push(totalPages);
                    }

                    return pageNumbers.map((page, index) => {
                      if (page === '...') {
                        return (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-3 py-2 text-gray-500"
                          >
                            ...
                          </span>
                        );
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-pink-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    });
                  })()}
                </div>

                {/* Next button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={
                    currentPage ===
                    (pagination.pages || Math.ceil((pagination.total || 0) / itemsPerPage))
                  }
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Order Details Modal */}
      {showDetailsModal && currentOrder && (
        <OrderDetailsModal
          order={currentOrder}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
          getStatusBadge={getStatusBadge}
          getPaymentBadge={getPaymentBadge}
        />
      )}
    </div>
  );
}


// Stats Card Component
function StatsCard({ title, value, icon: Icon, color }) {
  const colorClasses = {
    pink: "bg-pink-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
  };


  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}


// Order Details Modal Component
function OrderDetailsModal({
  order,
  onClose,
  onStatusUpdate,
  getStatusBadge,
  getPaymentBadge,
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold">Order Details</h2>
            <p className="text-pink-100 text-sm">
              {order.orderNumber || `#ORD${order._id?.slice(-4)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>


        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Order Date</p>
              <p className="font-semibold text-gray-900">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div className="flex items-center gap-3">
                {getStatusBadge(order.status)}
                <select
                  value={order.status}
                  onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>


          {/* Customer Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Shipping Address
            </h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-900 text-lg">
                {order.shippingAddress?.name}
              </p>
              <p className="text-gray-700">
                {order.shippingAddress?.addressLine1}
              </p>
              {order.shippingAddress?.addressLine2 && (
                <p className="text-gray-700">
                  {order.shippingAddress.addressLine2}
                </p>
              )}
              <p className="text-gray-700">
                {order.shippingAddress?.city}, {order.shippingAddress?.state}
              </p>
              <p className="text-gray-700 font-medium">
                Pincode:{" "}
                {order.shippingAddress?.postalCode ||
                  order.shippingAddress?.pinCode ||
                  "N/A"}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Phone className="w-4 h-4 text-blue-500" />
                <p className="text-gray-900 font-medium">
                  {order.shippingAddress?.phone}
                </p>
              </div>
              {order.shippingAddress?.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <p className="text-gray-900">{order.shippingAddress.email}</p>
                </div>
              )}
            </div>
          </div>


          {/* Products */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-500" />
              Order Items
            </h3>
            <div className="space-y-4">
              {order.items?.map((item, index) => {
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-lg mb-2">
                          {item.productName || "Unknown Product"}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Color</p>
                            <p className="font-medium text-gray-900">
                              {item.color?.colorName ||
                                item.colorName ||
                                "Assorted Colors"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Size</p>
                            <p className="font-medium text-gray-900">
                              {item.size || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Quantity</p>
                            <p className="font-medium text-gray-900">
                              ×{item.quantity || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Price</p>
                            <p className="font-medium text-gray-900">
                              ₹{(item.itemTotal || 0).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* Payment Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-green-500" />
              Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Method</span>
                {getPaymentBadge(order.paymentMethod)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Payment Status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus?.toUpperCase() || "PENDING"}
                </span>
              </div>
              <div className="border-t border-green-200 pt-3 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{(order.subtotal || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Tax</span>
                  <span>₹{(order.taxAmount || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>
                    ₹{(order.shippingCharge || 0).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-green-200">
                  <span>Total</span>
                  <span>₹{(order.total || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>
          </div>


          {/* Notes */}
          {order.notes && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h4 className="font-semibold text-gray-900 mb-2">Order Notes</h4>
              <p className="text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>


        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
