import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    MapPin,
    Settings,
    LogOut,
    Menu,
    X,
    Bell,
    Search
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
    children: ReactNode;
}

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Calendar, label: 'Events', path: '/admin/events' },
    { icon: MapPin, label: 'Venues', path: '/admin/venues' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-200",
                    sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-0"
                )}
            >
                <div className="h-full px-3 py-4 overflow-y-auto">
                    {/* Logo */}
                    <div className="flex items-center justify-between mb-8 px-3">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            SportHub Admin
                        </h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <ul className="space-y-2">
                        {sidebarItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={cn(
                                            "flex items-center p-3 rounded-lg transition-colors group",
                                            isActive
                                                ? "bg-blue-50 text-blue-600"
                                                : "text-gray-700 hover:bg-gray-100"
                                        )}
                                    >
                                        <Icon
                                            size={20}
                                            className={cn(
                                                "transition-colors",
                                                isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                                            )}
                                        />
                                        <span className="ml-3 font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Logout Button */}
                    <div className="absolute bottom-4 left-3 right-3">
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full p-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors group"
                        >
                            <LogOut size={20} className="text-red-500 group-hover:text-red-600" />
                            <span className="ml-3 font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className={cn("transition-all", sidebarOpen ? "lg:ml-64" : "ml-0")}>
                {/* Header */}
                <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                    <div className="px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <Menu size={24} />
                                </button>

                                {/* Search Bar */}
                                <div className="hidden md:flex items-center bg-gray-50 rounded-lg px-4 py-2 w-96">
                                    <Search size={20} className="text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="ml-2 bg-transparent outline-none w-full text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Notifications */}
                                <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                    <Bell size={20} className="text-gray-600" />
                                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                                </button>

                                {/* User Profile */}
                                <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-medium text-gray-900">{user?.full_name}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                        {user?.full_name?.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
