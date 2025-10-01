import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

interface Staff {
  id: string;
  user_id: string;
  staff_role: string;
  status: string;
  hired_date: string;
  user: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export default function StaffManagement() {
  const { user } = useAuthStore();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    phone: '',
    staff_role: 'SERVER',
    password: '',
  });

  useEffect(() => {
    loadRestaurantAndStaff();
  }, []);

  const loadRestaurantAndStaff = async () => {
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
      .from('employment_records')
      .select(`
        id,
        user_id,
        staff_role,
        status,
        hired_date,
        users (
          full_name,
          email,
          phone
        )
      `)
      .eq('restaurant_id', employmentData.restaurant_id)
      .order('hired_date', { ascending: false });

    if (data && !error) {
      const formattedData = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        staff_role: item.staff_role,
        status: item.status,
        hired_date: item.hired_date,
        user: item.users,
      }));
      setStaff(formattedData);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) {
      alert('Restaurant not found');
      return;
    }

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([
        {
          email: formData.email,
          full_name: formData.full_name,
          phone: formData.phone,
          password_hash: formData.password,
          role: 'STAFF',
        },
      ])
      .select()
      .single();

    if (userError || !newUser) {
      alert('Failed to create user');
      return;
    }

    const { error: employmentError } = await supabase.from('employment_records').insert([
      {
        user_id: newUser.id,
        restaurant_id: restaurantId,
        staff_role: formData.staff_role,
        status: 'ACTIVE',
      },
    ]);

    if (!employmentError) {
      setShowForm(false);
      setFormData({ email: '', full_name: '', phone: '', staff_role: 'SERVER', password: '' });
      loadRestaurantAndStaff();
    } else {
      alert('Failed to add staff member');
    }
  };

  const updateStaffStatus = async (employmentId: string, newStatus: 'ACTIVE' | 'INACTIVE') => {
    const { error } = await supabase
      .from('employment_records')
      .update({ status: newStatus })
      .eq('id', employmentId);

    if (!error) {
      loadRestaurantAndStaff();
    }
  };

  if (loading) {
    return <div>Loading staff...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#333' }}>
          Staff Management
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
          {showForm ? 'Cancel' : 'Add Staff'}
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
            Register New Staff Member
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                  Role
                </label>
                <select
                  value={formData.staff_role}
                  onChange={(e) => setFormData({ ...formData, staff_role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                  }}
                >
                  <option value="SERVER">Server</option>
                  <option value="KITCHEN">Kitchen</option>
                  <option value="DRIVER">Driver</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#666' }}>
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
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
              Register Staff
            </button>
          </form>
        </div>
      )}

      {staff.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {staff.map((member) => (
            <div
              key={member.id}
              style={{
                background: 'white',
                borderRadius: '8px',
                padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#333' }}>
                    {member.user.full_name}
                  </h3>
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Email: {member.user.email}
                  </p>
                  {member.user.phone && (
                    <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                      Phone: {member.user.phone}
                    </p>
                  )}
                  <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    Role: {member.staff_role}
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9rem' }}>
                    Hired: {new Date(member.hired_date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.375rem 0.75rem',
                    background: member.status === 'ACTIVE' ? '#10b98120' : '#6b728020',
                    color: member.status === 'ACTIVE' ? '#10b981' : '#6b7280',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}>
                    {member.status}
                  </span>
                  <button
                    onClick={() => updateStaffStatus(member.id, member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}
                    style={{
                      padding: '0.5rem 1rem',
                      background: member.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    {member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666', background: 'white', borderRadius: '8px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👥</div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No staff members</h3>
          <p>Register your first staff member to get started</p>
        </div>
      )}
    </div>
  );
}