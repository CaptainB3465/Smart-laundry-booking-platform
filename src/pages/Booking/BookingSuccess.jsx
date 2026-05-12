import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle, Printer, Calendar, MapPin, Package, CreditCard } from 'lucide-react';

export const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currency } = useSettings();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/dashboard" replace />;
  }

  const formatPrice = (price) => {
    return `${currency === 'KES' ? 'KES ' : currency}${price.toFixed(2)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <div className="text-center mb-10 print-hidden">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-6 shadow-glow">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2">Booking Successful!</h2>
        <p className="text-slate-600 dark:text-slate-400">Your order has been received and is being processed.</p>
      </div>

      <Card className="overflow-hidden border-brand-100 dark:border-brand-900/50 print:shadow-none print:border-slate-200">
        <div className="bg-brand-600 px-6 py-4 text-white flex justify-between items-center print:bg-white print:text-slate-900 print:border-b">
          <div className="font-heading font-bold text-lg">Order Receipt</div>
          <div className="text-sm opacity-90 font-mono">#{order.id}</div>
        </div>
        
        <CardBody className="p-8">
          <div className="space-y-8">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-8 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Customer</p>
                <p className="font-semibold text-slate-900 dark:text-white">{order.fullName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{order.phone}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Date</p>
                <p className="font-semibold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{new Date().toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Order Details */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  <Package size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Services Selection</p>
                  <p className="text-slate-900 dark:text-white font-medium">{order.serviceType}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  <Calendar size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Scheduled Pickup</p>
                  <p className="text-slate-900 dark:text-white font-medium">{new Date(order.pickupDate).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                  <p className="text-slate-900 dark:text-white font-medium">{order.location}</p>
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-3">
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatPrice(order.price)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                <span>Delivery Fee</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white">Total Amount</span>
                <span className="text-2xl font-bold text-brand-600 dark:text-brand-400">{formatPrice(order.price)}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
              <CreditCard size={14} />
              <span>Payment will be collected upon delivery</span>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="mt-10 flex flex-col sm:flex-row gap-4 print-hidden">
        <Button 
          variant="outline" 
          fullWidth 
          onClick={handlePrint}
          className="dark:border-slate-700 dark:text-slate-300"
        >
          <Printer size={18} />
          Print Receipt
        </Button>
        <Button 
          fullWidth 
          onClick={() => navigate('/dashboard')}
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
