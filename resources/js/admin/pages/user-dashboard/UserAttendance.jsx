import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Clock, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserAttendance() {
    const queryClient = useQueryClient();
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState((currentDate.getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
    const [calendarMonth, setCalendarMonth] = useState(currentDate.getMonth() + 1);
    const [calendarYear, setCalendarYear] = useState(currentDate.getFullYear());

    // Fetch attendance data
    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ['user-attendance', selectedMonth, selectedYear],
        queryFn: async () => {
            const response = await api.get('/admin/user/attendance', {
                params: { month: selectedMonth, year: selectedYear }
            });
            return response.data.data;
        },
    });

    // Fetch calendar data
    const { data: calendarData, isLoading: calendarLoading } = useQuery({
        queryKey: ['user-calendar-attendance', calendarMonth, calendarYear],
        queryFn: async () => {
            const response = await api.get('/admin/user/attendance/calendar', {
                params: { month: calendarMonth, year: calendarYear }
            });
            return response.data.data;
        },
    });

    // Check-in mutation
    const checkInMutation = useMutation({
        mutationFn: () => api.post('/admin/user/attendance/check-in'),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['user-attendance']);
            queryClient.invalidateQueries(['user-dashboard-stats']);
            queryClient.invalidateQueries(['user-calendar-attendance']);
            toast.success(response.data.message || 'Checked in successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to check in');
        },
    });

    // Check-out mutation
    const checkOutMutation = useMutation({
        mutationFn: () => api.post('/admin/user/attendance/check-out'),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['user-attendance']);
            queryClient.invalidateQueries(['user-dashboard-stats']);
            queryClient.invalidateQueries(['user-calendar-attendance']);
            toast.success(response.data.message || 'Checked out successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to check out');
        },
    });

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const years = [];
    for (let y = currentDate.getFullYear(); y >= currentDate.getFullYear() - 2; y--) {
        years.push({ value: y.toString(), label: y.toString() });
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case 'present':
                return <Badge className="bg-green-100 text-green-700">Present</Badge>;
            case 'absent':
                return <Badge className="bg-red-100 text-red-700">Absent</Badge>;
            case 'leave':
                return <Badge className="bg-yellow-100 text-yellow-700">Leave</Badge>;
            case 'half_day':
                return <Badge className="bg-orange-100 text-orange-700">Half Day</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatTime = (timeString) => {
        if (!timeString) return '-';
        return timeString;
    };

    const handlePrevMonth = () => {
        if (calendarMonth === 1) {
            setCalendarMonth(12);
            setCalendarYear(calendarYear - 1);
        } else {
            setCalendarMonth(calendarMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (calendarMonth === 12) {
            setCalendarMonth(1);
            setCalendarYear(calendarYear + 1);
        } else {
            setCalendarMonth(calendarMonth + 1);
        }
    };

    const getFirstDayOfMonth = () => {
        return new Date(calendarYear, calendarMonth - 1, 1).getDay();
    };

    const getDayClass = (day) => {
        if (!day) return '';

        let baseClass = 'flex items-center justify-center rounded-full text-xs sm:text-sm font-medium transition-colors';

        if (day.is_weekend) {
            return `${baseClass} text-gray-400`;
        }

        if (day.is_today) {
            baseClass += ' ring-2 ring-blue-500';
        }

        if (day.is_future) {
            return `${baseClass} text-gray-400`;
        }

        switch (day.status) {
            case 'present':
                return `${baseClass} bg-green-500 text-white`;
            case 'absent':
                return `${baseClass} bg-red-500 text-white`;
            case 'leave':
                return `${baseClass} bg-yellow-500 text-white`;
            case 'half_day':
                return `${baseClass} bg-orange-500 text-white`;
            default:
                return `${baseClass} text-gray-700`;
        }
    };

    // Build calendar grid
    const calendarGrid = [];
    const firstDay = getFirstDayOfMonth();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        calendarGrid.push(null);
    }

    // Add days from calendar data
    if (calendarData?.days) {
        calendarData.days.forEach(day => {
            calendarGrid.push(day);
        });
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Attendance</h1>

            {/* Today's Attendance Card */}
            <Card className="p-4 sm:p-6 bg-white">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Today's Attendance</h2>
                <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:ml-auto">
                        <Button
                            onClick={() => checkInMutation.mutate()}
                            disabled={checkInMutation.isPending || attendanceData?.today?.check_in}
                            className="bg-green-600 hover:bg-green-700 text-sm"
                            size="sm"
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            {attendanceData?.today?.check_in ? `In: ${attendanceData.today.check_in}` : 'Check In'}
                        </Button>
                        <Button
                            onClick={() => checkOutMutation.mutate()}
                            disabled={checkOutMutation.isPending || !attendanceData?.today?.check_in || attendanceData?.today?.check_out}
                            variant="outline"
                            size="sm"
                            className="text-sm"
                        >
                            <Clock className="h-4 w-4 mr-2" />
                            {attendanceData?.today?.check_out ? `Out: ${attendanceData.today.check_out}` : 'Check Out'}
                        </Button>
                    </div>
                </div>
                {attendanceData?.today && (
                    <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                        <span className="text-gray-500">Status:</span>
                        {getStatusBadge(attendanceData.today.status)}
                        {attendanceData.today.hours && (
                            <span className="text-gray-600">| Hours: {attendanceData.today.hours}</span>
                        )}
                    </div>
                )}
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <Card className="p-3 sm:p-4 bg-white text-center">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{attendanceData?.summary?.working_days || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Working Days</div>
                </Card>
                <Card className="p-3 sm:p-4 bg-white text-center">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{attendanceData?.summary?.present || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Present</div>
                </Card>
                <Card className="p-3 sm:p-4 bg-white text-center">
                    <div className="text-xl sm:text-2xl font-bold text-red-600">{attendanceData?.summary?.absent || 0}</div>
                    <div className="text-xs sm:text-sm text-gray-500">Absent</div>
                </Card>
                <Card className="p-3 sm:p-4 bg-white text-center">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{attendanceData?.summary?.total_hours || 0}h</div>
                    <div className="text-xs sm:text-sm text-gray-500">Total Hours</div>
                </Card>
            </div>

            {/* Attendance Calendar */}
            <Card className="p-4 sm:p-6 bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Attendance Calendar</h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handlePrevMonth}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-medium min-w-[120px] text-center">
                            {monthNames[calendarMonth - 1]} {calendarYear}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleNextMonth}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {calendarLoading ? (
                    <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map((day) => (
                                <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {calendarGrid.map((day, index) => (
                                <div key={index} className="flex items-center justify-center py-1">
                                    {day ? (
                                        <div className={getDayClass(day)} style={{ width: '2rem', height: '2rem' }} title={day.status || ''}>
                                            {day.day}
                                        </div>
                                    ) : (
                                        <div style={{ width: '2rem', height: '2rem' }}></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-green-500"></div>
                                <span className="text-xs text-gray-600">Present</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-red-500"></div>
                                <span className="text-xs text-gray-600">Absent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
                                <span className="text-xs text-gray-600">Leave</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded-full bg-orange-500"></div>
                                <span className="text-xs text-gray-600">Half Day</span>
                            </div>
                        </div>
                    </>
                )}
            </Card>

            {/* Attendance History */}
            <Card className="bg-white">
                <div className="p-4 sm:p-6 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Attendance History</h2>
                        <div className="flex gap-2">
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="w-28 sm:w-32 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map((month) => (
                                        <SelectItem key={month.value} value={month.value}>
                                            {month.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="w-20 sm:w-24 text-sm">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((year) => (
                                        <SelectItem key={year.value} value={year.value}>
                                            {year.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Date</th>
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Check In</th>
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Check Out</th>
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Hours</th>
                                        <th className="p-3 text-left text-sm font-medium text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData?.records?.length > 0 ? (
                                        attendanceData.records.map((record, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="p-3 text-sm">{formatDate(record.date)}</td>
                                                <td className="p-3 text-sm">{formatTime(record.check_in)}</td>
                                                <td className="p-3 text-sm">{formatTime(record.check_out)}</td>
                                                <td className="p-3 text-sm">{record.hours || '-'}</td>
                                                <td className="p-3">{getStatusBadge(record.status)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-500">
                                                No attendance records found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="sm:hidden p-3 space-y-3">
                            {attendanceData?.records?.length > 0 ? (
                                attendanceData.records.map((record, index) => (
                                    <div key={index} className="border rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">{formatDate(record.date)}</span>
                                            {getStatusBadge(record.status)}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-500">In:</span>
                                                <span className="ml-1 text-gray-900">{formatTime(record.check_in)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Out:</span>
                                                <span className="ml-1 text-gray-900">{formatTime(record.check_out)}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Hrs:</span>
                                                <span className="ml-1 text-gray-900">{record.hours || '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No attendance records found
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Card>
        </div>
    );
}
