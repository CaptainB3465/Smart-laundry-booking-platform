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
  console.log("API: Creating order...", orderData);
  try {
    const ordersRef = collection(db, "orders");
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      createdAt: serverTimestamp(),
      status: 'Pending'
    });
    console.log("API: Order created successfully, ID:", docRef.id);
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error("API: Error creating order:", error);
    throw error;
  } finally {
    console.log("API: createOrder execution finished");
  }
};

export const getUserOrders = async (userId) => {
  console.log("API: Fetching orders for user:", userId);
  try {
    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef, 
      where("userId", "==", userId), 
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    console.log(`API: Found ${querySnapshot.docs.length} orders for user`);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("API: Error fetching user orders:", error);
    return [];
  } finally {
    console.log("API: getUserOrders execution finished");
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
  console.log("API: Subscribing to user orders:", userId);
  const ordersRef = collection(db, "orders");
  const q = query(
    ordersRef, 
    where("userId", "==", userId)
  );

  try {
    return onSnapshot(q, (snapshot) => {
      console.log("API: User orders snapshot received, docs count:", snapshot.docs.length);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      callback(orders);
    }, (error) => {
      console.error("API: Error in subscribeToUserOrders snapshot:", error);
      callback([]); // Ensure loading stops on dashboard
    });
  } catch (err) {
    console.error("API: Sync error in subscribeToUserOrders setup:", err);
    callback([]);
    return () => {}; // Return dummy unsubscribe
  }
};

export const subscribeToAllOrders = (callback) => {
  console.log("API: Subscribing to all orders (Admin)...");
  const ordersRef = collection(db, "orders");
  const q = query(ordersRef, orderBy("createdAt", "desc"));

  try {
    return onSnapshot(q, (snapshot) => {
      console.log("API: All orders snapshot received, docs count:", snapshot.docs.length);
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
      }));
      callback(orders);
    }, (error) => {
      console.error("API: Error in subscribeToAllOrders snapshot:", error);
      callback([]);
    });
  } catch (err) {
    console.error("API: Sync error in subscribeToAllOrders setup:", err);
    callback([]);
    return () => {};
  }
};
// --- SERVICE OPERATIONS ---

export const getServices = async () => {
  try {
    const servicesRef = collection(db, "services");
    const querySnapshot = await getDocs(servicesRef);
    if (querySnapshot.empty) {
      // Return default services if collection is empty
      return [
        { id: 'wash', name: 'Wash & Fold', price: 25.0, iconName: 'Droplet' },
        { id: 'dry-clean', name: 'Dry Clean', price: 45.0, iconName: 'Shirt' },
        { id: 'ironing', name: 'Ironing Only', price: 20.0, iconName: 'Sparkles' },
      ];
    }
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
};

export const addService = async (serviceData) => {
  try {
    const servicesRef = collection(db, "services");
    const docRef = await addDoc(servicesRef, serviceData);
    return { id: docRef.id, ...serviceData };
  } catch (error) {
    console.error("Error adding service:", error);
    throw error;
  }
};

export const updateService = async (serviceId, serviceData) => {
  try {
    const serviceRef = doc(db, "services", serviceId);
    await updateDoc(serviceRef, serviceData);
    return true;
  } catch (error) {
    console.error("Error updating service:", error);
    throw error;
  }
};

export const deleteService = async (serviceId) => {
  try {
    const serviceRef = doc(db, "services", serviceId);
    await deleteDoc(serviceRef);
    return true;
  } catch (error) {
    console.error("Error deleting service:", error);
    throw error;
  }
};

export const subscribeToServices = (callback) => {
  const servicesRef = collection(db, "services");
  return onSnapshot(servicesRef, (snapshot) => {
    const services = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(services);
  });
};
