import React, { useState } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Moon, Sun, Mail, Phone, Building, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Settings = () => {
  const { currentUser, updateProfile, resetPassword, deleteAccount } = useAuth();
  const { theme, setTheme, companyName, setCompanyName, currency, setCurrency } = useSettings();
  
  const [localName, setLocalName] = useState(currentUser?.displayName || '');
  const [localEmail, setLocalEmail] = useState(currentUser?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [saved, setSaved] = useState(false);
  
  // Alert/Status State for Account Actions
  const [accountStatus, setAccountStatus] = useState({ type: '', message: '' });

  const clearStatus = () => setTimeout(() => setAccountStatus({ type: '', message: '' }), 5000);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      await updateProfile({ displayName: localName, email: localEmail });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    setCompanyName(localCompanyName);
    setCurrency(localCurrency);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    try {
      setProfileLoading(true);
      setAccountStatus({ type: 'info', message: 'Sending reset email...' });
      await resetPassword(currentUser.email);
      setAccountStatus({ type: 'success', message: `A password reset email has been sent to ${currentUser.email}.` });
      clearStatus();
    } catch (error) {
      console.error("Failed to send reset email", error);
      setAccountStatus({ type: 'error', message: error.message });
      clearStatus();
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      "WARNING: This will permanently delete your account and all your laundry order history. This action cannot be undone.\n\nAre you absolutely sure?"
    );
    
    if (confirmation) {
      try {
        setProfileLoading(true);
        setAccountStatus({ type: 'info', message: 'Deleting account...' });
        await deleteAccount();
        setAccountStatus({ type: 'success', message: 'Account deleted successfully. Redirecting...' });
      } catch (error) {
        console.error("Failed to delete account", error);
        if (error.code === 'auth/requires-recent-login') {
          setAccountStatus({ 
            type: 'error', 
            message: "For security, please log out and log back in before deleting your account." 
          });
        } else {
          setAccountStatus({ type: 'error', message: error.message });
        }
        clearStatus();
      } finally {
        setProfileLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your app preferences and view support information.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-brand-500/20">
                {currentUser?.displayName?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <span className="dark:text-white">Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardBody>
            {accountStatus.message && (
              <div className={`mb-6 p-4 rounded-xl text-sm font-medium border animate-fade-in ${
                accountStatus.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                accountStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-700' : 
                'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {accountStatus.message}
              </div>
            )}
            <form onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder="Your Name"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={localEmail}
                  onChange={(e) => setLocalEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-4">
                  <Button 
                    type="button"
                    variant="outline" 
                    className="text-sm dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={handleChangePassword}
                    loading={profileLoading}
                  >
                    Change Password
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="text-sm text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/10"
                    onClick={handleDeleteAccount}
                    loading={profileLoading}
                  >
                    Delete Account
                  </Button>
                </div>
                <Button type="submit" loading={profileLoading}>Save Profile</Button>
              </div>
              {profileSaved && <p className="text-emerald-600 text-sm mt-3 font-medium">Profile updated successfully!</p>}
            </form>
          </CardBody>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? <Moon size={20} className="text-brand-500" /> : <Sun size={20} className="text-amber-500" />}
              Appearance
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Theme Preference</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark mode.</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    theme === 'light' 
                      ? 'bg-white text-brand-600 shadow-md ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Sun size={18} />
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    theme === 'dark' 
                      ? 'bg-white text-brand-600 shadow-md ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600' 
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon size={18} />
                  Dark
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Business Details Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building size={20} className="text-brand-500" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSaveCompany} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Laundry Company Name"
                  value={localCompanyName}
                  onChange={(e) => setLocalCompanyName(e.target.value)}
                  placeholder="Enter your company name"
                  className="mb-0"
                />
                <div className="flex flex-col mb-4">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                  <select 
                    value={localCurrency} 
                    onChange={(e) => setLocalCurrency(e.target.value)} 
                    className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
                  >
                    <option value="$">USD ($)</option>
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="€">Euro (€)</option>
                    <option value="£">British Pound (£)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
            {saved && <p className="text-emerald-600 text-sm mt-2 font-medium">Company name updated successfully!</p>}
          </CardBody>
        </Card>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone size={20} className="text-brand-500" />
              Support & Feedback
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Feedback Email</p>
                  <a href="mailto:munyuabrian712@gmail.com" className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium break-all">
                    munyuabrian712@gmail.com
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Send us your thoughts and suggestions.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm">Contact Support</p>
                  <a href="tel:+254719328502" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium break-all">
                    +254719328502
                  </a>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reach out for any technical issues.</p>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
