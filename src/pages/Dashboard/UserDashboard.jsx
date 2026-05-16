import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { subscribeToUserOrders, deleteOrder } from '../../services/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Package, MapPin, Calendar, Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { currency } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false); // Terminated default loading state
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return `${currency === 'KES' ? 'KES ' : currency}${price.toFixed(2)}`;
  };

  useEffect(() => {
    if (!currentUser) {
      console.log("UserDashboard: No current user, skipping subscription");
      return;
    }

    console.log("UserDashboard: Initializing orders subscription for:", currentUser.uid);
    setLoading(true);

    // Start real-time subscription
    let unsubscribe;
    try {
      unsubscribe = subscribeToUserOrders(currentUser.uid, (data) => {
        console.log("UserDashboard: Received orders data, count:", data.length);
        setOrders(data);
        setLoading(false);
        console.log("UserDashboard: Loading stopped");
      });
    } catch (err) {
      console.error("UserDashboard: Error setting up subscription:", err);
      setLoading(false);
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        console.log("UserDashboard: Unsubscribing from orders");
        unsubscribe();
      }
    };
  }, [currentUser]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteOrder(orderId);
        // No need to manually fetch, the subscription handles real-time updates
      } catch (error) {
        alert("Failed to cancel order. Please try again.");
      }
    }
  };

  // Loading effect terminated - rendering content immediately
  
  return (
    <div className="animate-fade-in text-primary">
      <div className="relative overflow-hidden bg-brand-600 rounded-3xl p-6 sm:p-8 mb-10 text-white shadow-xl shadow-brand-500/20 group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/10 rounded-full blur-3xl group-hover:bg-black/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {currentUser?.displayName?.split(' ')[0]}! 👋</h2>
            <p className="text-brand-100 max-w-md mx-auto lg:mx-0">Your laundry is our priority. Schedule your next pickup today and enjoy your free time.</p>
          </div>
          <Button 
            onClick={() => navigate('/booking')}
            className="w-full sm:w-auto bg-white !text-brand-600 hover:bg-brand-50 border-none px-8 py-3 text-lg font-bold transition-all hover:scale-105 dark:bg-slate-950 dark:text-brand-400 dark:hover:bg-slate-900 shadow-lg"
          >
            Schedule Pickup
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">Recent Orders</h2>
          <p className="text-secondary mt-1">Track the status of your current and past laundry orders.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-secondary text-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">No orders yet</h3>
          <p className="text-secondary mb-8 max-w-md mx-auto">You haven't scheduled any laundry pickups yet. Get started by booking your first service.</p>
          <Button onClick={() => navigate('/booking')}>Book First Service</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardBody>
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-lg font-semibold text-primary">{order.serviceType}</h3>
                      <Badge status={order.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <Calendar size={16} className="text-muted" />
                        <span>Pickup: {new Date(order.pickupDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-secondary">
                        <MapPin size={16} className="text-muted" />
                        <span className="truncate">{order.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(order.price)}
                      </div>
                      <div className="text-xs text-muted mt-1 font-mono">
                        ID: {order.id}
                      </div>
                    </div>
                    {order.status === 'Pending' && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors border border-transparent hover:border-red-200"
                      >
                        <XCircle size={14} />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {order.status === 'Completed' && (
                  <div className="mt-4 p-4 bg-brand-50 dark:bg-brand-900/20 rounded-xl border border-brand-100 dark:border-brand-800/50 flex items-start gap-3 animate-fade-in">
                    <div className="p-1.5 bg-brand-100 dark:bg-brand-900/50 text-brand-600 dark:text-brand-400 rounded-lg shrink-0 mt-0.5">
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-800 dark:text-brand-300">Your service has been completed!</p>
                      <p className="text-xs text-brand-600/80 dark:text-brand-400/80 mt-1">
                        Your laundry is fresh, clean, and ready to be shipped back to you. Thank you for trusting SmartWash with your garments!
                      </p>
                    </div>
                  </div>
                )}
                
                {order.status === 'Shipped' && (
                  <div className="mt-4 p-4 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-xl border border-fuchsia-100 dark:border-fuchsia-800/50 flex items-start gap-3 animate-fade-in">
                    <div className="p-1.5 bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-600 dark:text-fuchsia-400 rounded-lg shrink-0 mt-0.5">
                      <Package size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-fuchsia-800 dark:text-fuchsia-300">Your laundry is on the way!</p>
                      <p className="text-xs text-fuchsia-600/80 dark:text-fuchsia-400/80 mt-1">
                        Our delivery partner has picked up your clothes and is heading to your location.
                      </p>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
