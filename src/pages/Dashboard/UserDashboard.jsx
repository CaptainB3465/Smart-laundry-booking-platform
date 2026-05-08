import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { getUserOrders } from '../../services/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Package, MapPin, Calendar } from 'lucide-react';
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getUserOrders(currentUser.uid);
        setOrders(data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchOrders();
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">My Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your laundry orders and track status.</p>
        </div>
        <Button onClick={() => navigate('/booking')}>Schedule Pickup</Button>
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
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={16} className="text-slate-400" />
                        <span>Pickup: {new Date(order.pickupDate).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={16} className="text-slate-400" />
                        <span className="truncate">{order.location}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col justify-between md:justify-center items-center md:items-end border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {formatPrice(order.price)}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 font-mono">
                      ID: {order.id}
                    </div>
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
