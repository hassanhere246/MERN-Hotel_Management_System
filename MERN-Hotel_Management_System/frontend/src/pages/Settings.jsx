import React, { useState, useEffect } from 'react';
import { User, Bell, Lock, Mail, Globe, Palette, Save, Building, Percent, FileText, Clock as ClockIcon, Loader2, AlertCircle, ShieldCheck, Eye, EyeOff, Camera, Phone, MapPin, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSettings, updateSettings } from '../services/settingsService';
import { getMe, updateProfile, uploadProfilePhoto, changePassword } from '../services/userService'; // Assuming userService for profile operations
import { useLanguage } from '../context/LanguageContext';

const Settings = () => {
    const { user: authUser, refreshUser } = useAuth();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [hotelSettings, setHotelSettings] = useState(null);
    const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', profilePhoto: '' });
    const [notifications, setNotifications] = useState({
        newReservations: true,
        checkInReminders: true,
        maintenanceAlerts: true,
        monthlyReports: true
    });
    const [userPreferences, setUserPreferences] = useState({
        language: 'en',
        theme: 'light',
        currency: 'USD'
    });
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (activeTab === 'system') {
            fetchHotelSettings();
        } else if (activeTab === 'profile' || activeTab === 'notifications' || activeTab === 'preferences') {
            fetchMe();
        }
    }, [activeTab]);

    const fetchMe = async () => {
        try {
            setLoading(true);
            const data = await getMe();
            setProfile({
                name: data.name || '',
                email: data.email || '',
                phone: data.contactInfo?.phone || '',
                address: data.contactInfo?.address || '',
                profilePhoto: data.profilePhoto || ''
            });
            if (data.preferences?.notifications) {
                setNotifications(data.preferences.notifications);
            }
            if (data.preferences) {
                setUserPreferences({
                    language: data.preferences.language || 'en',
                    theme: data.preferences.theme || 'light',
                    currency: data.preferences.currency || 'USD'
                });
            }
        } catch (err) {
            console.error('Failed to fetch user profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceChange = async (key, value) => {
        const updated = { ...userPreferences, [key]: value };
        setUserPreferences(updated);

        // Instant Theme Apply
        if (key === 'theme') {
            const root = document.documentElement;
            root.classList.remove('dark', 'glass');
            if (value === 'dark') root.classList.add('dark');
            if (value === 'glass') root.classList.add('glass');
            localStorage.setItem('appTheme', value);
        }

        try {
            await updateProfile({
                preferences: { ...updated }
            });
            await refreshUser();
        } catch (err) {
            console.error('Failed to update preference');
            setUserPreferences(userPreferences); // Rollback
        }
    };

    const toggleNotification = async (key) => {
        const updated = { ...notifications, [key]: !notifications[key] };
        setNotifications(updated);
        try {
            await updateProfile({
                preferences: { notifications: updated }
            });
        } catch (err) {
            console.error('Failed to update notification preference');
            setNotifications(notifications); // Rollback
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePhoto', file);

        try {
            setUploading(true);
            const res = await uploadProfilePhoto(formData);
            setProfile({ ...profile, profilePhoto: res.profilePhoto });
            await refreshUser();
            alert('Profile photo updated successfully');
        } catch (err) {
            alert('Failed to upload photo');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateProfile({
                name: profile.name,
                contactInfo: { phone: profile.phone, address: profile.address }
            });
            await refreshUser();
            alert('Profile updated successfully');
        } catch (err) {
            alert('Failed to update profile');
            console.error('Failed to update profile', err);
        } finally {
            setSaving(false);
        }
    };

    const fetchHotelSettings = async () => {
        try {
            setLoading(true);
            const data = await getSettings();
            setHotelSettings(data || {
                roomRates: { single: 0, double: 0, suite: 0, deluxe: 0 },
                taxes: 0,
                policies: { cancellationPolicy: '', checkInTime: '', checkOutTime: '' }
            });
        } catch (err) {
            console.error('Failed to fetch settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveHotelSettings = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await updateSettings(hotelSettings);
            alert('System settings updated successfully');
        } catch (err) {
            alert('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            setSaving(true);
            await changePassword({
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            alert('Password updated successfully');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', name: t('profile'), icon: User },
        { id: 'notifications', name: t('notifications'), icon: Bell },
        { id: 'security', name: t('security'), icon: Lock },
        { id: 'preferences', name: t('preferences'), icon: Palette },
    ];

    if (authUser?.role === 'admin') {
        tabs.push({ id: 'system', name: t('system_settings'), icon: Building });
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 dark:text-white font-heading tracking-tight uppercase">Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Configure your personal profile, notifications, and system parameters.</p>
                </div>
                <div className="flex items-center space-x-2 text-[10px] font-black text-primary-600 dark:text-cyan-400 uppercase tracking-[0.3em] bg-primary-50 dark:bg-primary-500/10 px-4 py-2 rounded-full border border-primary-100 dark:border-primary-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Secure Session</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white/50 dark:bg-navy-900/50 backdrop-blur-xl rounded-[32px] shadow-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-navy-800/30">
                    <nav className="flex overflow-x-auto no-scrollbar px-4">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-3 px-8 py-6 font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap relative group ${activeTab === tab.id
                                        ? 'text-primary-600 dark:text-cyan-400'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                                    <span>{tab.name}</span>
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-blue-600 rounded-full"></div>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                            </div>
                        ) : (
                            <form onSubmit={handleSaveProfile} className="space-y-12">
                                {/* Profile Header Section */}
                                <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-gray-100 dark:border-white/5">
                                    <div className="relative group">
                                        <div className="w-32 h-32 bg-gray-100 dark:bg-navy-800 rounded-[32px] overflow-hidden flex items-center justify-center border-4 border-white dark:border-navy-900 shadow-2xl relative transition-transform duration-500 group-hover:scale-[1.02]">
                                            {profile.profilePhoto ? (
                                                <img
                                                    src={`http://localhost:5000/${profile.profilePhoto}`}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-4xl font-black">
                                                    {profile.name?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
                                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-navy-800 rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 cursor-pointer hover:bg-primary-50 dark:hover:bg-navy-700 transition-all group-hover:scale-110">
                                            <Camera className="w-5 h-5 text-primary-600 dark:text-cyan-400" />
                                            <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                                        </label>
                                    </div>

                                    <div className="text-center md:text-left space-y-2">
                                        <h3 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{profile.name}</h3>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-3 items-center">
                                            <span className="px-4 py-1.5 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-cyan-400 text-xs font-black uppercase tracking-widest rounded-full border border-primary-100 dark:border-primary-500/20">
                                                {authUser?.role}
                                            </span>
                                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm font-medium">
                                                <Mail className="w-4 h-4 mr-2" />
                                                {profile.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Full Name</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-navy-800 rounded-lg group-focus-within:bg-primary-50 dark:group-focus-within:bg-primary-500/20 transition-colors">
                                                <User className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-cyan-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-navy-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-navy-800 outline-none font-bold text-gray-900 dark:text-white transition-all"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Phone Number</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-navy-800 rounded-lg group-focus-within:bg-primary-50 dark:group-focus-within:bg-primary-500/20 transition-colors">
                                                <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-cyan-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-navy-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-navy-800 outline-none font-bold text-gray-900 dark:text-white transition-all"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Mailing Address</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-navy-800 rounded-lg group-focus-within:bg-primary-50 dark:group-focus-within:bg-primary-500/20 transition-colors">
                                                <MapPin className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-cyan-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={profile.address}
                                                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                                className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-navy-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-navy-800 outline-none font-bold text-gray-900 dark:text-white transition-all"
                                                placeholder="Street, City, Country"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Job Title / Role</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-navy-800 rounded-lg">
                                                <Briefcase className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={authUser?.role}
                                                readOnly
                                                className="w-full pl-14 pr-4 py-4 bg-gray-100 dark:bg-navy-900/50 border border-transparent dark:border-white/5 rounded-2xl font-black text-gray-500 dark:text-gray-600 outline-none cursor-not-allowed uppercase tracking-widest text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-8 border-t border-gray-100 dark:border-white/5">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="btn btn-primary px-10 py-4 flex items-center space-x-3 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        <span className="text-base font-black uppercase tracking-widest">{saving ? 'Saving...' : t('save_changes')}</span>
                                    </button>
                                </div>
                            </form>
                        )
                    )}

                    {/* System Settings Tab */}
                    {activeTab === 'system' && (
                        loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                            </div>
                        ) : (
                            <form onSubmit={handleSaveHotelSettings} className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center mb-6">
                                        <Building className="w-5 h-5 mr-2 text-primary-500" />
                                        Room Rates (Base Prices)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {['single', 'double', 'suite', 'deluxe'].map(type => (
                                            <div key={type} className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2 capitalize">{type} Room</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-navy-800 rounded-lg group-focus-within:bg-primary-50 dark:group-focus-within:bg-primary-500/20 transition-colors">
                                                        <span className="w-4 h-4 flex items-center justify-center font-black text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-cyan-400 text-xs">$</span>
                                                    </div>
                                                    <input
                                                        type="number"
                                                        value={hotelSettings?.roomRates?.[type] || 0}
                                                        onChange={(e) => setHotelSettings({
                                                            ...hotelSettings,
                                                            roomRates: { ...hotelSettings.roomRates, [type]: Number(e.target.value) }
                                                        })}
                                                        className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-navy-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-navy-800 outline-none font-black text-gray-900 dark:text-white transition-all"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-6 border-t border-gray-50">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                                            <Percent className="w-5 h-5 mr-3 text-emerald-500" />
                                            Tax Configuration
                                        </h3>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Applicable Tax (%)</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-gray-100 dark:bg-navy-800 rounded-lg group-focus-within:bg-primary-50 dark:group-focus-within:bg-primary-500/20 transition-colors">
                                                    <Percent className="w-4 h-4 text-gray-400 dark:text-gray-500 group-focus-within:text-primary-600 dark:group-focus-within:text-cyan-400" />
                                                </div>
                                                <input
                                                    type="number"
                                                    value={hotelSettings?.taxes || 0}
                                                    onChange={(e) => setHotelSettings({ ...hotelSettings, taxes: Number(e.target.value) })}
                                                    className="w-full pl-14 pr-4 py-4 bg-gray-50 dark:bg-navy-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-navy-800 outline-none font-black text-gray-900 dark:text-white transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                                            <ClockIcon className="w-5 h-5 mr-3 text-amber-500" />
                                            Timing Policies
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Check-In</label>
                                                <input
                                                    type="text"
                                                    placeholder="12:00 PM"
                                                    value={hotelSettings?.policies?.checkInTime || ''}
                                                    onChange={(e) => setHotelSettings({
                                                        ...hotelSettings,
                                                        policies: { ...hotelSettings.policies, checkInTime: e.target.value }
                                                    })}
                                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-navy-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-navy-800 outline-none font-black text-gray-900 dark:text-white transition-all placeholder:font-normal"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] ml-2">Check-Out</label>
                                                <input
                                                    type="text"
                                                    placeholder="11:00 AM"
                                                    value={hotelSettings?.policies?.checkOutTime || ''}
                                                    onChange={(e) => setHotelSettings({
                                                        ...hotelSettings,
                                                        policies: { ...hotelSettings.policies, checkOutTime: e.target.value }
                                                    })}
                                                    className="w-full px-5 py-4 bg-gray-50 dark:bg-navy-800/50 border border-transparent dark:border-white/5 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-navy-800 outline-none font-black text-gray-900 dark:text-white transition-all placeholder:font-normal"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-8 border-t border-gray-100 dark:border-white/5">
                                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center">
                                        <FileText className="w-5 h-5 mr-3 text-blue-500" />
                                        Cancellation Policy
                                    </h3>
                                    <textarea
                                        rows="4"
                                        value={hotelSettings?.policies?.cancellationPolicy || ''}
                                        onChange={(e) => setHotelSettings({
                                            ...hotelSettings,
                                            policies: { ...hotelSettings.policies, cancellationPolicy: e.target.value }
                                        })}
                                        className="w-full px-6 py-5 bg-gray-50 dark:bg-navy-800/50 border border-transparent dark:border-white/5 rounded-[32px] focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-navy-800 outline-none font-bold text-gray-900 dark:text-white transition-all resize-none shadow-inner"
                                        placeholder="Enter your cancellation policy details..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        disabled={saving}
                                        className="btn btn-primary px-12 py-3 flex items-center space-x-2 shadow-lg shadow-primary-200"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>{saving ? 'Saving...' : 'Save System Settings'}</span>
                                    </button>
                                </div>
                            </form>
                        )
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                                        <Bell className="w-6 h-6 mr-3 text-primary-500" />
                                        Email Notifications
                                    </h3>
                                    <p className="text-gray-500 mb-8">Choose which updates you'd like to receive via email. These settings apply only to your account.</p>

                                    <div className="space-y-4">
                                        {[
                                            { id: 'newReservations', title: 'New Reservations', description: 'Get notified when a new reservation is made' },
                                            { id: 'checkInReminders', title: 'Check-in Reminders', description: 'Receive alerts for upcoming check-ins' },
                                            { id: 'maintenanceAlerts', title: 'Maintenance Alerts', description: 'Get notified about maintenance issues' },
                                            { id: 'monthlyReports', title: 'Monthly Reports', description: 'Receive monthly performance reports' },
                                        ].map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-primary-100 hover:bg-primary-50/10 hover:shadow-soft transition-all duration-300">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                                    <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={notifications[item.id]}
                                                        onChange={() => toggleNotification(item.id)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-primary-500 peer-checked:to-emerald-500 shadow-inner"></div>
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start space-x-4">
                                    <div className="p-2 bg-blue-100 rounded-xl">
                                        <Mail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900">Push Notifications</h4>
                                        <p className="text-sm text-blue-700 mt-1">Push notifications are currently managed by your browser settings. You can enable them in your browser preferences.</p>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                                        <Palette className="w-6 h-6 mr-3 text-primary-500" />
                                        Display & Experience
                                    </h3>
                                    <p className="text-gray-500 mb-8">Personalize how the dashboard looks and feels to you.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-primary-100 hover:bg-primary-50/10 hover:shadow-soft transition-all duration-300">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">Interface Language</label>
                                            <select
                                                value={userPreferences.language}
                                                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900"
                                            >
                                                <option value="en">English (US)</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="ur">Urdu (اردو)</option>
                                            </select>
                                        </div>

                                        <div className="p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-primary-100 hover:bg-primary-50/10 hover:shadow-soft transition-all duration-300">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-3">System Currency</label>
                                            <select
                                                value={userPreferences.currency}
                                                onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-bold text-gray-900"
                                            >
                                                <option value="USD">USD ($) - US Dollar</option>
                                                <option value="EUR">EUR (€) - Euro</option>
                                                <option value="GBP">GBP (£) - British Pound</option>
                                                <option value="PKR">PKR (Rs) - Rupee</option>
                                            </select>
                                        </div>

                                        <div className="md:col-span-2 p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-primary-100 hover:bg-primary-50/10 hover:shadow-soft transition-all duration-300">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-4">Color Theme</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                {[
                                                    { id: 'light', name: 'Light Mode', color: 'bg-white' },
                                                    { id: 'dark', name: 'Dark Mode', color: 'bg-gray-900' },
                                                    { id: 'glass', name: 'Glassmorphism', color: 'bg-primary-100' },
                                                ].map((theme) => (
                                                    <button
                                                        key={theme.id}
                                                        onClick={() => handlePreferenceChange('theme', theme.id)}
                                                        className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${userPreferences.theme === theme.id ? 'border-primary-500 bg-primary-50/50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                                                    >
                                                        <div className={`w-full h-12 rounded-lg mb-2 shadow-inner ${theme.color}`}></div>
                                                        <span className="text-sm font-bold text-gray-700">{theme.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center mb-6">
                                    <Lock className="w-6 h-6 mr-3 text-primary-500" />
                                    {t('change_password')}
                                </h3>
                                <p className="text-gray-500 mb-8">{t('password_strength_msg')}</p>

                                <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('current_password')}</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                required
                                                value={passwords.currentPassword}
                                                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-black text-gray-900 placeholder:font-normal"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
                                            >
                                                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('new_password')}</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                required
                                                value={passwords.newPassword}
                                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-black text-gray-900 placeholder:font-normal"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
                                            >
                                                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">{t('confirm_new_password')}</label>
                                        <div className="relative">
                                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                required
                                                value={passwords.confirmPassword}
                                                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                                className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-transparent rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-black text-gray-900 placeholder:font-normal"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="btn btn-primary w-full py-4 flex items-center justify-center space-x-2 shadow-lg shadow-primary-200"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                            <span className="text-lg">{t('update_password')}</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-4">
                                <div className="p-2 bg-amber-100 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-amber-900">Security Recommendation</h4>
                                    <p className="text-sm text-amber-700 mt-1">We recommend changing your password every 90 days. Avoid using the same password for different accounts.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
