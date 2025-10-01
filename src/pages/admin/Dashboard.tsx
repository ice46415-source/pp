import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import RestaurantsManagement from './RestaurantsManagement';
import UsersManagement from './UsersManagement';

type Tab = 'restaurants' | 'users';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('restaurants');
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
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#f97316' }}>
            SERVESOFT
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>Admin Dashboard</p>
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

      <div style={{ display: 'flex', height: 'calc(100vh - 89px)' }}>
        <aside style={{
          width: '240px',
          background: 'white',
          borderRight: '1px solid #ddd',
          padding: '1.5rem 0',
        }}>
          {(['restaurants', 'users'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                background: activeTab === tab ? '#fef3e2' : 'transparent',
                border: 'none',
                borderLeft: activeTab === tab ? '3px solid #f97316' : '3px solid transparent',
                color: activeTab === tab ? '#f97316' : '#666',
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
          {activeTab === 'restaurants' && <RestaurantsManagement />}
          {activeTab === 'users' && <UsersManagement />}
        </main>
      </div>
    </div>
  );
}