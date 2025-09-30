import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import OrdersManagement from './OrdersManagement';
import MenuManagement from './MenuManagement';
import TablesManagement from './TablesManagement';
import ReservationsManagement from './ReservationsManagement';
import StaffManagement from './StaffManagement';
import RestaurantSettings from './RestaurantSettings';

type Tab = 'orders' | 'menu' | 'tables' | 'reservations' | 'staff' | 'settings';

export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('orders');
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>
            SERVESOFT
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#666' }}>Manager Dashboard</p>
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
          {(['orders', 'menu', 'tables', 'reservations', 'staff', 'settings'] as Tab[]).map((tab) => (
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
          {activeTab === 'orders' && <OrdersManagement />}
          {activeTab === 'menu' && <MenuManagement />}
          {activeTab === 'tables' && <TablesManagement />}
          {activeTab === 'reservations' && <ReservationsManagement />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'settings' && <RestaurantSettings />}
        </main>
      </div>
    </div>
  );
}