import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface DeliveryAssignment {
  id: string;
  order_id: string;
  status: string;
  created_at: string;
  order: {
    order_code: string;
    customer_name: string | null;
    customer_phone: string | null;
    delivery_address: any;
    total_amount: number;
  };
}

export default function DeliveryDashboard() {
  const { user, signOut } = useAuthStore();
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.is_available || false);

  useEffect(() => {
    if (user) {
      loadAssignments();
      setIsAvailable(user.is_available);
    }
  }, [user]);

  const loadAssignments = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('delivery_assignments')
      .select(`
        id,
        order_id,
        status,
        created_at,
        orders (
          order_code,
          customer_name,
          customer_phone,
          delivery_address,
          total_amount
        )
      `)
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      const formattedData = data.map((item: any) => ({
        id: item.id,
        order_id: item.order_id,
        status: item.status,
        created_at: item.created_at,
        order: item.orders,
      }));
      setAssignments(formattedData);
    }
    setLoading(false);
  };

  const toggleAvailability = async () => {
    if (!user) return;

    const newStatus = !isAvailable;
    const { error } = await supabase
      .from('users')
      .update({ is_available: newStatus })
      .eq('id', user.id);

    if (!error) {
      setIsAvailable(newStatus);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, newStatus: string) => {
    const updates: any = { status: newStatus };

    if (newStatus === 'ACCEPTED') {
      updates.accepted_at = new Date().toISOString();
    } else if (newStatus === 'PICKED_UP') {
      updates.picked_up_at = new Date().toISOString();
    } else if (newStatus === 'DELIVERED') {
      updates.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('delivery_assignments')
      .update(updates)
      .eq('id', assignmentId);

    if (!error) {
      loadAssignments();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'ACCEPTED': return '#3b82f6';
      case 'PICKED_UP': return '#8b5cf6';
      case 'OUT_FOR_DELIVERY': return '#06b6d4';
      case 'DELIVERED': return '#10b981';
      case 'DECLINED':
      case 'FAILED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #ddd',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
            SERVESOFT
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>Delivery Dashboard</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>{user?.full_name}</span>
          <button
            onClick={signOut}
            style={{
              padding: '0.5rem 1rem',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '6px',
              color: '#666',
            }}
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                Availability Status
              </h2>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>
                {isAvailable ? 'You are available for deliveries' : 'You are currently unavailable'}
              </p>
            </div>
            <button
              onClick={toggleAvailability}
              style={{
                padding: '0.75rem 1.5rem',
                background: isAvailable ? '#10b981' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '1rem',
              }}
            >
              {isAvailable ? 'Available' : 'Unavailable'}
            </button>
          </div>
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: '#333' }}>
          My Deliveries
        </h2>

        {assignments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                      Order {assignment.order.order_code}
                    </h3>
                    {assignment.order.customer_name && (
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Customer: {assignment.order.customer_name}
                      </p>
                    )}
                    {assignment.order.customer_phone && (
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Phone: {assignment.order.customer_phone}
                      </p>
                    )}
                    {assignment.order.delivery_address && (
                      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                        Address: {JSON.stringify(assignment.order.delivery_address)}
                      </p>
                    )}
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      Amount: XAF {assignment.order.total_amount.toLocaleString()}
                    </p>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.375rem 0.75rem',
                    background: getStatusColor(assignment.status) + '20',
                    color: getStatusColor(assignment.status),
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}>
                    {assignment.status.replace('_', ' ')}
                  </span>
                </div>

                <div style={{
                  borderTop: '1px solid #eee',
                  paddingTop: '1rem',
                  display: 'flex',
                  gap: '0.5rem',
                }}>
                  {assignment.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateAssignmentStatus(assignment.id, 'ACCEPTED')}
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
                        Accept
                      </button>
                      <button
                        onClick={() => updateAssignmentStatus(assignment.id, 'DECLINED')}
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
                        Decline
                      </button>
                    </>
                  )}
                  {assignment.status === 'ACCEPTED' && (
                    <button
                      onClick={() => updateAssignmentStatus(assignment.id, 'PICKED_UP')}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                      }}
                    >
                      Mark Picked Up
                    </button>
                  )}
                  {assignment.status === 'PICKED_UP' && (
                    <button
                      onClick={() => updateAssignmentStatus(assignment.id, 'OUT_FOR_DELIVERY')}
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
                      Out for Delivery
                    </button>
                  )}
                  {assignment.status === 'OUT_FOR_DELIVERY' && (
                    <button
                      onClick={() => updateAssignmentStatus(assignment.id, 'DELIVERED')}
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
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '8px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚚</div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No deliveries</h3>
            <p>New delivery assignments will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}