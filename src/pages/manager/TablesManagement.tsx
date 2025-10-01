import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface Table {
  id: string;
  table_number: string;
  capacity: number;
  state: 'FREE' | 'HELD' | 'SEATED' | 'CLEANING';
  position_x: number;
  position_y: number;
}

export default function TablesManagement() {
  const { user } = useAuthStore();
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: '4',
  });

  useEffect(() => {
    loadRestaurantAndTables();
  }, []);

  const loadRestaurantAndTables = async () => {
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

    setRestaurantId(employmentData.restaurant_id);

    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', employmentData.restaurant_id)
      .order('table_number', { ascending: true });

    if (data && !error) {
      setTables(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) {
      alert('Restaurant not found');
      return;
    }

    const { error } = await supabase.from('tables').insert([
      {
        restaurant_id: restaurantId,
        table_number: formData.table_number,
        capacity: parseInt(formData.capacity),
        state: 'FREE',
        qr_code: `QR-${restaurantId}-${formData.table_number}`,
      },
    ]);

    if (!error) {
      setShowForm(false);
      setFormData({ table_number: '', capacity: '4' });
      loadRestaurantAndTables();
    } else {
      alert('Failed to add table');
    }
  };

  const updateTableState = async (tableId: string, newState: 'FREE' | 'HELD' | 'SEATED' | 'CLEANING') => {
    const { error } = await supabase
      .from('tables')
      .update({ state: newState })
      .eq('id', tableId);

    if (!error) {
      loadRestaurantAndTables();
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case 'FREE': return '#10b981';
      case 'HELD': return '#f59e0b';
      case 'SEATED': return '#ef4444';
      case 'CLEANING': return '#6b7280';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div>Loading tables...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333' }}>
          Tables Management
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
          }}
        >
          {showForm ? 'Cancel' : 'Add Table'}
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
            Add New Table
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                Table Number
              </label>
              <input
                type="text"
                value={formData.table_number}
                onChange={(e) => setFormData({ ...formData, table_number: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                required
                min="1"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f97316',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
              }}
            >
              Add Table
            </button>
          </form>
        </div>
      )}

      {tables.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.5rem',
        }}>
          {tables.map((table) => (
            <div
              key={table.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem', color: '#333' }}>
                  Table {table.table_number}
                </h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  Capacity: {table.capacity} people
                </p>
                <span style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.375rem 0.75rem',
                  background: getStateColor(table.state) + '20',
                  color: getStateColor(table.state),
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                }}>
                  {table.state}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {table.state !== 'FREE' && (
                  <button
                    onClick={() => updateTableState(table.id, 'FREE')}
                    style={{
                      padding: '0.5rem',
                      background: '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    Mark Free
                  </button>
                )}
                {table.state === 'FREE' && (
                  <button
                    onClick={() => updateTableState(table.id, 'SEATED')}
                    style={{
                      padding: '0.5rem',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    Mark Seated
                  </button>
                )}
                {table.state === 'SEATED' && (
                  <button
                    onClick={() => updateTableState(table.id, 'CLEANING')}
                    style={{
                      padding: '0.5rem',
                      background: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    Mark Cleaning
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '8px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪑</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No tables</h3>
          <p>Add your first table to get started</p>
        </div>
      )}
    </div>
  );
}