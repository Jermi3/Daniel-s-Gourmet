import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, OrderStatus } from '../types';

export const useOrders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch orders with their items
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;

            // Fetch all order items
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*');

            if (itemsError) throw itemsError;

            // Combine orders with their items
            const ordersWithItems = (ordersData || []).map(order => ({
                ...order,
                items: (itemsData || []).filter(item => item.order_id === order.id)
            }));

            setOrders(ordersWithItems);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const createOrder = async (
        orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'items'>,
        items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]
    ): Promise<Order | null> => {
        try {
            // Insert the order
            const { data: newOrder, error: orderError } = await supabase
                .from('orders')
                .insert([orderData])
                .select()
                .single();

            if (orderError) throw orderError;

            // Insert order items
            const orderItems = items.map(item => ({
                ...item,
                order_id: newOrder.id
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Refresh orders list
            await fetchOrders();

            return newOrder;
        } catch (err) {
            console.error('Error creating order:', err);
            throw err;
        }
    };

    const updateOrderStatus = async (orderId: string, status: OrderStatus): Promise<void> => {
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status })
                .eq('id', orderId);

            if (error) throw error;

            // Update local state
            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId
                        ? { ...order, status, updated_at: new Date().toISOString() }
                        : order
                )
            );
        } catch (err) {
            console.error('Error updating order status:', err);
            throw err;
        }
    };

    const getOrderById = async (orderId: string): Promise<Order | null> => {
        try {
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (orderError) throw orderError;

            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;

            return { ...order, items: items || [] };
        } catch (err) {
            console.error('Error fetching order:', err);
            return null;
        }
    };

    const getOrderStats = () => {
        const pending = orders.filter(o => o.status === 'pending').length;
        const confirmed = orders.filter(o => o.status === 'confirmed').length;
        const preparing = orders.filter(o => o.status === 'preparing').length;
        const ready = orders.filter(o => o.status === 'ready').length;
        const completed = orders.filter(o => o.status === 'completed').length;
        const cancelled = orders.filter(o => o.status === 'cancelled').length;
        const total = orders.length;
        const todayOrders = orders.filter(o => {
            const orderDate = new Date(o.created_at).toDateString();
            const today = new Date().toDateString();
            return orderDate === today;
        }).length;

        return { pending, confirmed, preparing, ready, completed, cancelled, total, todayOrders };
    };

    return {
        orders,
        loading,
        error,
        fetchOrders,
        createOrder,
        updateOrderStatus,
        getOrderById,
        getOrderStats
    };
};
