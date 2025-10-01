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
}

export default function OrderHistory() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('id, order_code, order_type, status, total_amount, created_at')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setOrders(data);
    }
    setLoading(false);
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

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: '#333' }}>
        Order History
      </h2>

      {orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
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
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </p>
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
                    {order.order_type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '1.125rem', color: '#f97316' }}>
                  XAF {order.total_amount.toLocaleString()}
                </span>
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#f5f5f5',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                  }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No orders yet</h3>
          <p>Your order history will appear here</p>
        </div>
      )}
    </div>
  );
}