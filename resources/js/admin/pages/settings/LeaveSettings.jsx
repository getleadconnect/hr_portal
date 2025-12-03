import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-toastify';
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

export default function LeaveSettings() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [editingLeaveSetting, setEditingLeaveSetting] = useState(null);
    const [leaveType, setLeaveType] = useState('');
    const [noOfDays, setNoOfDays] = useState('');
    const [error, setError] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [leaveSettingToDelete, setLeaveSettingToDelete] = useState(null);
    const queryClient = useQueryClient();

    // Fetch leave settings
    const { data, isLoading } = useQuery({
        queryKey: ['leave-settings', page, search, perPage],
        queryFn: async () => {
            const response = await api.get('/admin/leave-settings', {
                params: { page, search, per_page: perPage }
            });
            return response.data.data;
        },
    });

    // Fetch available leave types
    const { data: availableTypes } = useQuery({
        queryKey: ['available-leave-types', editingLeaveSetting],
        queryFn: async () => {
            const response = await api.get('/admin/leave-settings/available-types');
            return response.data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/leave-settings', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-settings']);
            queryClient.invalidateQueries(['available-leave-types']);
            setLeaveType('');
            setNoOfDays('');
            setEditingLeaveSetting(null);
            toast.success('Leave setting created successfully');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Error creating leave setting');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/leave-settings/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-settings']);
            queryClient.invalidateQueries(['available-leave-types']);
            setLeaveType('');
            setNoOfDays('');
            setEditingLeaveSetting(null);
            toast.success('Leave setting updated successfully');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Error updating leave setting');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/leave-settings/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['leave-settings']);
            queryClient.invalidateQueries(['available-leave-types']);
        },
    });

    const handleEdit = (leaveSetting) => {
        setEditingLeaveSetting(leaveSetting);
        setLeaveType(leaveSetting.leave_type);
        setNoOfDays(leaveSetting.no_of_days.toString());
        setError('');
    };

    const handleCancel = () => {
        setEditingLeaveSetting(null);
        setLeaveType('');
        setNoOfDays('');
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!leaveType) {
            setError('Please select a leave type');
            return;
        }

        if (!noOfDays || parseInt(noOfDays) < 0) {
            setError('Please enter a valid number of days');
            return;
        }

        const data = {
            leave_type: leaveType,
            no_of_days: parseInt(noOfDays)
        };

        if (editingLeaveSetting) {
            updateMutation.mutate({ id: editingLeaveSetting.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id) => {
        setLeaveSettingToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(leaveSettingToDelete);
            toast.success('Leave setting deleted successfully');
            setIsDeleteDialogOpen(false);
            setLeaveSettingToDelete(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting leave setting');
        }
    };

    // Get all leave types for dropdown
    const allLeaveTypes = ['Annual Leave', 'Sick Leave', 'Casual Leave'];

    // When editing, show the current type plus available types
    // When creating, show only available types
    const selectableTypes = editingLeaveSetting
        ? [editingLeaveSetting.leave_type, ...(availableTypes || [])]
        : (availableTypes || []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Leave Settings</h2>
                <p className="text-muted-foreground">Configure leave types and allocate days for employees</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Leave Type</CardTitle>
                        <CardDescription>
                            Add or edit leave types and their allocated days. Each leave type can only be added once.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="leave_type">Leave Type</Label>
                                <Select
                                    value={leaveType}
                                    onValueChange={setLeaveType}
                                    disabled={editingLeaveSetting && selectableTypes.length === 1}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select leave type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {selectableTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="no_of_days">No of Days</Label>
                                <Input
                                    id="no_of_days"
                                    type="number"
                                    min="0"
                                    value={noOfDays}
                                    onChange={(e) => setNoOfDays(e.target.value)}
                                    required
                                    placeholder="Enter number of days"
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={createMutation.isPending || updateMutation.isPending || selectableTypes.length === 0}
                                >
                                    {editingLeaveSetting ? 'Update Leave Setting' : 'Add Leave Setting'}
                                </Button>
                                {editingLeaveSetting && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                            {!editingLeaveSetting && selectableTypes.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center">
                                    All leave types have been configured
                                </p>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* Right Side - Table */}
                <Card className="lg:col-span-2">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            {/* Controls */}
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">Rows per page:</span>
                                    <Select
                                        value={perPage.toString()}
                                        onValueChange={(value) => {
                                            setPerPage(Number(value));
                                            setPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-[70px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-72">
                                    <Input
                                        placeholder="Search leave types..."
                                        value={search}
                                        onChange={(e) => {
                                            setSearch(e.target.value);
                                            setPage(1);
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Table */}
                            {isLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-md border">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b bg-muted/50">
                                                    <th className="p-3 text-left font-medium text-sm">S.No</th>
                                                    <th className="p-3 text-left font-medium text-sm">Leave Type</th>
                                                    <th className="p-3 text-left font-medium text-sm">No of Days</th>
                                                    <th className="p-3 text-left font-medium text-sm">Created By</th>
                                                    <th className="p-3 text-center font-medium text-sm">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data?.data?.length > 0 ? (
                                                    data.data.map((leaveSetting, index) => (
                                                        <tr key={leaveSetting.id} className="border-b hover:bg-muted/30">
                                                            <td className="p-3 text-sm">{(page - 1) * perPage + index + 1}</td>
                                                            <td className="p-3 text-sm font-medium">{leaveSetting.leave_type}</td>
                                                            <td className="p-3 text-sm">{leaveSetting.no_of_days}</td>
                                                            <td className="p-3">
                                                                <Badge variant="outline">
                                                                    {leaveSetting.creator?.user_name || 'System'}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                        onClick={() => handleEdit(leaveSetting)}
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleDelete(leaveSetting.id)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                            No leave settings found. Add your first leave type.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {data?.data?.length > 0 && (
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <div>
                                                Showing {data?.from || 0} to {data?.to || 0} of {data?.total || 0} entries
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                                    disabled={!data?.prev_page_url}
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    className="min-w-[40px]"
                                                >
                                                    {page}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPage(p => p + 1)}
                                                    disabled={!data?.next_page_url}
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the leave setting
                            and remove the data from the server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
