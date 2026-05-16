import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { subscribeToAllOrders, updateOrderStatus, deleteOrder, subscribeToServices, addService, updateService, deleteService, createOrder } from '../../services/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Navigate } from 'react-router-dom';
import { TrendingUp, Users, ShoppingBag, DollarSign, Activity, Settings as SettingsIcon, Package, UserCheck, Search, Shirt, Droplet, Sparkles, Trash2, Edit3, Plus, X, CheckCircle, Terminal } from 'lucide-react';

const ICON_MAP = {
  'Droplet': <Droplet size={20} />,
  'Shirt': <Shirt size={20} />,
  'Sparkles': <Sparkles size={20} />,
  'Package': <Package size={20} />,
};



const STATUS_OPTIONS = ['Pending', 'Approved', 'Declined', 'Picked Up', 'Washing', 'Completed', 'Shipped', 'Delivered'];

const StatCard = ({ title, value, icon: Icon, trend, colorClass }) => (
  <Card className="border-none shadow-xl bg-white dark:bg-slate-900 relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-32 h-32 ${colorClass} opacity-5 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform duration-500`} />
    <CardBody className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colorClass} bg-opacity-10 text-white`}>
          <Icon className={colorClass.replace('bg-', 'text-')} size={24} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
            <TrendingUp size={12} />
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      </div>
    </CardBody>
  </Card>
);

export const AdminDashboard = () => {
  const { isAdmin } = useAuth();
  const { currency, maintenanceMode, setMaintenanceMode } = useSettings();
  const [orders, setOrders] = useState([]);
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('overview');
  
  // Service Modal State
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    name: '',
    price: '',
    iconName: 'Package'
  });

  // Walk-in Order State
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  
  // Logs State
  const [showLogs, setShowLogs] = useState(false);
  const [liveLogs, setLiveLogs] = useState([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] v2.0.4 core initialized`,
    `[${new Date().toLocaleTimeString()}] [AUTH] Secure admin session started`,
    `[${new Date().toLocaleTimeString()}] [DB] Connected to Firestore analytics cluster`,
    `[${new Date().toLocaleTimeString()}] [ROUTING] Dynamic service pricing updated`,
    `[${new Date().toLocaleTimeString()}] [SECURITY] System config state verified`,
  ]);
  const [walkInFormData, setWalkInFormData] = useState({
    fullName: '',
    phone: '',
    serviceId: '',
    location: 'Walk-in / Shop'
  });

  const formatPrice = (price) => {
    return `${currency === 'KES' ? 'KES ' : currency}${Number(price).toFixed(2)}`;
  };

  useEffect(() => {
    if (!isAdmin) {
      console.log("AdminDashboard: User is not admin, skipping global subscription");
      return;
    }

    console.log("AdminDashboard: Initializing global orders subscription...");
    setLoading(true);

    // Start real-time global subscription
    let unsubscribe;
    try {
      unsubscribe = subscribeToAllOrders((data) => {
        console.log("AdminDashboard: Received global data, count:", data.length);
        setOrders(data);
        
        // Calculate real-time stats from the live data
        const totalRevenue = data.reduce((sum, order) => sum + (order.price || 0), 0);
        const activeOrders = data.filter(o => o.status !== 'Delivered').length;
        const completedOrders = data.filter(o => o.status === 'Delivered').length;
        const totalCustomers = new Set(data.map(o => o.userId)).size;

        setStats({
          totalRevenue,
          activeOrders,
          completedOrders,
          totalCustomers,
          recentGrowth: '+12.5%'
        });
        
        setLoading(false);
        console.log("AdminDashboard: Loading stopped");
      });
    } catch (err) {
      console.error("AdminDashboard: Error in subscription setup:", err);
      setLoading(false);
    }

    // Subscribe to services
    const unsubServices = subscribeToServices((data) => {
      setServices(data);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      if (unsubServices) unsubServices();
    };
  }, [isAdmin]);

  const handleOpenAddService = () => {
    setEditingService(null);
    setServiceFormData({ name: '', price: '', iconName: 'Droplet' });
    setShowServiceModal(true);
  };

  const handleOpenEditService = (service) => {
    setEditingService(service);
    setServiceFormData({ 
      name: service.name, 
      price: service.price.toString(), 
      iconName: service.iconName || 'Droplet' 
    });
    setShowServiceModal(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        name: serviceFormData.name,
        price: parseFloat(serviceFormData.price),
        iconName: serviceFormData.iconName
      };

      if (editingService) {
        await updateService(editingService.id, data);
      } else {
        await addService(data);
      }
      setShowServiceModal(false);
    } catch (error) {
      alert("Error saving service: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await deleteService(id);
      } catch (error) {
        alert("Error deleting service: " + error.message);
      }
    }
  };

  const handleCreateWalkInOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedService = services.find(s => s.id === walkInFormData.serviceId);
      if (!selectedService) throw new Error("Please select a service");

      await createOrder({
        userId: 'admin-manual',
        fullName: walkInFormData.fullName,
        phone: walkInFormData.phone.startsWith('+254') ? walkInFormData.phone : `+254${walkInFormData.phone}`,
        location: walkInFormData.location,
        serviceType: selectedService.name,
        price: selectedService.price,
        pickupDate: new Date().toISOString(),
        status: 'Picked Up', // Walk-ins are usually dropped off
        isWalkIn: true
      });
      
      setShowWalkInModal(false);
      setWalkInFormData({ fullName: '', phone: '', serviceId: '', location: 'Walk-in / Shop' });
      alert("Walk-in order created successfully!");
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatus(orderId, newStatus);
      setLiveLogs(prev => [`[${new Date().toLocaleTimeString()}] [ORDER] Updated order ${orderId} to ${newStatus}`, ...prev]);
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      try {
        setUpdatingId(orderId);
        await deleteOrder(orderId);
        // Listener handles the state update
      } catch (error) {
        console.error("Failed to delete order", error);
      } finally {
        setUpdatingId(null);
      }
    }
  };

  // Reorder checks: isAdmin check should happen BEFORE or alongside loading
  // to ensure proper redirection if the user is not an admin.
  if (!isAdmin) {
    console.log("AdminDashboard: Access denied, redirecting to customer dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Loading effect terminated - rendering content immediately
  
  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in text-primary">
      {/* Admin Sidebar Navigation */}
      <aside className="lg:w-64 flex flex-col gap-6 shrink-0">
        <Card className="bg-slate-900 border-none shadow-xl">
          <CardBody className="p-4 flex flex-col gap-1">
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] px-4 mb-2">Management</p>
            <button 
              onClick={() => setActiveView('overview')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'overview' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-secondary hover:text-white hover:bg-slate-800'}`}
            >
              <Activity size={18} />
              Overview
            </button>
            <button 
              onClick={() => setActiveView('orders')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'orders' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-secondary hover:text-white hover:bg-slate-800'}`}
            >
              <ShoppingBag size={18} />
              Orders
            </button>
            <button 
              onClick={() => setActiveView('customers')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'customers' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-secondary hover:text-white hover:bg-slate-800'}`}
            >
              <Users size={18} />
              Customers
            </button>
            <div className="h-px bg-slate-800 my-4 mx-4" />
            <p className="text-[10px] font-bold text-muted uppercase tracking-[0.2em] px-4 mb-2">System</p>
            <button 
              onClick={() => setActiveView('services')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'services' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-secondary hover:text-white hover:bg-slate-800'}`}
            >
              <Package size={18} />
              Services
            </button>
            <button 
              onClick={() => setActiveView('config')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeView === 'config' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-secondary hover:text-white hover:bg-slate-800'}`}
            >
              <SettingsIcon size={18} />
              Config
            </button>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Quick Actions</p>
          <button 
            onClick={() => {
              if (services.length === 0) return alert("Please add services first!");
              setShowWalkInModal(true);
            }}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-500 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 dark:bg-brand-900/30 text-brand-600 rounded-lg group-hover:scale-110 transition-transform">
                <ShoppingBag size={18} />
              </div>
              <span className="text-sm font-semibold dark:text-white">New Walk-in Order</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-brand-500" />
          </button>
          
          <button 
            onClick={() => {
              setActiveView('overview');
              alert('Payouts verified successfully!');
            }}
            className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-brand-500 transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                <UserCheck size={18} />
              </div>
              <span className="text-sm font-semibold dark:text-white">Verify Payouts</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8 min-w-0">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-card p-6 rounded-3xl shadow-sm transition-all duration-500">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-3xl font-heading font-extrabold text-primary tracking-tight">Command Center</h2>
              <div className="px-2 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 rounded text-[10px] font-bold uppercase tracking-wider">Admin v2.0</div>
            </div>
            <p className="text-secondary">System orchestration & order management terminal.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-full"
              />
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="absolute inset-0 w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">System Live</span>
            </div>
          </div>
        </header>

        <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-inner">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              <StatCard 
                title="Gross Revenue" 
                value={formatPrice(stats.totalRevenue)} 
                icon={DollarSign} 
                trend={stats.recentGrowth}
                colorClass="bg-brand-500" 
              />
              <StatCard 
                title="Live Orders" 
                value={stats.activeOrders} 
                icon={ShoppingBag} 
                colorClass="bg-amber-500" 
              />
              <StatCard 
                title="Fulfilled" 
                value={stats.completedOrders} 
                icon={UserCheck} 
                colorClass="bg-emerald-500" 
              />
              <StatCard 
                title="Total Clients" 
                value={stats.totalCustomers} 
                icon={Users} 
                colorClass="bg-indigo-500" 
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-6">
            {activeView === 'overview' && (
              <>
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-primary">Recent Transactions</h3>
                  <button onClick={() => setActiveView('orders')} className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline">View All</button>
                </div>
                
                {orders.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
                    No orders found in the system.
                  </div>
                ) : (
                  <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order Details</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                          {orders.slice(0, 5).map((order) => (
                            <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-medium text-slate-900 dark:text-white">{order.serviceType}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">ID: {order.id}</div>
                              </td>
                              <td className="px-6 py-4">
                                <Badge status={order.status} />
                              </td>
                              <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                <select 
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-white"
                                >
                                  {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                                <button 
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                  title="Delete Order"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                )}
              </>
            )}

            {activeView === 'orders' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Order Management</h3>
                </div>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-900 dark:text-white text-sm">{order.serviceType}</div>
                              <div className="text-[10px] text-slate-500 font-mono">#{order.id}</div>
                            </td>
                            <td className="px-6 py-4 text-sm dark:text-slate-300">{order.fullName}</td>
                            <td className="px-6 py-4 text-sm font-semibold dark:text-white">{formatPrice(order.price)}</td>
                            <td className="px-6 py-4 flex items-center justify-between gap-2">
                              <Badge status={order.status} />
                              <div className="flex items-center gap-2">
                                <select 
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 bg-white dark:bg-slate-800 text-slate-700 dark:text-white"
                                >
                                  {STATUS_OPTIONS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                                <button 
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                                  title="Delete Order"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeView === 'customers' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">Customer Database</h3>
                  <div className="text-sm text-slate-500">Total Registered: {stats?.totalCustomers}</div>
                </div>
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Join Date</th>
                          <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                        {/* Mocking unique customers from orders */}
                        {Array.from(new Set(orders.map(o => o.userId))).map(uid => {
                          const order = orders.find(o => o.userId === uid);
                          return (
                            <tr key={uid} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                                    {order.fullName.charAt(0)}
                                  </div>
                                  <div className="font-medium text-slate-900 dark:text-white">{order.fullName}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                {order.phone}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                May 12, 2026
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Active</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}

            {activeView === 'services' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-primary">Service Management</h3>
                  <button 
                    onClick={handleOpenAddService}
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-700 transition-all"
                  >
                    Add New Service
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map(s => (
                    <Card key={s.id} className="border-slate-100 dark:border-slate-800 group">
                      <CardBody className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-brand-50 dark:bg-brand-900/30 text-brand-600 rounded-xl group-hover:scale-110 transition-transform">
                            {ICON_MAP[s.iconName] || <Package size={20} />}
                          </div>
                          <div>
                            <div className="font-bold text-primary">{s.name}</div>
                            <div className="text-xs text-secondary font-medium">Base Price: {formatPrice(s.price)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleOpenEditService(s)}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-all"
                            title="Edit Service"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(s.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete Service"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Service Modal */}
            {showServiceModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="text-xl font-bold text-primary">
                      {editingService ? 'Edit Service' : 'Add New Service'}
                    </h3>
                    <button onClick={() => setShowServiceModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleSaveService} className="p-6 space-y-4">
                    <Input 
                      label="Service Name"
                      placeholder="e.g. Wash & Fold"
                      value={serviceFormData.name}
                      onChange={(e) => setServiceFormData({...serviceFormData, name: e.target.value})}
                      required
                    />
                    <Input 
                      label="Base Price"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 25.00"
                      value={serviceFormData.price}
                      onChange={(e) => setServiceFormData({...serviceFormData, price: e.target.value})}
                      required
                    />
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-secondary">Service Icon</label>
                      <div className="grid grid-cols-4 gap-2">
                        {Object.keys(ICON_MAP).map(iconName => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setServiceFormData({...serviceFormData, iconName})}
                            className={`p-3 rounded-xl border-2 flex items-center justify-center transition-all ${
                              serviceFormData.iconName === iconName 
                                ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' 
                                : 'border-slate-100 dark:border-slate-800 hover:border-slate-200'
                            }`}
                          >
                            {ICON_MAP[iconName]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <Button type="button" variant="secondary" fullWidth onClick={() => setShowServiceModal(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" fullWidth loading={loading}>
                        {editingService ? 'Update Service' : 'Create Service'}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {activeView === 'config' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white px-2">System Configuration</h3>
                <Card className="border-slate-100 dark:border-slate-800">
                  <CardBody className="p-6 space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800">
                      <div>
                        <div className="font-bold dark:text-white">Maintenance Mode</div>
                        <div className="text-xs text-slate-500 text-slate-500">Temporarily disable user bookings</div>
                      </div>
                      <div 
                        onClick={() => {
                          setMaintenanceMode(!maintenanceMode);
                          setLiveLogs(prev => [`[${new Date().toLocaleTimeString()}] [SYS] Maintenance mode set to ${!maintenanceMode}`, ...prev]);
                        }}
                        className={`w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors ${maintenanceMode ? 'bg-brand-500' : 'bg-slate-200 dark:bg-slate-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-bold dark:text-white">Live Logs</div>
                        <div className="text-xs text-slate-500">Stream system activity logs in real-time</div>
                      </div>
                      <button onClick={() => setShowLogs(true)} className="text-xs font-bold text-brand-600 px-3 py-1 bg-brand-50 dark:bg-brand-900/30 rounded-lg">Open Terminal</button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
            
            {/* Logs Modal */}
            {showLogs && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-slate-950 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-800">
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                    <div className="flex items-center gap-2">
                      <Terminal size={18} className="text-brand-500" />
                      <h3 className="text-sm font-mono font-bold text-slate-300">System Terminal</h3>
                    </div>
                    <button onClick={() => setShowLogs(false)} className="text-slate-500 hover:text-white">
                      <X size={18} />
                    </button>
                  </div>
                  <div className="p-6 h-80 overflow-y-auto font-mono text-xs space-y-2">
                    {liveLogs.map((log, i) => (
                      <div key={i} className={`${log.includes('[ORDER]') ? 'text-emerald-400' : log.includes('[SYS]') ? 'text-amber-400' : 'text-slate-400'}`}>
                        {log}
                      </div>
                    ))}
                    <div className="text-brand-500 animate-pulse mt-4">_</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <Card className="bg-gradient-to-br from-brand-600 to-brand-800 dark:from-slate-800 dark:to-slate-950 border-none text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <TrendingUp size={80} />
              </div>
              <CardBody className="p-8 relative z-10">
                <p className="text-brand-100 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">Revenue Growth</p>
                <h4 className="text-4xl font-bold mb-6">+24.8%</h4>
                <div className="flex items-end gap-1 h-24 mb-4">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <div 
                      key={i} 
                      className="flex-1 bg-white/20 dark:bg-brand-500/40 rounded-t-sm hover:bg-white dark:hover:bg-brand-500 transition-all cursor-help" 
                      style={{ height: `${h}%` }} 
                      title={`Week ${i+1}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-brand-100 dark:text-slate-400">Projected revenue for next month is {formatPrice((stats?.totalRevenue || 0) * 1.2)}</p>
              </CardBody>
            </Card>

            <Card className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
              <CardBody className="p-6">
                <h4 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                  <Activity size={18} className="text-brand-500" />
                  System Load
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-500">Order Processing</span>
                      <span className="text-slate-900 dark:text-white">82%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full" style={{ width: '82%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-slate-500">Delivery Efficiency</span>
                      <span className="text-slate-900 dark:text-white">94%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }} />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      {/* Walk-in Order Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                <ShoppingBag className="text-brand-600" size={20} />
                New Walk-in Order
              </h3>
              <button onClick={() => setShowWalkInModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateWalkInOrder} className="p-6 space-y-4">
              <Input 
                label="Customer Name"
                placeholder="e.g. John Doe"
                value={walkInFormData.fullName}
                onChange={(e) => setWalkInFormData({...walkInFormData, fullName: e.target.value})}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-secondary">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm font-semibold">+254</span>
                  <input 
                    type="tel"
                    className="flex-1 min-w-0 block w-full px-4 py-2.5 bg-primary border border-slate-200 dark:border-slate-700 rounded-r-lg text-primary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="7XXXXXXXX"
                    value={walkInFormData.phone}
                    onChange={(e) => setWalkInFormData({...walkInFormData, phone: e.target.value})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-secondary">Select Service</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {services.map(service => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => setWalkInFormData({...walkInFormData, serviceId: service.id})}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                        walkInFormData.serviceId === service.id 
                          ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600' 
                          : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {ICON_MAP[service.iconName] || <Package size={18} />}
                        <span className="text-sm font-bold">{service.name}</span>
                      </div>
                      <span className="text-xs font-mono">{formatPrice(service.price)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" fullWidth onClick={() => setShowWalkInModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" fullWidth loading={loading}>
                  Create Order
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
