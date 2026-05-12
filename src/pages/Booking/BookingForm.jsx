import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { createOrder } from '../../services/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Shirt, Droplet, Sparkles } from 'lucide-react';

const SERVICES = [
  { id: 'wash', name: 'Wash & Fold', price: 25.0, icon: <Droplet size={32} /> },
  { id: 'dry-clean', name: 'Dry Clean', price: 45.0, icon: <Shirt size={32} /> },
  { id: 'ironing', name: 'Ironing Only', price: 20.0, icon: <Sparkles size={32} /> },
  { id: 'bedding', name: 'Bedding & Linen', price: 35.0, icon: <Droplet size={32} className="rotate-180" /> },
  { id: 'curtains', name: 'Curtains & Drapes', price: 55.0, icon: <Shirt size={32} className="opacity-70" /> },
  { id: 'shoes', name: 'Shoe Cleaning', price: 15.0, icon: <Sparkles size={32} className="scale-110" /> },
];

export const BookingForm = () => {
  const { currentUser } = useAuth();
  const { currency } = useSettings();
  const navigate = useNavigate();
  
  const formatPrice = (price) => {
    return `${currency === 'KES' ? 'KES ' : currency}${price.toFixed(2)}`;
  };
  
  const [selectedServices, setSelectedServices] = useState([SERVICES[0].id]);
  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    phone: '',
    location: '',
    pickupDate: '',
    detergent: 'standard',
    frequency: 'once',
    instructions: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleService = (id) => {
    setSelectedServices(prev => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(sId => sId !== id);
      }
      return [...prev, id];
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getDetergentPrice = () => {
    if (formData.detergent === 'hypoallergenic') return 2.0;
    if (formData.detergent === 'eco-friendly') return 3.0;
    return 0;
  };

  const getDiscountMultiplier = () => {
    if (formData.frequency === 'weekly') return 0.9;
    if (formData.frequency === 'biweekly') return 0.95;
    return 1;
  };

  const getBasePrice = () => {
    return SERVICES
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  };

  const calculatedPrice = (getBasePrice() + getDetergentPrice()) * getDiscountMultiplier();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.location || !formData.pickupDate) {
      return setError('Please fill in all fields');
    }

    try {
      setLoading(true);
      setError('');
      const newOrder = await createOrder({
        userId: currentUser.uid,
        ...formData,
        serviceType: SERVICES.filter(s => selectedServices.includes(s.id)).map(s => s.name).join(', '),
        price: calculatedPrice,
      });
      navigate('/booking/success', { state: { order: newOrder } });
    } catch (err) {
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-3">Schedule a Pickup</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Tell us what you need and when you need it.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {SERVICES.map((service) => {
          const isSelected = selectedServices.includes(service.id);
          return (
            <div
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`relative cursor-pointer rounded-2xl p-6 text-center transition-all duration-200 border-2 ${
                isSelected 
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 shadow-md ring-2 ring-brand-100 dark:ring-brand-900' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-300 dark:hover:border-brand-600 hover:shadow-soft'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-brand-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  ✓
                </div>
              )}
              <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                isSelected ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {service.icon}
              </div>
              <div className={`font-semibold text-lg mb-1 ${isSelected ? 'text-brand-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {service.name}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {formatPrice(service.price)}
              </div>
            </div>
          );
        })}
      </div>

      <Card>
        <CardBody>
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
            
            <Input
              label="Pickup & Delivery Address"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="123 Main St, Apt 4B"
              required
            />
            
            <Input
              label="Preferred Pickup Time"
              name="pickupDate"
              type="datetime-local"
              value={formData.pickupDate}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col mb-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Detergent Preference</label>
                <select 
                  name="detergent" 
                  value={formData.detergent} 
                  onChange={handleChange} 
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
                >
                  <option value="standard">Standard Detergent</option>
                  <option value="hypoallergenic">Hypoallergenic (+$2.00)</option>
                  <option value="eco-friendly">Eco-Friendly (+$3.00)</option>
                </select>
              </div>
              <div className="flex flex-col mb-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Subscription Frequency</label>
                <select 
                  name="frequency" 
                  value={formData.frequency} 
                  onChange={handleChange} 
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
                >
                  <option value="once">One-time Order</option>
                  <option value="weekly">Weekly Subscription (-10%)</option>
                  <option value="biweekly">Bi-weekly Subscription (-5%)</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col mb-6">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Special Instructions (Optional)</label>
              <textarea 
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                placeholder="e.g. Please do not fold shirts, use cold water only..."
                rows="3"
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 resize-y"
              />
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border border-slate-100 dark:border-slate-700 mb-6">
              <div className="flex flex-col gap-2 mb-4">
                {SERVICES.filter(s => selectedServices.includes(s.id)).map(s => (
                  <div key={s.id} className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-sm">
                    <span>{s.name}</span>
                    <span>{formatPrice(s.price)}</span>
                  </div>
                ))}
              </div>
              {getDetergentPrice() > 0 && (
                <div className="flex justify-between items-center mb-3 text-slate-600 dark:text-slate-400">
                  <span>Premium Detergent</span>
                  <span>+{formatPrice(getDetergentPrice())}</span>
                </div>
              )}
              {getDiscountMultiplier() < 1 && (
                <div className="flex justify-between items-center mb-3 text-emerald-600 font-medium">
                  <span>Subscription Discount</span>
                  <span>- {((1 - getDiscountMultiplier()) * 100).toFixed(0)}%</span>
                </div>
              )}
              <div className="flex justify-between items-center mb-4 text-slate-600 dark:text-slate-400">
                <span>Delivery Fee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700 text-xl font-bold text-slate-900 dark:text-white">
                <span>Estimated Total</span>
                <span>{formatPrice(calculatedPrice)}</span>
              </div>
            </div>

            <Button type="submit" size="lg" fullWidth loading={loading} className="text-lg py-4">
              Confirm Booking
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};
