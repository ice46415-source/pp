import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
  phone: string;
  address: string;
  town_city: string;
  is_active: boolean;
  created_at: string;
}

export default function RestaurantsManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    address: '',
    town_city: '',
  });

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .order('created_at', { ascending: false });

    if (data && !error) {
      setRestaurants(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('restaurants').insert([
      {
        name: formData.name,
        description: formData.description,
        phone: formData.phone,
        address: formData.address,
        town_city: formData.town_city,
        is_active: true,
      },
    ]);

    if (!error) {
      setShowForm(false);
      setFormData({ name: '', description: '', phone: '', address: '', town_city: '' });
      loadRestaurants();
    } else {
      alert('Failed to create restaurant');
    }
  };

  const toggleActive = async (restaurantId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('restaurants')
      .update({ is_active: !currentStatus })
      .eq('id', restaurantId);

    if (!error) {
      loadRestaurants();
    }
  };

  if (loading) {
    return <div>Loading restaurants...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333' }}>
          Restaurants Management
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
          }}
        >
          {showForm ? 'Cancel' : 'Add Restaurant'}
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
            Create New Restaurant
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                  Town/City
                </label>
                <input
                  type="text"
                  value={formData.town_city}
                  onChange={(e) => setFormData({ ...formData, town_city: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
              }}
            >
              Create Restaurant
            </button>
          </form>
        </div>
      )}

      {restaurants.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                opacity: restaurant.is_active ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                    {restaurant.name}
                  </h3>
                  {restaurant.description && (
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                      {restaurant.description}
                    </p>
                  )}
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Phone: {restaurant.phone}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Address: {restaurant.address}, {restaurant.town_city}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Created: {new Date(restaurant.created_at).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => toggleActive(restaurant.id, restaurant.is_active)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: restaurant.is_active ? '#10b981' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                  }}
                >
                  {restaurant.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '8px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏪</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No restaurants</h3>
          <p>Create your first restaurant to get started</p>
        </div>
      )}
    </div>
  );
}