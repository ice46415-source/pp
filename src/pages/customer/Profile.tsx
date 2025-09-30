import { useAuthStore } from '../../stores/authStore';

export default function Profile() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div>
      <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1.5rem', color: '#333' }}>
        Profile
      </h2>

      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        maxWidth: '600px',
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
            Full Name
          </label>
          <div style={{
            padding: '0.75rem',
            background: '#f5f5f5',
            borderRadius: '6px',
            color: '#333',
          }}>
            {user.full_name}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
            Email
          </label>
          <div style={{
            padding: '0.75rem',
            background: '#f5f5f5',
            borderRadius: '6px',
            color: '#333',
          }}>
            {user.email}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
            Phone
          </label>
          <div style={{
            padding: '0.75rem',
            background: '#f5f5f5',
            borderRadius: '6px',
            color: '#333',
          }}>
            {user.phone || 'Not provided'}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
            Role
          </label>
          <div style={{
            padding: '0.75rem',
            background: '#f5f5f5',
            borderRadius: '6px',
            color: '#333',
          }}>
            {user.role}
          </div>
        </div>
      </div>
    </div>
  );
}