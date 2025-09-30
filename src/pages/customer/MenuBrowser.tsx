import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useCartStore } from '../../stores/cartStore';

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_available: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  description: string | null;
}

export default function MenuBrowser() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    loadRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      loadMenuItems(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const loadRestaurants = async () => {
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, description')
      .eq('is_active', true);

    if (data && !error) {
      setRestaurants(data);
      if (data.length > 0) {
        setSelectedRestaurant(data[0].id);
      }
    }
    setLoading(false);
  };

  const loadMenuItems = async (restaurantId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true);

    if (data && !error) {
      setMenuItems(data);
    }
    setLoading(false);
  };

  const handleAddToCart = (item: MenuItem) => {
    if (selectedRestaurant) {
      addItem({
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        restaurantId: selectedRestaurant,
      });
    }
  };

  if (loading) {
    return <div>Loading menu...</div>;
  }

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: '#333' }}>
        Browse Menu
      </h2>

      {restaurants.length > 0 ? (
        <>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
              Select Restaurant
            </label>
            <select
              value={selectedRestaurant || ''}
              onChange={(e) => setSelectedRestaurant(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '1rem',
                minWidth: '300px',
              }}
            >
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name}
                </option>
              ))}
            </select>
          </div>

          {menuItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
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
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {item.image_url && (
                    <div style={{
                      width: '100%',
                      height: '160px',
                      background: '#f0f0f0',
                      borderRadius: '6px',
                      marginBottom: '1rem',
                      backgroundImage: `url(${item.image_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }} />
                  )}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                    {item.name}
                  </h3>
                  {item.description && (
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem', flexGrow: 1 }}>
                      {item.description}
                    </p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: '700', color: '#667eea' }}>
                      XAF {item.price.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '500',
                        fontSize: '0.9rem',
                      }}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              No menu items available at this restaurant.
            </div>
          )}
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          No restaurants available at the moment.
        </div>
      )}
    </div>
  );
}