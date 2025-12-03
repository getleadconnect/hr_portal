import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Clock, Calendar, DollarSign, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
    const navigate = useNavigate();

    const { data: stats, isLoading } = useQuery({
        queryKey: ['user-dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/admin/user/dashboard-stats');
            return response.data.data;
        },
    });

    const statCards = [
        {
            icon: Clock,
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-500',
            value: stats ? `${stats.days_present}/${stats.working_days}` : '0/0',
            label: 'Days Present',
        },
        {
            icon: Calendar,
            iconBg: 'bg-green-50',
            iconColor: 'text-green-500',
            value: stats ? `${stats.leave_taken}/${stats.total_leave}` : '0/0',
            label: 'Leave Balance',
        },
        {
            icon: DollarSign,
            iconBg: 'bg-orange-50',
            iconColor: 'text-orange-500',
            value: stats ? `${stats.hours_this_month}h` : '0h',
            label: 'Hours This Month',
        },
        {
            icon: FileText,
            iconBg: 'bg-red-50',
            iconColor: 'text-red-500',
            value: stats?.pending_requests || 0,
            label: 'Pending Requests',
        },
    ];

    const quickActions = [
        { label: 'Mark Attendance', onClick: () => navigate('/user/attendance'), variant: 'default' },
        { label: 'Apply for Leave', onClick: () => navigate('/user/leave'), variant: 'outline' },
        { label: 'View Reports', onClick: () => navigate('/user/attendance'), variant: 'outline' },
    ];

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="p-4 sm:p-6 animate-pulse">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gray-200 rounded-lg mb-3 sm:mb-4"></div>
                            <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 sm:h-4 w-20 sm:w-24 bg-gray-200 rounded"></div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className="p-4 sm:p-6 bg-white">
                            <div className={`h-8 w-8 sm:h-10 sm:w-10 ${stat.iconBg} rounded-lg flex items-center justify-center mb-3 sm:mb-4`}>
                                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.iconColor}`} />
                            </div>
                            <div className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">
                                {stat.value}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                                {stat.label}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card className="p-4 sm:p-6 bg-white">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {quickActions.map((action, index) => (
                        <Button
                            key={index}
                            variant={action.variant}
                            onClick={action.onClick}
                            className={`w-full sm:w-auto ${action.variant === 'default' ? 'bg-gray-900 hover:bg-gray-800' : ''}`}
                        >
                            {action.label}
                        </Button>
                    ))}
                </div>
            </Card>
        </div>
    );
}
