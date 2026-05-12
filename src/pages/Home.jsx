import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Clock, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useSettings } from '../context/SettingsContext';

export const Home = () => {
  const navigate = useNavigate();
  const { companyName } = useSettings();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col pt-16">
      <Navbar />
      {/* Hero Section */}
      <section className="relative overflow-hidden flex-1 flex flex-col justify-center items-center py-20 px-4 sm:px-6 lg:px-8 text-center bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-all duration-700">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/bg.jpg" 
            alt="" 
            className="w-full h-full object-cover opacity-60 dark:opacity-50"
          />
        </div>
        <div className="absolute inset-0 z-0 bg-white/20 dark:bg-slate-900/40 transition-colors duration-700"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-8">
            <Sparkles size={16} />
            Premium laundry service for modern urbanites
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight transition-colors duration-300">
            {companyName} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
              Delivered
            </span> to Your Door
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Expert wash, fold, and dry cleaning services. Schedule a pickup today and get your clothes back fresh and clean within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/booking')} className="w-full sm:w-auto text-lg px-8 shadow-lg hover:-translate-y-1 transition-transform duration-300">
              Book Laundry Now
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white sm:text-4xl transition-colors duration-300">Why Choose {companyName}?</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 transition-colors duration-300">We handle your laundry with the utmost care, ensuring quality and convenience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Clock size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">24-Hour Turnaround</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">We pick up, clean, and deliver your clothes within 24 hours. Fast, reliable, and hassle-free.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Premium Care</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Expert handling of delicate fabrics, deep stain removal, and eco-friendly detergent options.</p>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-soft dark:shadow-none border border-slate-100 dark:border-slate-700 text-center hover:-translate-y-1 transition-all duration-300">
              <div className="w-16 h-16 mx-auto bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Free Delivery</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">Enjoy complimentary pickup and delivery right to your doorstep on all orders over $30.</p>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};
