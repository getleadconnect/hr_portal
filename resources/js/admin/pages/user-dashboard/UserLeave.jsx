import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
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
import { Plus, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserLeave() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewRequest, setViewRequest] = useState(null);
    const [formData, setFormData] = useState({
        leave_type: '',
        from_date: '',
        to_date: '',
        reason: '',
    });

    // Fetch leave requests
    const { data: leaveData, isLoading } = useQuery({
        queryKey: ['user-leave-requests'],
        queryFn: async () => {
            const response = await api.get('/admin/user/leave-requests');
            return response.data.data;
        },
    });

    // Create leave request mutation
    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/user/leave-requests', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['user-leave-requests']);
            queryClient.invalidateQueries(['user-dashboard-stats']);
            setIsDialogOpen(false);
            resetForm();
            toast.success('Leave request submitted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to submit leave request');
        },
    });

    // Delete leave request mutation
    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/user/leave-requests/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['user-leave-requests']);
            queryClient.invalidateQueries(['user-dashboard-stats']);
            setDeleteId(null);
            toast.success('Leave request deleted successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete leave request');
        },
    });

    const resetForm = () => {
        setFormData({
            leave_type: '',
            from_date: '',
            to_date: '',
            reason: '',
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    const calculateDays = () => {
        if (formData.from_date && formData.to_date) {
            const from = new Date(formData.from_date);
            const to = new Date(formData.to_date);
            const diff = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
            return diff > 0 ? diff : 0;
        }
        return 0;
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
            case 'approved':
                return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    };

    // Filter requests by status
    const filteredRequests = leaveData?.requests?.filter(request => {
        if (statusFilter === 'all') return true;
        return request.status === statusFilter;
    }) || [];

    // Count requests by status
    const statusCounts = {
        all: leaveData?.requests?.length || 0,
        pending: leaveData?.requests?.filter(r => r.status === 'pending').length || 0,
        approved: leaveData?.requests?.filter(r => r.status === 'approved').length || 0,
        rejected: leaveData?.requests?.filter(r => r.status === 'rejected').length || 0,
    };

    // Calculate progress percentage for leave balance
    const getProgressPercentage = (taken, allowed) => {
        if (!allowed || allowed === 0) return 0;
        return Math.min((taken / allowed) * 100, 100);
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Leave Management</h1>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-gray-900 hover:bg-gray-800 text-sm">
                    Apply for Leave
                </Button>
            </div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {/* Annual Leave */}
                <Card className="p-3 sm:p-5 bg-white">
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Annual Leave</div>
                    <div className="flex items-baseline gap-1 mb-2 sm:mb-3">
                        <span className="text-xl sm:text-3xl font-light text-gray-900">
                            {leaveData?.balance?.annual?.taken || 0}
                        </span>
                        <span className="text-xs sm:text-base text-gray-400">/ {leaveData?.balance?.annual?.allowed || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                        <div
                            className="bg-blue-500 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(leaveData?.balance?.annual?.taken || 0, leaveData?.balance?.annual?.allowed || 0)}%` }}
                        ></div>
                    </div>
                </Card>

                {/* Sick Leave */}
                <Card className="p-3 sm:p-5 bg-white">
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Sick Leave</div>
                    <div className="flex items-baseline gap-1 mb-2 sm:mb-3">
                        <span className="text-xl sm:text-3xl font-light text-gray-900">
                            {leaveData?.balance?.sick?.taken || 0}
                        </span>
                        <span className="text-xs sm:text-base text-gray-400">/ {leaveData?.balance?.sick?.allowed || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                        <div
                            className="bg-green-500 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(leaveData?.balance?.sick?.taken || 0, leaveData?.balance?.sick?.allowed || 0)}%` }}
                        ></div>
                    </div>
                </Card>

                {/* Casual Leave */}
                <Card className="p-3 sm:p-5 bg-white">
                    <div className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Casual Leave</div>
                    <div className="flex items-baseline gap-1 mb-2 sm:mb-3">
                        <span className="text-xl sm:text-3xl font-light text-gray-900">
                            {leaveData?.balance?.casual?.taken || 0}
                        </span>
                        <span className="text-xs sm:text-base text-gray-400">/ {leaveData?.balance?.casual?.allowed || 0}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1 sm:h-1.5">
                        <div
                            className="bg-orange-400 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(leaveData?.balance?.casual?.taken || 0, leaveData?.balance?.casual?.allowed || 0)}%` }}
                        ></div>
                    </div>
                </Card>
            </div>

            {/* Leave Requests Section */}
            <Card className="bg-white">
                <div className="p-3 sm:p-5 border-b">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Leave Requests</h2>

                    {/* Status Filter Tabs */}
                    <div className="flex gap-3 sm:gap-6 border-b -mb-px overflow-x-auto">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                statusFilter === 'all'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                statusFilter === 'pending'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setStatusFilter('approved')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                statusFilter === 'approved'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Approved
                        </button>
                        <button
                            onClick={() => setStatusFilter('rejected')}
                            className={`pb-2 sm:pb-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                statusFilter === 'rejected'
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Rejected
                        </button>
                    </div>
                </div>

                {/* Table / Cards */}
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading...</div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leave Type</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To Date</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map((request) => (
                                            <tr key={request.id} className="hover:bg-gray-50">
                                                <td className="px-5 py-4 text-sm text-gray-900">{request.leave_type}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{formatDate(request.from_date)}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{formatDate(request.to_date)}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{request.days}</td>
                                                <td className="px-5 py-4 text-sm text-gray-600">{request.reason || '-'}</td>
                                                <td className="px-5 py-4">{getStatusBadge(request.status)}</td>
                                                <td className="px-5 py-4">
                                                    {request.status === 'pending' ? (
                                                        <button
                                                            onClick={() => setDeleteId(request.id)}
                                                            className="text-sm text-red-500 hover:text-red-600 font-medium"
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => setViewRequest(request)}
                                                            className="text-sm text-blue-500 hover:text-blue-600 font-medium"
                                                        >
                                                            View
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                                                No leave requests found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="sm:hidden p-3 space-y-3">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <div key={request.id} className="border rounded-lg p-3 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-900">{request.leave_type}</span>
                                            {getStatusBadge(request.status)}
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <span className="text-gray-500">From:</span>
                                                <p className="text-gray-900">{formatDate(request.from_date)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">To:</span>
                                                <p className="text-gray-900">{formatDate(request.to_date)}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Days:</span>
                                                <p className="text-gray-900">{request.days}</p>
                                            </div>
                                        </div>
                                        {request.reason && (
                                            <p className="text-xs text-gray-500 truncate">Reason: {request.reason}</p>
                                        )}
                                        <div className="pt-2 border-t">
                                            {request.status === 'pending' ? (
                                                <button
                                                    onClick={() => setDeleteId(request.id)}
                                                    className="text-xs text-red-500 hover:text-red-600 font-medium"
                                                >
                                                    Cancel Request
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setViewRequest(request)}
                                                    className="text-xs text-blue-500 hover:text-blue-600 font-medium"
                                                >
                                                    View Details
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No leave requests found
                                </div>
                            )}
                        </div>
                    </>
                )}
            </Card>

            {/* Apply Leave Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="w-[400px] max-w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Apply for Leave</DialogTitle>
                        <DialogDescription>Submit a new leave request</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <Label>Leave Type *</Label>
                            <Select
                                value={formData.leave_type}
                                onValueChange={(value) => setFormData(prev => ({ ...prev, leave_type: value }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Annual Leave">Annual Leave</SelectItem>
                                    <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                                    <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <Label>From Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.from_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, from_date: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <Label>To Date *</Label>
                                <Input
                                    type="date"
                                    value={formData.to_date}
                                    onChange={(e) => setFormData(prev => ({ ...prev, to_date: e.target.value }))}
                                    min={formData.from_date}
                                    required
                                />
                            </div>
                        </div>

                        {calculateDays() > 0 && (
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Total: {calculateDays()} day(s)
                            </div>
                        )}

                        <div className="space-y-1">
                            <Label>Reason</Label>
                            <Textarea
                                value={formData.reason}
                                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                                placeholder="Enter reason for leave..."
                                rows={3}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Leave Request?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to cancel this leave request? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, Keep It</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deleteMutation.mutate(deleteId)}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Yes, Cancel Request
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* View Leave Request Dialog */}
            <Dialog open={!!viewRequest} onOpenChange={() => setViewRequest(null)}>
                <DialogContent className="w-[400px] max-w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Leave Request Details</DialogTitle>
                        <DialogDescription>View leave request information</DialogDescription>
                    </DialogHeader>
                    {viewRequest && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">Leave Type</Label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{viewRequest.leave_type}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">Status</Label>
                                    <div className="mt-1">{getStatusBadge(viewRequest.status)}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">From Date</Label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(viewRequest.from_date)}</p>
                                </div>
                                <div>
                                    <Label className="text-xs text-gray-500 uppercase">To Date</Label>
                                    <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(viewRequest.to_date)}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500 uppercase">Total Days</Label>
                                <p className="text-sm font-medium text-gray-900 mt-1">{viewRequest.days} day(s)</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500 uppercase">Reason</Label>
                                <p className="text-sm text-gray-900 mt-1">{viewRequest.reason || '-'}</p>
                            </div>
                            <div>
                                <Label className="text-xs text-gray-500 uppercase">Applied On</Label>
                                <p className="text-sm text-gray-900 mt-1">{viewRequest.created_at}</p>
                            </div>
                            <div className="flex justify-end pt-2">
                                <Button variant="outline" onClick={() => setViewRequest(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
