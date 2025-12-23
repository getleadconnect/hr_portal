import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../../components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import Pagination from '../../components/Pagination';
import DataTableControls from '../../components/DataTableControls';
import { Label } from '../../components/ui/label';
import { Calendar, FileDown, UserPlus, Edit, Trash2, Clock, Check } from 'lucide-react';

export default function AttendanceList() {
    const today = new Date().toISOString().split('T')[0];
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);

    // Filter states (for inputs)
    const [employeeId, setEmployeeId] = useState('');
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [statusFilter, setStatusFilter] = useState('');

    // Applied filter states (for API query)
    const [appliedFilters, setAppliedFilters] = useState({
        employeeId: '',
        startDate: today,
        endDate: today,
        statusFilter: ''
    });

    // Dialog states
    const [markDialogOpen, setMarkDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);

    // Form states for marking/editing attendance
    const [formData, setFormData] = useState({
        employee_id: '',
        attendance_date: today,
        check_in: '',
        check_out: '',
        status: 'present',
        remarks: ''
    });

    const queryClient = useQueryClient();

    // Fetch attendance records
    const { data, isLoading } = useQuery({
        queryKey: ['attendances', page, search, perPage, appliedFilters],
        queryFn: async () => {
            const response = await api.get('/admin/attendances', {
                params: {
                    page,
                    search,
                    per_page: perPage,
                    start_date: appliedFilters.startDate,
                    end_date: appliedFilters.endDate,
                    employee_id: appliedFilters.employeeId || undefined,
                    status: appliedFilters.statusFilter || undefined
                }
            });
            return response.data.data;
        },
    });

    // Fetch all employees for filter dropdown
    const { data: allEmployees } = useQuery({
        queryKey: ['employees-all-list'],
        queryFn: async () => {
            const response = await api.get('/admin/employees', {
                params: { per_page: 1000, status: 1 }
            });
            return response.data.data.data;
        },
    });

    // Fetch active employees for mark attendance dropdown
    const { data: employees } = useQuery({
        queryKey: ['employees-active', appliedFilters.startDate],
        queryFn: async () => {
            const response = await api.get('/admin/attendances/employees', {
                params: { date: appliedFilters.startDate }
            });
            return response.data.data;
        },
    });

    // Handle filter apply
    const handleApplyFilter = () => {
        setAppliedFilters({
            employeeId,
            startDate,
            endDate,
            statusFilter
        });
        setPage(1);
    };

    // Handle filter clear
    const handleClearFilter = () => {
        setEmployeeId('');
        setStartDate(today);
        setEndDate(today);
        setStatusFilter('');
        setAppliedFilters({
            employeeId: '',
            startDate: today,
            endDate: today,
            statusFilter: ''
        });
        setPage(1);
    };

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/attendances', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['attendances']);
            toast.success('Attendance marked successfully');
            setMarkDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error marking attendance');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/attendances/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['attendances']);
            toast.success('Attendance updated successfully');
            setEditDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error updating attendance');
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/attendances/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['attendances']);
            toast.success('Attendance deleted successfully');
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error deleting attendance');
        }
    });

    const resetForm = () => {
        setFormData({
            employee_id: '',
            attendance_date: today,
            check_in: '',
            check_out: '',
            status: 'present',
            remarks: ''
        });
        setSelectedAttendance(null);
    };

    const handleMarkAttendance = () => {
        setFormData({
            ...formData,
            attendance_date: today
        });
        setMarkDialogOpen(true);
    };

    const handleEdit = (attendance) => {
        setSelectedAttendance(attendance);
        setFormData({
            employee_id: attendance.employee_id.toString(),
            attendance_date: attendance.attendance_date,
            check_in: attendance.check_in !== '--:--' ? convertTo24Hour(attendance.check_in) : '',
            check_out: attendance.check_out !== '--:--' ? convertTo24Hour(attendance.check_out) : '',
            status: attendance.status,
            remarks: attendance.remarks || ''
        });
        setEditDialogOpen(true);
    };

    const handleDelete = (attendance) => {
        setSelectedAttendance(attendance);
        setDeleteDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.employee_id) {
            toast.error('Please select an employee');
            return;
        }
        createMutation.mutate(formData);
    };

    const handleUpdate = () => {
        if (!formData.employee_id) {
            toast.error('Please select an employee');
            return;
        }
        updateMutation.mutate({ id: selectedAttendance.id, data: formData });
    };

    const handleExportReport = async () => {
        try {
            const response = await api.get('/admin/attendances/export', {
                params: {
                    start_date: appliedFilters.startDate,
                    end_date: appliedFilters.endDate,
                    employee_id: appliedFilters.employeeId || undefined
                }
            });

            if (response.data.success && response.data.data.length > 0) {
                // Convert to CSV
                const headers = Object.keys(response.data.data[0]);
                const csvContent = [
                    headers.join(','),
                    ...response.data.data.map(row =>
                        headers.map(h => `"${row[h] || ''}"`).join(',')
                    )
                ].join('\n');

                // Download
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `attendance_report_${appliedFilters.startDate}_to_${appliedFilters.endDate}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success('Report exported successfully');
            } else {
                toast.info('No data to export');
            }
        } catch (error) {
            toast.error('Error exporting report');
        }
    };

    // Convert 12-hour format to 24-hour format for input
    const convertTo24Hour = (time12h) => {
        if (!time12h || time12h === '--:--') return '';
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            present: { label: 'PRESENT', variant: 'default', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
            absent: { label: 'ABSENT', variant: 'destructive', className: 'bg-red-100 text-red-700 hover:bg-red-100' },
            on_leave: { label: 'ON LEAVE', variant: 'secondary', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
            half_day: { label: 'HALF DAY', variant: 'outline', className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' }
        };
        const config = statusConfig[status] || { label: status?.toUpperCase() || 'N/A', className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' };
        return (
            <Badge className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).replace(/\//g, '/');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.5rem' }}>Attendance Management</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button onClick={handleMarkAttendance} className="bg-primary">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Mark Attendance
                    </Button>
                    <Button variant="outline" onClick={handleExportReport}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export Report
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader className="space-y-4 p-3">
                    {/* Filters - Employee, Date Range, Status */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Select key={`employee-${employeeId || 'empty'}`} value={employeeId} onValueChange={(value) => {
                            setEmployeeId(value === 'all' ? '' : value);
                        }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Employees" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Employees</SelectItem>
                                {allEmployees?.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>
                                        {emp.full_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex items-center gap-2">
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-[145px]"
                            />
                            <span className="text-sm text-muted-foreground">to</span>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-[145px]"
                            />
                        </div>
                        <Select key={`status-${statusFilter || 'empty'}`} value={statusFilter} onValueChange={(value) => {
                            setStatusFilter(value === 'all' ? '' : value);
                        }}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                                <SelectItem value="on_leave">On Leave</SelectItem>
                                <SelectItem value="half_day">Half Day</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleApplyFilter} className="bg-primary">
                            Filter
                        </Button>
                        <Button variant="outline" onClick={handleClearFilter}>
                            Clear
                        </Button>
                    </div>
                    {/* DataTable Controls - Show entries and Search */}
                    <DataTableControls
                        perPage={perPage}
                        onPerPageChange={(value) => {
                            setPerPage(value);
                            setPage(1);
                        }}
                        search={search}
                        onSearchChange={(value) => {
                            setSearch(value);
                            setPage(1);
                        }}
                        searchPlaceholder="Search employees..."
                    />
                </CardHeader>
                <CardContent className="p-3">
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium text-sm">EMPLOYEE</th>
                                            <th className="p-3 text-left font-medium text-sm">DATE</th>
                                            <th className="p-3 text-left font-medium text-sm">CHECK IN</th>
                                            <th className="p-3 text-left font-medium text-sm">CHECK OUT</th>
                                            <th className="p-3 text-left font-medium text-sm">HOURS</th>
                                            <th className="p-3 text-left font-medium text-sm">NOTES</th>
                                            <th className="p-3 text-left font-medium text-sm">STATUS</th>
                                            <th className="p-3 text-center font-medium text-sm">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.length > 0 ? (
                                            data.data.map((attendance) => (
                                                <tr key={attendance.id} className="border-b hover:bg-muted/30">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-medium text-sm">
                                                                {attendance.employee_initials}
                                                            </div>
                                                            <span className="font-medium text-sm">{attendance.employee_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-sm">{formatDate(attendance.attendance_date)}</td>
                                                    <td className="p-3 text-sm">{attendance.check_in}</td>
                                                    <td className="p-3 text-sm">{attendance.check_out}</td>
                                                    <td className="p-3 text-sm">{attendance.hours ? Math.abs(parseFloat(attendance.hours)).toFixed(2) : '--'}</td>
                                                    <td className="p-3 text-sm">{attendance.remarks || '-'}</td>
                                                    <td className="p-3">
                                                        {getStatusBadge(attendance.status)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleEdit(attendance)}
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleDelete(attendance)}
                                                                className="text-destructive hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="p-8 text-center text-muted-foreground">
                                                    No attendance records found for selected filters
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {data?.data?.length > 0 && (
                                <Pagination
                                    currentPage={data?.current_page || 1}
                                    lastPage={data?.last_page || 1}
                                    total={data?.total || 0}
                                    from={data?.from || 0}
                                    to={data?.to || 0}
                                    onPageChange={setPage}
                                />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Mark Attendance Dialog */}
            <Dialog open={markDialogOpen} onOpenChange={setMarkDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Mark Employee Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-4">
                        {/* Date and Employee in one row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.attendance_date}
                                    onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Employee *</Label>
                                <Select
                                    value={formData.employee_id}
                                    onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose employee..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees?.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id.toString()}>
                                                {emp.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Attendance Status - Radio buttons */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Attendance Status *</Label>
                            <div className="flex items-center gap-6 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="present"
                                        checked={formData.status === 'present'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm">Present</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="absent"
                                        checked={formData.status === 'absent'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm">Absent</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="half_day"
                                        checked={formData.status === 'half_day'}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-4 h-4 text-primary"
                                    />
                                    <span className="text-sm">Half Day</span>
                                </label>
                            </div>
                        </div>

                        {/* Check In, Check Out, Total Hours in single line */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Check In *</Label>
                                <Input
                                    type="time"
                                    value={formData.check_in}
                                    onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Check Out</Label>
                                <Input
                                    type="time"
                                    value={formData.check_out}
                                    onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Total Hours</Label>
                                <div className="bg-muted/50 rounded-md h-10 flex items-center justify-center text-muted-foreground text-sm">
                                    {formData.check_in && formData.check_out ? (
                                        (() => {
                                            const checkIn = new Date(`2000-01-01T${formData.check_in}`);
                                            const checkOut = new Date(`2000-01-01T${formData.check_out}`);
                                            const diff = (checkOut - checkIn) / (1000 * 60 * 60);
                                            return diff > 0 ? `${diff.toFixed(2)} hrs` : '--';
                                        })()
                                    ) : '--'}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Notes</Label>
                            <textarea
                                placeholder="Add notes (optional)"
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setMarkDialogOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Saving...' : 'Save Attendance'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Attendance Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Attendance</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Employee</label>
                            <Input
                                value={selectedAttendance?.employee_name || ''}
                                disabled
                                className="bg-muted"
                            />
                        </div>
                        {/* Date and Status in single line */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    type="date"
                                    value={formData.attendance_date}
                                    onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status *</label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="present">Present</SelectItem>
                                        <SelectItem value="absent">Absent</SelectItem>
                                        <SelectItem value="on_leave">On Leave</SelectItem>
                                        <SelectItem value="half_day">Half Day</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* Check In and Check Out */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Check In</label>
                                <Input
                                    type="time"
                                    value={formData.check_in}
                                    onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Check Out</label>
                                <Input
                                    type="time"
                                    value={formData.check_out}
                                    onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Remarks</label>
                            <textarea
                                placeholder="Optional remarks..."
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setEditDialogOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Saving...' : 'Update'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the attendance
                            record for {selectedAttendance?.employee_name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(selectedAttendance?.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
