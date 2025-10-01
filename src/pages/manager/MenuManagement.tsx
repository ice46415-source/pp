import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  category_id: string | null;
}

export default function MenuManagement() {
  const { user } = useAuthStore();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    loadRestaurantAndMenu();
  }, []);

  const loadRestaurantAndMenu = async () => {
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
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', employmentData.restaurant_id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setMenuItems(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) {
      alert('Restaurant not found');
      return;
    }

    const { error } = await supabase.from('menu_items').insert([
      {
        restaurant_id: restaurantId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        is_available: true,
      },
    ]);

    if (!error) {
      setShowForm(false);
      setFormData({ name: '', description: '', price: '' });
      loadRestaurantAndMenu();
    } else {
      alert('Failed to add menu item');
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('menu_items')
      .update({ is_available: !currentStatus })
      .eq('id', itemId);

    if (!error) {
      loadRestaurantAndMenu();
    }
  };

  if (loading) {
    return <div>Loading menu...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333' }}>
          Menu Management
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
          {showForm ? 'Cancel' : 'Add Item'}
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
            Add New Menu Item
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                Price (XAF)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                step="0.01"
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
              Add Item
            </button>
          </form>
        </div>
      )}

      {menuItems.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {menuItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                opacity: item.is_available ? 1 : 0.6,
              }}
            >
              <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                {item.name}
              </h3>
              {item.description && (
                <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                  {item.description}
                </p>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f97316' }}>
                  XAF {item.price.toLocaleString()}
                </span>
                <button
                  onClick={() => toggleAvailability(item.id, item.is_available)}
                  style={{
                    padding: '0.5rem 1rem',
                    background: item.is_available ? '#10b981' : '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                  }}
                >
                  {item.is_available ? 'Available' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '8px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No menu items</h3>
          <p>Add your first menu item to get started</p>
        </div>
      )}
    </div>
  );
}