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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '../../components/ui/tooltip';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';

export default function LeaveRequestList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    // Dialog states
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [approveDialogOpen, setApproveDialogOpen] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedLeaveRequest, setSelectedLeaveRequest] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        employee_id: '',
        leave_type: '',
        from_date: '',
        to_date: '',
        days: '',
        reason: ''
    });

    const queryClient = useQueryClient();

    // Fetch leave requests
    const { data, isLoading } = useQuery({
        queryKey: ['leave-requests', page, search, perPage, statusFilter, leaveTypeFilter, departmentId],
        queryFn: async () => {
            const response = await api.get('/admin/leave-requests', {
                params: {
                    page,
                    search,
                    per_page: perPage,
                    status: statusFilter || undefined,
                    leave_type: leaveTypeFilter || undefined,
                    department_id: departmentId || undefined
                }
            });
            return response.data.data;
        },
    });

    // Fetch departments for filter
    const { data: departments } = useQuery({
        queryKey: ['departments-all'],
        queryFn: async () => {
            const response = await api.get('/admin/departments', {
                params: { per_page: 1000 }
            });
            return response.data.data.data;
        },
    });

    // Fetch active employees for dropdown
    const { data: employees } = useQuery({
        queryKey: ['employees-for-leave'],
        queryFn: async () => {
            const response = await api.get('/admin/leave-requests/employees');
            return response.data.data;
        },
    });

    // Fetch status counts
    const { data: statusCounts } = useQuery({
        queryKey: ['leave-requests-counts', departmentId, leaveTypeFilter],
        queryFn: async () => {
            const response = await api.get('/admin/leave-requests', {
                params: {
                    per_page: 1,
                    department_id: departmentId || undefined,
                    leave_type: leaveTypeFilter || undefined
                }
            });
            const total = response.data.data.total || 0;

            // Fetch counts for each status
            const pendingRes = await api.get('/admin/leave-requests', {
                params: {
                    per_page: 1,
                    status: 'pending',
                    department_id: departmentId || undefined,
                    leave_type: leaveTypeFilter || undefined
                }
            });
            const approvedRes = await api.get('/admin/leave-requests', {
                params: {
                    per_page: 1,
                    status: 'approved',
                    department_id: departmentId || undefined,
                    leave_type: leaveTypeFilter || undefined
                }
            });
            const rejectedRes = await api.get('/admin/leave-requests', {
                params: {
                    per_page: 1,
                    status: 'rejected',
                    department_id: departmentId || undefined,
                    leave_type: leaveTypeFilter || undefined
                }
            });

            return {
                all: total,
                pending: pendingRes.data.data.total || 0,
                approved: approvedRes.data.data.total || 0,
                rejected: rejectedRes.data.data.total || 0
            };
        },
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/leave-requests', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-requests']);
            queryClient.invalidateQueries(['leave-requests-counts']);
            toast.success('Leave request created successfully');
            setCreateDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error creating leave request');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/leave-requests/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-requests']);
            queryClient.invalidateQueries(['leave-requests-counts']);
            toast.success('Leave request updated successfully');
            setEditDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error updating leave request');
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/leave-requests/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-requests']);
            queryClient.invalidateQueries(['leave-requests-counts']);
            toast.success('Leave request deleted successfully');
            setDeleteDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error deleting leave request');
        }
    });

    // Approve mutation
    const approveMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/leave-requests/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-requests']);
            queryClient.invalidateQueries(['leave-requests-counts']);
            toast.success('Leave request approved successfully');
            setApproveDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error approving leave request');
        }
    });

    // Reject mutation
    const rejectMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/leave-requests/${id}/reject`),
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-requests']);
            queryClient.invalidateQueries(['leave-requests-counts']);
            toast.success('Leave request rejected successfully');
            setRejectDialogOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error rejecting leave request');
        }
    });

    const resetForm = () => {
        setFormData({
            employee_id: '',
            leave_type: '',
            from_date: '',
            to_date: '',
            days: '',
            reason: ''
        });
        setSelectedLeaveRequest(null);
    };

    const handleCreate = () => {
        resetForm();
        setCreateDialogOpen(true);
    };

    const handleEdit = (leaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        setFormData({
            employee_id: leaveRequest.employee_id.toString(),
            leave_type: leaveRequest.leave_type,
            from_date: convertDateToInput(leaveRequest.from_date),
            to_date: convertDateToInput(leaveRequest.to_date),
            days: leaveRequest.days.toString(),
            reason: leaveRequest.reason || ''
        });
        setEditDialogOpen(true);
    };

    const handleDelete = (leaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        setDeleteDialogOpen(true);
    };

    const handleApprove = (leaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        setApproveDialogOpen(true);
    };

    const handleReject = (leaveRequest) => {
        setSelectedLeaveRequest(leaveRequest);
        setRejectDialogOpen(true);
    };

    const handleSubmit = () => {
        if (!formData.employee_id || !formData.leave_type || !formData.from_date || !formData.to_date || !formData.days) {
            toast.error('Please fill in all required fields');
            return;
        }
        createMutation.mutate(formData);
    };

    const handleUpdate = () => {
        if (!formData.employee_id || !formData.leave_type || !formData.from_date || !formData.to_date || !formData.days) {
            toast.error('Please fill in all required fields');
            return;
        }
        updateMutation.mutate({ id: selectedLeaveRequest.id, data: formData });
    };

    // Calculate days when dates change
    const calculateDays = (fromDate, toDate) => {
        if (fromDate && toDate) {
            const from = new Date(fromDate);
            const to = new Date(toDate);
            const diffTime = Math.abs(to - from);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays > 0 ? diffDays : 1;
        }
        return '';
    };

    const handleFromDateChange = (value) => {
        const days = calculateDays(value, formData.to_date);
        setFormData({ ...formData, from_date: value, days: days.toString() });
    };

    const handleToDateChange = (value) => {
        const days = calculateDays(formData.from_date, value);
        setFormData({ ...formData, to_date: value, days: days.toString() });
    };

    // Convert dd/mm/yyyy to yyyy-mm-dd for input
    const convertDateToInput = (dateStr) => {
        if (!dateStr) return '';
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
        return dateStr;
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'PENDING', className: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' },
            approved: { label: 'APPROVED', className: 'bg-green-100 text-green-700 hover:bg-green-100' },
            rejected: { label: 'REJECTED', className: 'bg-red-100 text-red-700 hover:bg-red-100' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
            <Badge className={config.className}>
                {config.label}
            </Badge>
        );
    };

    const getLeaveTypeBadge = (leaveType) => {
        const typeConfig = {
            'Annual Leave': { className: 'bg-blue-100 text-blue-700 hover:bg-blue-100' },
            'Sick Leave': { className: 'bg-orange-100 text-orange-700 hover:bg-orange-100' },
            'Casual Leave': { className: 'bg-purple-100 text-purple-700 hover:bg-purple-100' }
        };
        const config = typeConfig[leaveType] || { className: 'bg-gray-100 text-gray-700 hover:bg-gray-100' };
        return (
            <Badge className={config.className}>
                {leaveType}
            </Badge>
        );
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-3">
                        <h1 className="font-bold tracking-tight" style={{ fontSize: '1.5rem' }}>Leave Requests</h1>
                        {/* Status Count Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    setStatusFilter('');
                                    setPage(1);
                                }}
                                className={`px-4 py-1.5 text-sm font-medium rounded border transition-colors ${
                                    statusFilter === ''
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border hover:bg-muted'
                                }`}
                            >
                                All ({statusCounts?.all || 0})
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter('pending');
                                    setPage(1);
                                }}
                                className={`px-4 py-1.5 text-sm font-medium rounded border transition-colors ${
                                    statusFilter === 'pending'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border hover:bg-muted'
                                }`}
                            >
                                Pending ({statusCounts?.pending || 0})
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter('approved');
                                    setPage(1);
                                }}
                                className={`px-4 py-1.5 text-sm font-medium rounded border transition-colors ${
                                    statusFilter === 'approved'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border hover:bg-muted'
                                }`}
                            >
                                Approved ({statusCounts?.approved || 0})
                            </button>
                            <button
                                onClick={() => {
                                    setStatusFilter('rejected');
                                    setPage(1);
                                }}
                                className={`px-4 py-1.5 text-sm font-medium rounded border transition-colors ${
                                    statusFilter === 'rejected'
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-background border-border hover:bg-muted'
                                }`}
                            >
                                Rejected ({statusCounts?.rejected || 0})
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button onClick={handleCreate} className="bg-primary">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Leave Request
                        </Button>
                    </div>
                </div>

            <Card>
                <CardHeader className="space-y-4 p-3">
                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={departmentId} onValueChange={(value) => {
                            setDepartmentId(value === 'all' ? '' : value);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments?.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.department_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={leaveTypeFilter} onValueChange={(value) => {
                            setLeaveTypeFilter(value === 'all' ? '' : value);
                            setPage(1);
                        }}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="All Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                                <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {/* DataTable Controls */}
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
                                            <th className="p-3 text-left font-medium text-sm">LEAVE TYPE</th>
                                            <th className="p-3 text-left font-medium text-sm">FROM</th>
                                            <th className="p-3 text-left font-medium text-sm">TO</th>
                                            <th className="p-3 text-left font-medium text-sm">DAYS</th>
                                            <th className="p-3 text-left font-medium text-sm">REASON</th>
                                            <th className="p-3 text-left font-medium text-sm">STATUS</th>
                                            <th className="p-3 text-center font-medium text-sm">ACTION</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.length > 0 ? (
                                            data.data.map((leaveRequest) => (
                                                <tr key={leaveRequest.id} className="border-b hover:bg-muted/30">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-medium text-sm">
                                                                {leaveRequest.employee_initials}
                                                            </div>
                                                            <span className="font-medium text-sm">{leaveRequest.employee_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {getLeaveTypeBadge(leaveRequest.leave_type)}
                                                    </td>
                                                    <td className="p-3 text-sm">{leaveRequest.from_date}</td>
                                                    <td className="p-3 text-sm">{leaveRequest.to_date}</td>
                                                    <td className="p-3 text-sm">{leaveRequest.days}</td>
                                                    <td className="p-3">
                                                        <div className="max-w-xs">
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <p className="text-sm truncate cursor-help">
                                                                        {leaveRequest.reason || '-'}
                                                                    </p>
                                                                </TooltipTrigger>
                                                                {leaveRequest.reason && (
                                                                    <TooltipContent className="max-w-sm">
                                                                        <p className="whitespace-normal">{leaveRequest.reason}</p>
                                                                    </TooltipContent>
                                                                )}
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                    <td className="p-3">
                                                        {getStatusBadge(leaveRequest.status)}
                                                    </td>
                                                    <td className="p-3 text-center">
                                                        <div className="flex items-center justify-center gap-2">
                                                            {leaveRequest.status === 'pending' && (
                                                                <>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handleApprove(leaveRequest)}
                                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                            >
                                                                                <Check className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Approve</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
                                                                                size="sm"
                                                                                onClick={() => handleReject(leaveRequest)}
                                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                            >
                                                                                <X className="h-4 w-4" />
                                                                            </Button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>
                                                                            <p>Reject</p>
                                                                        </TooltipContent>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleEdit(leaveRequest)}
                                                                        disabled={leaveRequest.status !== 'pending'}
                                                                    >
                                                                        <Edit className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>{leaveRequest.status !== 'pending' ? 'Only pending requests can be edited' : 'Edit'}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handleDelete(leaveRequest)}
                                                                        className="text-destructive hover:text-destructive"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Delete</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="p-8 text-center text-muted-foreground">
                                                    No leave requests found
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

            {/* Create Leave Request Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Add Leave Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Employee *</Label>
                            <Select
                                value={formData.employee_id}
                                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees?.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                            {emp.full_name} ({emp.employee_id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Leave Type *</Label>
                            <Select
                                value={formData.leave_type}
                                onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select leave type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">From Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.from_date}
                                    onChange={(e) => handleFromDateChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">To Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.to_date}
                                    onChange={(e) => handleToDateChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Days *</Label>
                                <Input
                                    type="number"
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Reason</Label>
                            <textarea
                                placeholder="Enter reason for leave..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setCreateDialogOpen(false); resetForm(); }}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                            {createMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Leave Request Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[550px]">
                    <DialogHeader>
                        <DialogTitle>Edit Leave Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Employee *</Label>
                            <Select
                                value={formData.employee_id}
                                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees?.map((emp) => (
                                        <SelectItem key={emp.id} value={emp.id.toString()}>
                                            {emp.full_name} ({emp.employee_id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Leave Type *</Label>
                            <Select
                                value={formData.leave_type}
                                onValueChange={(value) => setFormData({ ...formData, leave_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select leave type..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">From Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.from_date}
                                    onChange={(e) => handleFromDateChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">To Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.to_date}
                                    onChange={(e) => handleToDateChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Days *</Label>
                                <Input
                                    type="number"
                                    value={formData.days}
                                    onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Reason</Label>
                            <textarea
                                placeholder="Enter reason for leave..."
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                            This action cannot be undone. This will permanently delete the leave
                            request for {selectedLeaveRequest?.employee_name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(selectedLeaveRequest?.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Approve Confirmation Dialog */}
            <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Approve Leave Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to approve the leave request for {selectedLeaveRequest?.employee_name}?
                            <br /><br />
                            <strong>Leave Type:</strong> {selectedLeaveRequest?.leave_type}<br />
                            <strong>Duration:</strong> {selectedLeaveRequest?.from_date} to {selectedLeaveRequest?.to_date} ({selectedLeaveRequest?.days} days)
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => approveMutation.mutate(selectedLeaveRequest?.id)}
                            className="bg-green-600 text-white hover:bg-green-700"
                        >
                            Approve
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to reject the leave request for {selectedLeaveRequest?.employee_name}?
                            <br /><br />
                            <strong>Leave Type:</strong> {selectedLeaveRequest?.leave_type}<br />
                            <strong>Duration:</strong> {selectedLeaveRequest?.from_date} to {selectedLeaveRequest?.to_date} ({selectedLeaveRequest?.days} days)
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => rejectMutation.mutate(selectedLeaveRequest?.id)}
                            className="bg-red-600 text-white hover:bg-red-700"
                        >
                            Reject
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            </div>
        </TooltipProvider>
    );
}
