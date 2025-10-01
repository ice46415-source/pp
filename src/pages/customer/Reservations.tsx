import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface Reservation {
  id: string;
  restaurant_id: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: string;
  notes: string | null;
}

export default function Reservations() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadReservations();
    }
  }, [user]);

  const loadReservations = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('customer_id', user.id)
      .order('reservation_date', { ascending: false });

    if (data && !error) {
      setReservations(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#f59e0b';
      case 'CONFIRMED': return '#10b981';
      case 'SEATED': return '#06b6d4';
      case 'COMPLETED': return '#6b7280';
      case 'CANCELLED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div>Loading reservations...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333' }}>
          Reservations
        </h2>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
          }}
        >
          New Reservation
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#333' }}>
            Create Reservation
          </h3>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Feature coming soon. Contact the restaurant directly to make a reservation.
          </p>
          <button
            onClick={() => setShowForm(false)}
            style={{
              padding: '0.5rem 1rem',
              background: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '6px',
            }}
          >
            Close
          </button>
        </div>
      )}

      {reservations.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reservations.map((reservation) => (
            <div
              key={reservation.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                    {new Date(reservation.reservation_date).toLocaleDateString()} at {reservation.reservation_time}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Party size: {reservation.party_size}
                  </p>
                  {reservation.notes && (
                    <p style={{ color: '#666', fontSize: '0.9rem' }}>
                      Notes: {reservation.notes}
                    </p>
                  )}
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.375rem 0.75rem',
                  background: getStatusColor(reservation.status) + '20',
                  color: getStatusColor(reservation.status),
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}>
                  {reservation.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No reservations</h3>
          <p>Make your first reservation to see it here</p>
        </div>
      )}
    </div>
  );
}