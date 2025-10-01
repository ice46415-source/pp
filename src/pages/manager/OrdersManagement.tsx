import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface Order {
  id: string;
  order_code: string;
  order_type: string;
  status: string;
  total_amount: number;
  created_at: string;
  customer_name: string | null;
  customer_phone: string | null;
}

export default function OrdersManagement() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    const { data: employmentData } = await supabase
      .from('employment_records')
      .select('restaurant_id')
      .eq('user_id', user?.id || '')
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (!employmentData) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('restaurant_id', employmentData.restaurant_id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setOrders(data);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (!error) {
      loadOrders();
    } else {
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RECEIVED': return '#3b82f6';
      case 'IN_PREP': return '#f59e0b';
      case 'READY': return '#10b981';
      case 'COMPLETED':
      case 'DELIVERED': return '#06b6d4';
      case 'CANCELLED':
      case 'FAILED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus && order.status !== filterStatus) return false;
    if (filterType && order.order_type !== filterType) return false;
    return true;
  });

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333' }}>
          Orders Management
        </h2>
        <button
          onClick={loadOrders}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            background: 'white',
          }}
        >
          <option value="">All Statuses</option>
          <option value="RECEIVED">Received</option>
          <option value="IN_PREP">In Preparation</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            background: 'white',
          }}
        >
          <option value="">All Types</option>
          <option value="TABLE">Table</option>
          <option value="PREORDER">Pre-order</option>
          <option value="DELIVERY">Delivery</option>
        </select>
      </div>

      {filteredOrders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem', color: '#333' }}>
                    {order.order_code}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                  {order.customer_name && (
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      Customer: {order.customer_name} {order.customer_phone && `(${order.customer_phone})`}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.375rem 0.75rem',
                    background: getStatusColor(order.status) + '20',
                    color: getStatusColor(order.status),
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                  }}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    {order.order_type}
                  </p>
                </div>
              </div>

              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontWeight: '700', fontSize: '1.125rem', color: '#f97316' }}>
                  XAF {order.total_amount.toLocaleString()}
                </span>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {order.status === 'RECEIVED' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'IN_PREP')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#f59e0b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                      }}
                    >
                      Start Prep
                    </button>
                  )}
                  {order.status === 'IN_PREP' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'READY')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                      }}
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === 'READY' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#06b6d4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                      }}
                    >
                      Complete
                    </button>
                  )}
                  {(order.status === 'RECEIVED' || order.status === 'IN_PREP') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '8px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📋</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No orders found</h3>
          <p>Orders will appear here when customers place them</p>
        </div>
      )}
    </div>
  );
}