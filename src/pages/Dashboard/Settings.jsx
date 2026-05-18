import React, { useState, useEffect } from 'react';
import { useSettings } from '../../context/SettingsContext';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Moon, Sun, Mail, Phone, Building, Save, Edit3 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Settings = () => {
  const { currentUser, updateProfile, resetPassword, deleteAccount } = useAuth();
  const {
    theme, setTheme,
    companyName, setCompanyName,
    currency, setCurrency,
    supportEmail, setSupportEmail,
    supportPhone, setSupportPhone,
  } = useSettings();

  const isAdmin = currentUser?.email === import.meta.env.VITE_ADMIN_EMAIL;

  // Profile state
  const [localName, setLocalName] = useState(currentUser?.displayName || '');
  const [localEmail, setLocalEmail] = useState(currentUser?.email || '');
  const [localPhone, setLocalPhone] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [accountStatus, setAccountStatus] = useState({ type: '', message: '' });

  // Business Details state (admin only)
  const [localCompanyName, setLocalCompanyName] = useState(companyName);
  const [localCurrency, setLocalCurrency] = useState(currency);
  const [bizSaved, setBizSaved] = useState(false);

  // Support editing state (admin only)
  const [editingSupport, setEditingSupport] = useState(false);
  const [localSupportEmail, setLocalSupportEmail] = useState(supportEmail);
  const [localSupportPhone, setLocalSupportPhone] = useState(supportPhone);
  const [supportSaved, setSupportSaved] = useState(false);

  // Load phone from localStorage on mount
  useEffect(() => {
    if (currentUser?.uid) {
      const saved = localStorage.getItem(`phone_${currentUser.uid}`) || '';
      setLocalPhone(saved);
    }
  }, [currentUser]);

  // Sync support fields when context updates
  useEffect(() => { setLocalSupportEmail(supportEmail); }, [supportEmail]);
  useEffect(() => { setLocalSupportPhone(supportPhone); }, [supportPhone]);

  const clearStatus = () => setTimeout(() => setAccountStatus({ type: '', message: '' }), 5000);

  const handlePhoneChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 9) setLocalPhone(raw);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      await updateProfile({ displayName: localName });
      // Save phone
      if (currentUser?.uid) {
        const phoneToSave = localPhone ? `+254${localPhone}` : '';
        localStorage.setItem(`phone_${currentUser.uid}`, phoneToSave);
      }
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile', error);
      setAccountStatus({ type: 'error', message: error.message });
      clearStatus();
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    setCompanyName(localCompanyName);
    setCurrency(localCurrency);
    setBizSaved(true);
    setTimeout(() => setBizSaved(false), 3000);
  };

  const handleSaveSupport = (e) => {
    e.preventDefault();
    setSupportEmail(localSupportEmail);
    setSupportPhone(localSupportPhone);
    setEditingSupport(false);
    setSupportSaved(true);
    setTimeout(() => setSupportSaved(false), 3000);
  };

  const handleChangePassword = async () => {
    try {
      setProfileLoading(true);
      setAccountStatus({ type: 'info', message: 'Sending reset email...' });
      await resetPassword(currentUser.email);
      setAccountStatus({ type: 'success', message: `Reset email sent to ${currentUser.email}.` });
      clearStatus();
    } catch (error) {
      setAccountStatus({ type: 'error', message: error.message });
      clearStatus();
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'WARNING: This will permanently delete your account and all order history. Are you absolutely sure?'
    );
    if (!confirmed) return;
    try {
      setProfileLoading(true);
      setAccountStatus({ type: 'info', message: 'Deleting account...' });
      await deleteAccount();
    } catch (error) {
      if (error.code === 'auth/requires-recent-login') {
        setAccountStatus({ type: 'error', message: 'Please log out and log back in before deleting your account.' });
      } else {
        setAccountStatus({ type: 'error', message: error.message });
      }
      clearStatus();
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your preferences and account details.</p>
      </div>

      <div className="space-y-6">
        {/* ── Profile ── */}
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
                accountStatus.type === 'error'   ? 'bg-red-50 border-red-200 text-red-700' :
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
                  disabled
                  className="opacity-60 cursor-not-allowed"
                  placeholder="your.email@example.com"
                />
                {/* Phone number field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 text-sm font-semibold">
                      +254
                    </span>
                    <input
                      type="tel"
                      value={localPhone.replace('+254', '')}
                      onChange={handlePhoneChange}
                      placeholder="7XXXXXXXX"
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-r-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100 transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400">This number will auto-fill during booking</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-4">
                  <Button type="button" variant="outline" className="text-sm dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={handleChangePassword} loading={profileLoading}>
                    Change Password
                  </Button>
                  <Button type="button" variant="outline" className="text-sm text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/10" onClick={handleDeleteAccount} loading={profileLoading}>
                    Delete Account
                  </Button>
                </div>
                <Button type="submit" loading={profileLoading}>Save Profile</Button>
              </div>
              {profileSaved && <p className="text-emerald-600 text-sm mt-3 font-medium">Profile updated successfully!</p>}
            </form>
          </CardBody>
        </Card>

        {/* ── Appearance ── */}
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
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle between light and dark mode for the app.</p>
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
                  <Sun size={18} /> Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-white text-brand-600 shadow-md ring-1 ring-slate-200 dark:bg-slate-700 dark:text-white dark:ring-slate-600'
                      : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon size={18} /> Dark
                </button>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* ── Business Details (Admin Only) ── */}
        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building size={20} className="text-brand-500" />
                Business Details
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 rounded">Admin Only</span>
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
                  />
                  <div className="flex flex-col mb-4">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Currency</label>
                    <select
                      value={localCurrency}
                      onChange={(e) => setLocalCurrency(e.target.value)}
                      className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:border-brand-500 focus:ring-brand-100"
                    >
                      <option value="KES">Kenyan Shilling (KES)</option>
                      <option value="$">USD ($)</option>
                      <option value="€">Euro (€)</option>
                      <option value="£">British Pound (£)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
              {bizSaved && <p className="text-emerald-600 text-sm mt-2 font-medium">Business details updated!</p>}
            </CardBody>
          </Card>
        )}

        {/* ── Support & Feedback ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-between w-full">
              <div className="flex items-center gap-2">
                <Phone size={20} className="text-brand-500" />
                Support &amp; Feedback
              </div>
              {isAdmin && !editingSupport && (
                <button
                  onClick={() => setEditingSupport(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  <Edit3 size={14} /> Edit
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardBody>
            {isAdmin && editingSupport ? (
              <form onSubmit={handleSaveSupport} className="space-y-4">
                <Input
                  label="Feedback Email"
                  type="email"
                  value={localSupportEmail}
                  onChange={(e) => setLocalSupportEmail(e.target.value)}
                  placeholder="support@yourcompany.com"
                  required
                />
                <Input
                  label="Contact Phone"
                  value={localSupportPhone}
                  onChange={(e) => setLocalSupportPhone(e.target.value)}
                  placeholder="+254XXXXXXXXX"
                  required
                />
                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingSupport(false)}>Cancel</Button>
                  <Button type="submit"><Save size={14} className="mr-1" />Save Contact Info</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white text-sm">Feedback Email</p>
                    <a href={`mailto:${supportEmail}`} className="text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 font-medium break-all">
                      {supportEmail}
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
                    <a href={`tel:${supportPhone}`} className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium break-all">
                      {supportPhone}
                    </a>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reach out for any technical issues.</p>
                  </div>
                </div>
              </div>
            )}
            {supportSaved && <p className="text-emerald-600 text-sm mt-3 font-medium">Support contact info updated!</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
