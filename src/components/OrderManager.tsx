import React, { useState } from 'react';
import { ArrowLeft, RefreshCw, Search, Clock, CheckCircle, XCircle, Package, Truck, ChefHat, Eye, X } from 'lucide-react';
import { useOrders } from '../hooks/useOrders';
import { Order, OrderStatus } from '../types';

interface OrderManagerProps {
    onBack: () => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', color: 'text-yellow-800', bgColor: 'bg-yellow-100', icon: <Clock className="h-4 w-4" /> },
    confirmed: { label: 'Confirmed', color: 'text-blue-800', bgColor: 'bg-blue-100', icon: <CheckCircle className="h-4 w-4" /> },
    preparing: { label: 'Preparing', color: 'text-orange-800', bgColor: 'bg-orange-100', icon: <ChefHat className="h-4 w-4" /> },
    ready: { label: 'Ready', color: 'text-green-800', bgColor: 'bg-green-100', icon: <Package className="h-4 w-4" /> },
    completed: { label: 'Completed', color: 'text-gray-800', bgColor: 'bg-gray-100', icon: <CheckCircle className="h-4 w-4" /> },
    cancelled: { label: 'Cancelled', color: 'text-red-800', bgColor: 'bg-red-100', icon: <XCircle className="h-4 w-4" /> }
};

const OrderManager: React.FC<OrderManagerProps> = ({ onBack }) => {
    const { orders, loading, fetchOrders, updateOrderStatus, getOrderStats } = useOrders();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [serviceFilter, setServiceFilter] = useState<'all' | 'dine-in' | 'pickup' | 'delivery'>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    const stats = getOrderStats();

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.contact_number.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesService = serviceFilter === 'all' || order.service_type === serviceFilter;
        return matchesSearch && matchesStatus && matchesService;
    });

    const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
        try {
            setIsUpdating(true);
            await updateOrderStatus(orderId, newStatus);
            if (selectedOrder?.id === orderId) {
                setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            alert('Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={onBack}
                                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Dashboard</span>
                            </button>
                            <h1 className="text-2xl font-playfair font-semibold text-black">Orders</h1>
                        </div>
                        <button
                            onClick={() => fetchOrders()}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-4">
                        <div className="text-2xl font-bold text-gray-900">{stats.todayOrders}</div>
                        <div className="text-sm text-gray-500">Today</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                        <div className="text-sm text-yellow-600">Pending</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">{stats.confirmed}</div>
                        <div className="text-sm text-blue-600">Confirmed</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl shadow-sm p-4 border border-orange-200">
                        <div className="text-2xl font-bold text-orange-700">{stats.preparing}</div>
                        <div className="text-sm text-orange-600">Preparing</div>
                    </div>
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-700">{stats.ready}</div>
                        <div className="text-sm text-green-600">Ready</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-700">{stats.completed}</div>
                        <div className="text-sm text-gray-600">Completed</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or contact..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent text-gray-900"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-gray-900"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value as 'all' | 'dine-in' | 'pickup' | 'delivery')}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-gray-900"
                        >
                            <option value="all">All Services</option>
                            <option value="dine-in">Dine In</option>
                            <option value="pickup">Pickup</option>
                            <option value="delivery">Delivery</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading orders...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="p-8 text-center">
                            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600">No orders found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <span className="font-semibold text-gray-900">{order.customer_name}</span>
                                                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].bgColor} ${statusConfig[order.status].color}`}>
                                                    {statusConfig[order.status].icon}
                                                    <span>{statusConfig[order.status].label}</span>
                                                </span>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                                                    {order.service_type === 'dine-in' ? <Truck className="h-3 w-3 mr-1" /> : null}
                                                    {order.service_type}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-500 space-x-4">
                                                <span>📞 {order.contact_number}</span>
                                                <span>💵 ₱{order.total.toFixed(2)}</span>
                                                <span>🕐 {formatDate(order.created_at)}</span>
                                                {order.items && <span>📦 {order.items.length} items</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setSelectedOrder(order)}
                                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                title="View Details"
                                            >
                                                <Eye className="h-5 w-5" />
                                            </button>
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                disabled={isUpdating}
                                                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-black text-gray-900"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="confirmed">Confirmed</option>
                                                <option value="preparing">Preparing</option>
                                                <option value="ready">Ready</option>
                                                <option value="completed">Completed</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Customer Info */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Customer</h3>
                                <p className="text-lg font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                                <p className="text-gray-600">{selectedOrder.contact_number}</p>
                            </div>

                            {/* Service Details */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Service</h3>
                                <p className="text-gray-900 capitalize">{selectedOrder.service_type}</p>
                                {selectedOrder.address && <p className="text-gray-600">📍 {selectedOrder.address}</p>}
                                {selectedOrder.landmark && <p className="text-gray-500 text-sm">Landmark: {selectedOrder.landmark}</p>}
                                {selectedOrder.party_size && <p className="text-gray-600">👥 Party of {selectedOrder.party_size}</p>}
                                {selectedOrder.preferred_time && <p className="text-gray-600">🕐 {selectedOrder.preferred_time}</p>}
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Items</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                    {selectedOrder.items?.map((item, index) => (
                                        <div key={index} className="flex justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{item.item_name}</p>
                                                {item.variation_name && <p className="text-sm text-gray-500">{item.variation_name}</p>}
                                                {item.add_ons && item.add_ons.length > 0 && (
                                                    <p className="text-sm text-gray-500">
                                                        + {item.add_ons.map(a => a.name).join(', ')}
                                                    </p>
                                                )}
                                                <p className="text-sm text-gray-500">x{item.quantity}</p>
                                            </div>
                                            <p className="font-medium text-gray-900">₱{item.total_price.toFixed(2)}</p>
                                        </div>
                                    )) || <p className="text-gray-500">No items</p>}
                                </div>
                            </div>

                            {/* Payment & Notes */}
                            <div className="flex justify-between border-t pt-4">
                                <div>
                                    <p className="text-sm text-gray-500">Payment: {selectedOrder.payment_method}</p>
                                    {selectedOrder.notes && <p className="text-sm text-gray-500 mt-1">📝 {selectedOrder.notes}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="text-2xl font-bold text-gray-900">₱{selectedOrder.total.toFixed(2)}</p>
                                </div>
                            </div>

                            {/* Status Update */}
                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
                                <select
                                    value={selectedOrder.status}
                                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                                    disabled={isUpdating}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black text-gray-900"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="ready">Ready</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;
