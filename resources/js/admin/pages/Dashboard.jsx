import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { FileText, Users, Briefcase, FolderKanban } from 'lucide-react';

export default function Dashboard() {
    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/admin/dashboard/stats');
            return response.data.data;
        },
    });

    const stats = [
        {
            title: 'Total Applications',
            value: data?.applications?.total || 0,
            description: `${data?.applications?.this_month || 0} this month`,
            icon: FileText,
            iconBg: 'bg-purple-600',
            cardBg: 'bg-purple-50',
        },
        {
            title: 'Active Employees',
            value: data?.employees?.active || 0,
            description: `${data?.employees?.total || 0} total employees`,
            icon: Users,
            iconBg: 'bg-blue-600',
            cardBg: 'bg-blue-50',
        },
        {
            title: 'Total Users',
            value: data?.users?.total || 0,
            description: `${data?.users?.active || 0} active users`,
            icon: Briefcase,
            iconBg: 'bg-red-600',
            cardBg: 'bg-red-50',
        },
        {
            title: 'Job Categories',
            value: data?.job_categories?.total || 0,
            description: `${data?.job_categories?.active || 0} active categories`,
            icon: FolderKanban,
            iconBg: 'bg-green-600',
            cardBg: 'bg-green-50',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: '1.25rem' }}>Overview</h1>
                <p className="text-muted-foreground">Welcome to the HR Portal admin panel</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className={`overflow-hidden ${stat.cardBg} border-0`}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`${stat.iconBg} rounded-xl p-3 flex items-center justify-center`}>
                                            <Icon className="h-6 w-6 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {stat.title}
                                        </span>
                                    </div>
                                    <div className="text-3xl font-bold">
                                        {stat.value}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Application Statistics</CardTitle>
                        <CardDescription>Recent application trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">This Week</span>
                                <span className="text-sm text-muted-foreground">
                                    {data?.applications?.this_week || 0} applications
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">This Month</span>
                                <span className="text-sm text-muted-foreground">
                                    {data?.applications?.this_month || 0} applications
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">This Year</span>
                                <span className="text-sm text-muted-foreground">
                                    {data?.applications?.this_year || 0} applications
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Employee Overview</CardTitle>
                        <CardDescription>Current employee status</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Active Employees</span>
                                <span className="text-sm text-green-600 font-medium">
                                    {data?.employees?.active || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Inactive Employees</span>
                                <span className="text-sm text-muted-foreground">
                                    {data?.employees?.inactive || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Total</span>
                                <span className="text-sm font-medium">
                                    {data?.employees?.total || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
