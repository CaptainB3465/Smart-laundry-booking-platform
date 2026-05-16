import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { createOrder, getServices } from '../../services/api';
import { Card, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Shirt, Droplet, Sparkles, Package } from 'lucide-react';

const ICON_MAP = {
  'Droplet': <Droplet size={32} />,
  'Shirt': <Shirt size={32} />,
  'Sparkles': <Sparkles size={32} />,
  'Package': <Package size={32} />,
};

export const BookingForm = () => {
  const { currentUser } = useAuth();
  const { currency } = useSettings();
  const navigate = useNavigate();
  
  const formatPrice = (price) => {
    return `${currency === 'KES' ? 'KES ' : currency}${price.toFixed(2)}`;
  };
  
  const [services, setServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
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
  const [fetchingServices, setFetchingServices] = useState(true);
  const [error, setError] = useState('');

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await getServices();
        setServices(data);
        if (data.length > 0) {
          setSelectedServices([data[0].id]);
        }
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setFetchingServices(false);
      }
    };
    fetchServices();
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Numbers only
    if (value.length <= 9) {
      setFormData({ ...formData, phone: value });
    }
  };

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
    return services
      .filter(s => selectedServices.includes(s.id))
      .reduce((sum, s) => sum + s.price, 0);
  };

  const calculatedPrice = (getBasePrice() + getDetergentPrice()) * getDiscountMultiplier();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("BookingForm: Submit initiated");
    
    if (!formData.fullName || !formData.phone || !formData.location || !formData.pickupDate) {
      console.warn("BookingForm: Validation failed - missing fields");
      return setError('Please fill in all fields');
    }

    if (formData.phone.length !== 9) {
      return setError('Phone number must be exactly 9 digits');
    }

    try {
      setLoading(true);
      setError('');
      console.log("BookingForm: Calling createOrder API...");
      
      const newOrder = await createOrder({
        userId: currentUser.uid,
        ...formData,
        phone: `+254${formData.phone}`, // Prefix with Kenya code
        serviceType: services.filter(s => selectedServices.includes(s.id)).map(s => s.name).join(', '),
        price: calculatedPrice,
      });
      
      console.log("BookingForm: Order successful, navigating...");
      navigate('/booking/success', { state: { order: newOrder } });
    } catch (err) {
      console.error("BookingForm: Error creating order:", err);
      setError('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
      console.log("BookingForm: Loading state set to false");
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-3">Schedule a Pickup</h2>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Tell us what you need and when you need it.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
            {fetchingServices ? (
              <div className="col-span-full py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => toggleService(service.id)}
                className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all group ${
                  selectedServices.includes(service.id)
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600'
                    : 'border-slate-100 dark:border-slate-800 hover:border-brand-200'
                }`}
              >
                <div className={`mb-3 transition-transform group-hover:scale-110 ${selectedServices.includes(service.id) ? 'text-brand-600' : 'text-slate-400'}`}>
                  {ICON_MAP[service.iconName] || <Package size={32} />}
                </div>
                <span className={`text-sm font-bold ${selectedServices.includes(service.id) ? 'text-brand-700 dark:text-brand-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {service.name}
                </span>
                <span className="text-[10px] mt-1 font-medium opacity-60">+{formatPrice(service.price)}</span>
              </button>
            ))}
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
              <div className="flex flex-col mb-4">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm font-semibold">
                    +254
                  </span>
                  <input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    placeholder="7XXXXXXXX"
                    className="flex-1 min-w-0 block w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
                    required
                  />
                </div>
                <p className="mt-1 text-[10px] text-slate-400">Enter exactly 9 digits after +254</p>
              </div>
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
