import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getUserOrders, deleteOrder } from '../../services/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Package, MapPin, Calendar, Trash2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const UserDashboard = () => {
  const { currentUser } = useAuth();
  const { currency } = useSettings();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return `${currency === 'KES' ? 'KES ' : currency}${price.toFixed(2)}`;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getUserOrders(currentUser.uid);
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await deleteOrder(orderId);
        fetchOrders();
      } catch (error) {
        alert("Failed to cancel order. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="relative overflow-hidden bg-brand-600 rounded-3xl p-8 mb-10 text-white shadow-xl shadow-brand-500/20 group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black/10 rounded-full blur-3xl group-hover:bg-black/20 transition-all duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.displayName?.split(' ')[0]}! 👋</h2>
            <p className="text-brand-100 max-w-md">Your laundry is our priority. Schedule your next pickup today and enjoy your free time.</p>
          </div>
          <Button 
            onClick={() => navigate('/booking')}
            className="bg-white text-brand-600 hover:bg-brand-50 border-none px-8 py-3 text-lg font-bold transition-transform hover:scale-105 dark:bg-slate-900 dark:text-brand-400 dark:hover:bg-slate-800 shadow-lg"
          >
            Schedule Pickup
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Recent Orders</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track the status of your current and past laundry orders.</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No orders yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">You haven't scheduled any laundry pickups yet. Get started by booking your first service.</p>
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
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{order.serviceType}</h3>
                      <Badge status={order.status} />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Pickup: {new Date(order.pickupDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin size={16} className="text-slate-400" />
                        <span className="truncate">{order.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatPrice(order.price)}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-mono">
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
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
