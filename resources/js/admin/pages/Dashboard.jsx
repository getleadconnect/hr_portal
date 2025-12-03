import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, CheckCircle, Calendar, Clock, Check, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function Dashboard() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const response = await api.get('/admin/dashboard/stats');
            return response.data.data;
        },
    });

    // Approve leave request mutation
    const approveMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/leave-requests/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success('Leave request approved');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to approve');
        }
    });

    // Reject leave request mutation
    const rejectMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/leave-requests/${id}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
            toast.success('Leave request rejected');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to reject');
        }
    });

    const stats = [
        {
            title: 'Total Employees',
            value: data?.total_employees || 0,
            icon: Users,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-l-blue-500',
        },
        {
            title: 'Present Today',
            value: data?.present_today || 0,
            icon: CheckCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            borderColor: 'border-l-green-500',
        },
        {
            title: 'On Leave Today',
            value: data?.on_leave_today || 0,
            icon: Calendar,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            borderColor: 'border-l-orange-500',
        },
        {
            title: 'Pending Requests',
            value: data?.pending_requests || 0,
            icon: Clock,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-l-red-500',
        },
    ];

    // Calculate attendance data for donut chart
    const attendanceData = {
        present: data?.present_today || 0,
        absent: data?.absent_today || 0,
        onLeave: data?.on_leave_today || 0,
    };
    const totalAttendance = attendanceData.present + attendanceData.absent + attendanceData.onLeave;
    const percentage = data?.attendance_percentage || 0;

    // SVG donut chart calculations
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const presentOffset = circumference - (attendanceData.present / (totalAttendance || 1)) * circumference;
    const absentOffset = circumference - (attendanceData.absent / (totalAttendance || 1)) * circumference;
    const onLeaveOffset = circumference - (attendanceData.onLeave / (totalAttendance || 1)) * circumference;

    // Calculate stroke dash arrays for each segment
    const presentDash = totalAttendance > 0 ? (attendanceData.present / totalAttendance) * circumference : 0;
    const absentDash = totalAttendance > 0 ? (attendanceData.absent / totalAttendance) * circumference : 0;
    const onLeaveDash = totalAttendance > 0 ? (attendanceData.onLeave / totalAttendance) * circumference : 0;

    // Calculate rotation for each segment
    const presentRotation = -90;
    const absentRotation = presentRotation + (attendanceData.present / (totalAttendance || 1)) * 360;
    const onLeaveRotation = absentRotation + (attendanceData.absent / (totalAttendance || 1)) * 360;

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
                <h1 className="font-bold tracking-tight mb-2" style={{ fontSize: '1.5rem' }}>Admin Dashboard</h1>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className={`border-l-4 ${stat.borderColor}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className={`${stat.iconBg} rounded-lg p-3`}>
                                        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Attendance Chart and Recent Leave Requests */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Today's Attendance */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg font-semibold">Today's Attendance</CardTitle>
                        <Button variant="outline" size="sm">Export</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-8">
                            {/* Donut Chart */}
                            <div className="relative">
                                <svg width="180" height="180" viewBox="0 0 180 180">
                                    {/* Background circle */}
                                    <circle
                                        cx="90"
                                        cy="90"
                                        r={radius}
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="20"
                                    />
                                    {/* Present segment (green) */}
                                    {presentDash > 0 && (
                                        <circle
                                            cx="90"
                                            cy="90"
                                            r={radius}
                                            fill="none"
                                            stroke="#22c55e"
                                            strokeWidth="20"
                                            strokeDasharray={`${presentDash} ${circumference}`}
                                            strokeLinecap="round"
                                            transform={`rotate(${presentRotation} 90 90)`}
                                        />
                                    )}
                                    {/* Absent segment (red) */}
                                    {absentDash > 0 && (
                                        <circle
                                            cx="90"
                                            cy="90"
                                            r={radius}
                                            fill="none"
                                            stroke="#ef4444"
                                            strokeWidth="20"
                                            strokeDasharray={`${absentDash} ${circumference}`}
                                            strokeLinecap="round"
                                            transform={`rotate(${absentRotation} 90 90)`}
                                        />
                                    )}
                                    {/* On Leave segment (orange) */}
                                    {onLeaveDash > 0 && (
                                        <circle
                                            cx="90"
                                            cy="90"
                                            r={radius}
                                            fill="none"
                                            stroke="#f59e0b"
                                            strokeWidth="20"
                                            strokeDasharray={`${onLeaveDash} ${circumference}`}
                                            strokeLinecap="round"
                                            transform={`rotate(${onLeaveRotation} 90 90)`}
                                        />
                                    )}
                                </svg>
                                {/* Center text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-3xl font-bold text-green-600">{percentage}%</span>
                                    <span className="text-sm text-muted-foreground">Present</span>
                                </div>
                            </div>
                            {/* Legend */}
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                                    <span className="text-sm">Present: {attendanceData.present}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                                    <span className="text-sm">Absent: {attendanceData.absent}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                                    <span className="text-sm">On Leave: {attendanceData.onLeave}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Leave Requests */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">Recent Leave Requests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data?.recent_leave_requests?.length > 0 ? (
                                <>
                                    {data.recent_leave_requests.map((request) => (
                                        <div key={request.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                                    {request.employee_initials}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{request.employee_name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {request.leave_type} • {request.from_date}-{request.to_date} • {request.days} {request.days === 1 ? 'day' : 'days'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 rounded-full border-green-500 text-green-600 hover:bg-green-50"
                                                    onClick={() => approveMutation.mutate(request.id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 w-8 p-0 rounded-full border-red-500 text-red-600 hover:bg-red-50"
                                                    onClick={() => rejectMutation.mutate(request.id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="link"
                                        className="w-full text-blue-600 p-0 h-auto"
                                        onClick={() => navigate('/leave-requests')}
                                    >
                                        View All Requests →
                                    </Button>
                                </>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No pending leave requests</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
