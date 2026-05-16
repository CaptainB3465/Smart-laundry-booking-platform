import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  onSnapshot
} from "firebase/firestore";
import db from "../db";

// --- ORDER OPERATIONS ---

export const createOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'Pending'
    });
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef, 
      where("userId", "==", userId), 
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
};

export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
};

export const updateOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, { status: newStatus });
    return true;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const orderRef = doc(db, "orders", orderId);
    await deleteDoc(orderRef);
    return true;
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

// --- STATS OPERATIONS ---

export const getAdminStats = async () => {
  try {
    const orders = await getAllOrders();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'Delivered').length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    const totalCustomers = new Set(orders.map(o => o.userId)).size;

    return {
      totalRevenue,
      activeOrders,
      completedOrders,
      totalCustomers,
      recentGrowth: '+12.5%'
    };
  } catch (error) {
    console.error("Error calculating stats:", error);
    return { totalRevenue: 0, activeOrders: 0, completedOrders: 0, totalCustomers: 0 };
  }
};

// --- REAL-TIME SUBSCRIPTIONS ---

export const subscribeToUserOrders = (userId, callback) => {
  const ordersRef = collection(db, "orders");
  const q = query(
    ordersRef, 
    where("userId", "==", userId)
  );

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort in memory
    callback(orders);
  }, (error) => {
    console.error("Error subscribing to user orders:", error);
    callback([]); // Return empty list on error to stop loading state
  });
};

export const subscribeToAllOrders = (callback) => {
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
    callback(orders);
  }, (error) => {
    console.error("Error subscribing to all orders:", error);
    callback([]);
  });
};
