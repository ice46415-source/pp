import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/servesoft-api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('user_id');
  if (userId) {
    config.headers['X-User-ID'] = userId;
  }
  return config;
});

export const userAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login.php', { email, password });
    return response.data;
  },

  register: async (name: string, email: string, password: string, phone?: string) => {
    const response = await api.post('/auth/register.php', { name, email, password, phone });
    return response.data;
  },

  getProfile: async (userId: number) => {
    const response = await api.get(`/users/profile.php?id=${userId}`);
    return response.data;
  },

  updateRole: async (userId: number, role: string) => {
    const response = await api.put('/users/update-role.php', { userId, role });
    return response.data;
  },
};

export const restaurantAPI = {
  getAll: async () => {
    const response = await api.get('/restaurants/list.php');
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/restaurants/create.php', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put('/restaurants/update.php', { id, ...data });
    return response.data;
  },
};

export const menuAPI = {
  getByRestaurant: async (restaurantId: number) => {
    const response = await api.get(`/menu/list.php?restaurant_id=${restaurantId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/menu/create.php', data);
    return response.data;
  },

  update: async (id: number, data: any) => {
    const response = await api.put('/menu/update.php', { id, ...data });
    return response.data;
  },

  toggleAvailability: async (id: number, availability: boolean) => {
    const response = await api.put('/menu/toggle-availability.php', { id, availability });
    return response.data;
  },
};

export const orderAPI = {
  create: async (data: any) => {
    const response = await api.post('/orders/create.php', data);
    return response.data;
  },

  getByCustomer: async (customerId: number) => {
    const response = await api.get(`/orders/customer.php?customer_id=${customerId}`);
    return response.data;
  },

  getByRestaurant: async (restaurantId: number) => {
    const response = await api.get(`/orders/restaurant.php?restaurant_id=${restaurantId}`);
    return response.data;
  },

  updateStatus: async (orderId: number, status: string) => {
    const response = await api.put('/orders/update-status.php', { orderId, status });
    return response.data;
  },
};

export const cartAPI = {
  get: async (customerId: number) => {
    const response = await api.get(`/cart/get.php?customer_id=${customerId}`);
    return response.data;
  },

  addItem: async (cartId: number, menuId: number, quantity: number) => {
    const response = await api.post('/cart/add-item.php', { cartId, menuId, quantity });
    return response.data;
  },

  updateItem: async (cartItemId: number, quantity: number) => {
    const response = await api.put('/cart/update-item.php', { cartItemId, quantity });
    return response.data;
  },

  removeItem: async (cartItemId: number) => {
    const response = await api.delete(`/cart/remove-item.php?id=${cartItemId}`);
    return response.data;
  },

  clear: async (cartId: number) => {
    const response = await api.delete(`/cart/clear.php?cart_id=${cartId}`);
    return response.data;
  },
};

export const tableAPI = {
  getByRestaurant: async (restaurantId: number) => {
    const response = await api.get(`/tables/list.php?restaurant_id=${restaurantId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/tables/create.php', data);
    return response.data;
  },

  updateStatus: async (tableId: number, status: string) => {
    const response = await api.put('/tables/update-status.php', { tableId, status });
    return response.data;
  },
};

export const reservationAPI = {
  getByCustomer: async (customerId: number) => {
    const response = await api.get(`/reservations/customer.php?customer_id=${customerId}`);
    return response.data;
  },

  getByRestaurant: async (restaurantId: number) => {
    const response = await api.get(`/reservations/restaurant.php?restaurant_id=${restaurantId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/reservations/create.php', data);
    return response.data;
  },

  updateStatus: async (reservationId: number, status: string) => {
    const response = await api.put('/reservations/update-status.php', { reservationId, status });
    return response.data;
  },
};

export const staffAPI = {
  getByRestaurant: async (restaurantId: number) => {
    const response = await api.get(`/staff/list.php?restaurant_id=${restaurantId}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await api.post('/staff/create.php', data);
    return response.data;
  },

  updateStatus: async (staffId: number, status: string) => {
    const response = await api.put('/staff/update-status.php', { staffId, status });
    return response.data;
  },
};

export const deliveryAPI = {
  getByDriver: async (driverId: number) => {
    const response = await api.get(`/delivery/driver.php?driver_id=${driverId}`);
    return response.data;
  },

  assign: async (orderId: number, deliveryAgentId: number) => {
    const response = await api.post('/delivery/assign.php', { orderId, deliveryAgentId });
    return response.data;
  },

  updateStatus: async (deliveryId: number, status: string) => {
    const response = await api.put('/delivery/update-status.php', { deliveryId, status });
    return response.data;
  },
};

export default api;