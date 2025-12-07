import { AdminLayout } from '../../components';
import { Users, Calendar, MapPin, TrendingUp } from 'lucide-react';

export default function AdminDashboardPage() {
    const stats = [
        {
            icon: Users,
            label: 'Total Users',
            value: '1,234',
            change: '+12%',
            changeType: 'positive' as const,
            color: 'blue'
        },
        {
            icon: Calendar,
            label: 'Total Events',
            value: '456',
            change: '+8%',
            changeType: 'positive' as const,
            color: 'green'
        },
        {
            icon: MapPin,
            label: 'Total Venues',
            value: '89',
            change: '+5%',
            changeType: 'positive' as const,
            color: 'purple'
        },
        {
            icon: TrendingUp,
            label: 'Revenue',
            value: '$45,678',
            change: '+15%',
            changeType: 'positive' as const,
            color: 'orange'
        }
    ];

    const getColorClasses = (color: string) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            purple: 'bg-purple-50 text-purple-600',
            orange: 'bg-orange-50 text-orange-600'
        };
        return colors[color as keyof typeof colors] || colors.blue;
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                                        <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                                        <p className="text-sm text-green-600 mt-2">{stat.change} from last month</p>
                                    </div>
                                    <div className={`p-3 rounded-lg ${getColorClasses(stat.color)}`}>
                                        <Icon size={24} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                JD
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">John Doe registered</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-semibold">
                                EV
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">New event created</p>
                                <p className="text-xs text-gray-500">5 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold">
                                VN
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">New venue added</p>
                                <p className="text-xs text-gray-500">1 day ago</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
