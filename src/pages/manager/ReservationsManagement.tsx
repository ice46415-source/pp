import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  status: string;
  notes: string | null;
}

export default function ReservationsManagement() {
  const { user } = useAuthStore();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
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
      .from('reservations')
      .select('*')
      .eq('restaurant_id', employmentData.restaurant_id)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true });

    if (data && !error) {
      setReservations(data);
    }
    setLoading(false);
  };

  const updateReservationStatus = async (reservationId: string, newStatus: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', reservationId);

    if (!error) {
      loadReservations();
    }
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
          Reservations Management
        </h2>
        <button
          onClick={loadReservations}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
          }}
        >
          Refresh
        </button>
      </div>

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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                    {reservation.customer_name}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Phone: {reservation.customer_phone}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Date: {new Date(reservation.reservation_date).toLocaleDateString()} at {reservation.reservation_time}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Party size: {reservation.party_size} people
                  </p>
                  {reservation.notes && (
                    <p style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '0.5rem' }}>
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

              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '1rem',
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
              }}>
                {reservation.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'CONFIRMED')}
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
                      Confirm
                    </button>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}
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
                  </>
                )}
                {reservation.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'SEATED')}
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
                      Mark Seated
                    </button>
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'CANCELLED')}
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
                  </>
                )}
                {reservation.status === 'SEATED' && (
                  <button
                    onClick={() => updateReservationStatus(reservation.id, 'COMPLETED')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#6b7280',
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
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '8px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No reservations</h3>
          <p>Reservations will appear here when customers book</p>
        </div>
      )}
    </div>
  );
}