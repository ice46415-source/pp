import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import MenuBrowser from './MenuBrowser';
import Cart from './Cart';
import OrderHistory from './OrderHistory';
import Reservations from './Reservations';
import Profile from './Profile';

type Tab = 'menu' | 'cart' | 'orders' | 'reservations' | 'profile';

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('menu');
  const { user, signOut } = useAuthStore();

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
        <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
          SERVESOFT
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#666' }}>Welcome, {user?.full_name}</span>
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

      <div style={{ display: 'flex', height: 'calc(100vh - 73px)' }}>
        <aside style={{
          width: '240px',
          background: 'white',
          borderRight: '1px solid #ddd',
          padding: '1.5rem 0',
        }}>
          {(['menu', 'cart', 'orders', 'reservations', 'profile'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: activeTab === tab ? '#f0f4ff' : 'transparent',
                border: 'none',
                borderLeft: activeTab === tab ? '3px solid #667eea' : '3px solid transparent',
                color: activeTab === tab ? '#667eea' : '#666',
                textAlign: 'left',
                fontSize: '0.95rem',
                fontWeight: activeTab === tab ? '600' : '400',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </aside>

        <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
          {activeTab === 'menu' && <MenuBrowser />}
          {activeTab === 'cart' && <Cart />}
          {activeTab === 'orders' && <OrderHistory />}
          {activeTab === 'reservations' && <Reservations />}
          {activeTab === 'profile' && <Profile />}
        </main>
      </div>
    </div>
  );
}