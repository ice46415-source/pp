import { useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalAmount, orderType, setOrderType, placeOrder } = useCartStore();
  const { user } = useAuthStore();
  const [placing, setPlacing] = useState(false);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  const handlePlaceOrder = async () => {
    if (!orderType) {
      alert('Please select an order type');
      return;
    }

    if (!user) {
      alert('Please log in to place an order');
      return;
    }

    setPlacing(true);
    try {
      const code = await placeOrder(user.id);
      setOrderCode(code);
    } catch (error: any) {
      alert('Failed to place order: ' + error.message);
    } finally {
      setPlacing(false);
    }
  };

  if (orderCode) {
    return (
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '3rem',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1rem', color: '#333' }}>
          Order Placed Successfully!
        </h2>
        <p style={{ color: '#666', marginBottom: '0.5rem' }}>Your order code:</p>
        <p style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: '#667eea',
          padding: '1rem',
          background: '#f0f4ff',
          borderRadius: '6px',
          marginBottom: '2rem',
        }}>
          {orderCode}
        </p>
        <button
          onClick={() => setOrderCode(null)}
          style={{
            padding: '0.75rem 2rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
          }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your cart is empty</h2>
        <p>Add items from the menu to get started</p>
      </div>
    );
  }

  const subtotal = getTotalAmount();
  const deliveryFee = orderType === 'DELIVERY' ? 1500 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: '#333' }}>
        Your Cart
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <div>
          {items.map((item) => (
            <div
              key={item.menuItemId}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '1.25rem',
                marginBottom: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.25rem', color: '#333' }}>
                    {item.name}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    XAF {item.price.toLocaleString()} each
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1.25rem',
                        lineHeight: '1',
                      }}
                    >
                      −
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '600' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      style={{
                        width: '32px',
                        height: '32px',
                        background: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '1.25rem',
                        lineHeight: '1',
                      }}
                    >
                      +
                    </button>
                  </div>
                  <span style={{ fontWeight: '700', color: '#667eea', minWidth: '100px', textAlign: 'right' }}>
                    XAF {(item.price * item.quantity).toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeItem(item.menuItemId)}
                    style={{
                      padding: '0.5rem',
                      background: '#fee',
                      border: '1px solid #fcc',
                      borderRadius: '4px',
                      color: '#c33',
                      fontSize: '0.9rem',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '1.5rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: '1rem',
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', color: '#333' }}>
              Order Summary
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                Order Type
              </label>
              <select
                value={orderType || ''}
                onChange={(e) => setOrderType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '1rem',
                }}
              >
                <option value="">Select type...</option>
                <option value="TABLE">Dine-in (Table)</option>
                <option value="PREORDER">Pre-order (Pickup)</option>
                <option value="DELIVERY">Delivery</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: '#666' }}>Subtotal</span>
                <span style={{ fontWeight: '600' }}>XAF {subtotal.toLocaleString()}</span>
              </div>
              {orderType === 'DELIVERY' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#666' }}>Delivery Fee</span>
                  <span style={{ fontWeight: '600' }}>XAF {deliveryFee.toLocaleString()}</span>
                </div>
              )}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid #eee',
                fontSize: '1.125rem',
              }}>
                <span style={{ fontWeight: '700', color: '#333' }}>Total</span>
                <span style={{ fontWeight: '700', color: '#667eea' }}>XAF {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placing || !orderType}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: placing || !orderType ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: placing || !orderType ? 'not-allowed' : 'pointer',
              }}
            >
              {placing ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}