// Mock Backend Service mimicking Firebase API

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock Data Store (In-Memory)
let mockUsers = [
  {
    uid: 'admin123',
    email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@laundry.com',
    password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
    displayName: 'Admin',
    role: 'admin',
  },
  {
    uid: 'user123',
    email: 'user@laundry.com',
    displayName: 'Test User',
    role: 'user',
  }
];

let mockOrders = [
  {
    id: 'ord_1',
    userId: 'user123',
    fullName: 'Test User',
    phone: '123-456-7890',
    location: '123 Main St, NY',
    serviceType: 'Wash & Fold',
    pickupDate: '2026-05-05T10:00',
    status: 'Pending',
    price: 25.0,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ord_2',
    userId: 'user123',
    fullName: 'Test User',
    phone: '123-456-7890',
    location: '123 Main St, NY',
    serviceType: 'Dry Clean',
    pickupDate: '2026-05-04T14:00',
    status: 'Washing',
    price: 45.0,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

// --- AUTHENTICATION MOCK ---
export const loginUser = async (email, password) => {
  await delay(1000);
  const user = mockUsers.find((u) => u.email === email);
  if (!user) throw new Error('Invalid email or password');
  
  // For the specific admin, check the password
  if (user.role === 'admin' && user.password && password !== user.password) {
    throw new Error('Invalid email or password');
  }
  
  return user;
};

export const registerUser = async (email, password, displayName) => {
  await delay(1000);
  if (mockUsers.find((u) => u.email === email)) {
    throw new Error('Email already in use');
  }
  const newUser = {
    uid: 'usr_' + Math.random().toString(36).substr(2, 9),
    email,
    displayName,
    role: 'user',
  };
  mockUsers.push(newUser);
  return newUser;
};

export const logoutUser = async () => {
  await delay(500);
  return true;
};

// --- FIRESTORE MOCK ---
export const createOrder = async (orderData) => {
  await delay(1000);
  const newOrder = {
    ...orderData,
    id: 'ord_' + Math.random().toString(36).substr(2, 9),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };
  mockOrders.push(newOrder);
  return newOrder;
};

export const getUserOrders = async (userId) => {
  await delay(800);
  return mockOrders.filter((order) => order.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const getAllOrders = async () => {
  await delay(1000);
  return [...mockOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const updateOrderStatus = async (orderId, newStatus) => {
  await delay(800);
  const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
  if (orderIndex === -1) throw new Error('Order not found');
  
  mockOrders[orderIndex] = { ...mockOrders[orderIndex], status: newStatus };
  return mockOrders[orderIndex];
};

export const updateUserProfile = async (userId, data) => {
  await delay(1000);
  const userIndex = mockUsers.findIndex((u) => u.uid === userId);
  if (userIndex === -1) throw new Error('User not found');
  
  mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
  return mockUsers[userIndex];
};

export const getAdminStats = async () => {
  await delay(1200);
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.price, 0);
  const activeOrders = mockOrders.filter(o => o.status !== 'Delivered').length;
  const completedOrders = mockOrders.filter(o => o.status === 'Delivered').length;
  const totalCustomers = new Set(mockOrders.map(o => o.userId)).size;

  return {
    totalRevenue,
    activeOrders,
    completedOrders,
    totalCustomers,
    recentGrowth: '+12.5%' // Mock growth
  };
};

export const deleteOrder = async (orderId) => {
  await delay(800);
  mockOrders = mockOrders.filter(o => o.id !== orderId);
  return true;
};

export const updateService = async (serviceId, serviceData) => {
  await delay(500);
  return { id: serviceId, ...serviceData };
};

export const addService = async (serviceData) => {
  await delay(500);
  return { id: Math.random().toString(36).substr(2, 9), ...serviceData };
};
