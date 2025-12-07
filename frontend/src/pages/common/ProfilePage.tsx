import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/user.service';
import type { UpdateProfileData } from '../../services/user.service';
import { cn } from '../../lib/utils';
import { User, Mail, Phone, Calendar, UserCircle, Save, Loader2, Lock, Camera, Activity } from 'lucide-react';
import { toast } from 'react-toastify';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'security'>('general');

    const [formData, setFormData] = useState<UpdateProfileData>({
        full_name: '',
        phone: '',
        gender: 'male',
        date_of_birth: '',
        favorite_sports: []
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                full_name: user.full_name || '',
                phone: user.phone || '',
                gender: (user.gender as 'male' | 'female' | 'other') || 'male',
                date_of_birth: user.date_of_birth ? new Date(user.date_of_birth as any).toISOString().split('T')[0] : '',
                favorite_sports: user.favorite_sports || []
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const { data } = await userService.updateProfile(formData);
            toast.success('Cập nhật hồ sơ thành công');
            updateUser(data);
        } catch (error: any) {
            toast.error(error.message || 'Cập nhật hồ sơ thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Mật khẩu mới không khớp');
            return;
        }

        setIsLoading(true);

        try {
            await userService.changePassword({
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });
            toast.success('Đổi mật khẩu thành công');
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-700">
                        <div className="absolute -bottom-16 left-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-white bg-white overflow-hidden shadow-lg">
                                    {user?.avatar ? (
                                        <img src={user.avatar} alt={user.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                            <UserCircle size={64} />
                                        </div>
                                    )}
                                </div>
                                <button className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md">
                                    <Camera size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="absolute bottom-4 left-44 text-white">
                            <h1 className="text-3xl font-bold">{user?.full_name || 'User Name'}</h1>
                            <p className="opacity-90">{user?.email}</p>
                        </div>
                    </div>

                    <div className="pt-20 px-8 pb-8">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-8">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={cn(
                                    "pb-4 px-6 font-medium text-sm transition-colors relative",
                                    activeTab === 'general'
                                        ? "text-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                General Info
                                {activeTab === 'general' && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('security')}
                                className={cn(
                                    "pb-4 px-6 font-medium text-sm transition-colors relative",
                                    activeTab === 'security'
                                        ? "text-blue-600"
                                        : "text-gray-500 hover:text-gray-700"
                                )}
                            >
                                Security
                                {activeTab === 'security' && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                                )}
                            </button>
                        </div>

                        {/* General Tab */}
                        {activeTab === 'general' && (
                            <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <User size={16} /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Enter your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Mail size={16} /> Email
                                        </label>
                                        <input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-gray-500 cursor-not-allowed"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Phone size={16} /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Enter phone number"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Calendar size={16} /> Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="date_of_birth"
                                            value={formData.date_of_birth}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <UserCircle size={16} /> Gender
                                        </label>
                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Activity size={16} /> Favorite Sports
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {['football', 'badminton', 'pickleball', 'basketball', 'volleyball'].map(sport => (
                                                <button
                                                    key={sport}
                                                    type="button"
                                                    onClick={() => {
                                                        const current = formData.favorite_sports || [];
                                                        const updated = current.includes(sport)
                                                            ? current.filter(s => s !== sport)
                                                            : [...current, sport];
                                                        setFormData(prev => ({ ...prev, favorite_sports: updated }));
                                                    }}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                                                        (formData.favorite_sports || []).includes(sport)
                                                            ? "bg-blue-600 text-white border-blue-600"
                                                            : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                                                    )}
                                                >
                                                    {sport.charAt(0).toUpperCase() + sport.slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-lg animate-in fade-in duration-300">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Lock size={16} /> Current Password
                                        </label>
                                        <input
                                            type="password"
                                            name="oldPassword"
                                            value={passwordData.oldPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Lock size={16} /> New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Enter new password (min. 6 chars)"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                            <Lock size={16} /> Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                                    >
                                        {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                                        Update Password
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
