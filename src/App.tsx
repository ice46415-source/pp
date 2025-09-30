import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import CustomerDashboard from './pages/customer/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import DeliveryDashboard from './pages/delivery/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';

function App() {
  const { user, loading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />

        {user && user.role === 'CUSTOMER' && (
          <>
            <Route path="/" element={<CustomerDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {user && user.role === 'MANAGER' && (
          <>
            <Route path="/" element={<ManagerDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {user && user.role === 'STAFF' && (
          <>
            <Route path="/" element={<DeliveryDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {user && user.role === 'ADMIN' && (
          <>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}

        {!user && <Route path="*" element={<Navigate to="/login" replace />} />}
      </Routes>
    </BrowserRouter>
  );
}

export default App;