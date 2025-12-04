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

export default function AllowanceSettings() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [editingAllowance, setEditingAllowance] = useState(null);
    const [allowanceType, setAllowanceType] = useState('');
    const [percentage, setPercentage] = useState('');
    const [error, setError] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [allowanceToDelete, setAllowanceToDelete] = useState(null);
    const queryClient = useQueryClient();

    // Fetch allowances
    const { data, isLoading } = useQuery({
        queryKey: ['allowances', page, search, perPage],
        queryFn: async () => {
            const response = await api.get('/admin/allowances', {
                params: { page, search, per_page: perPage }
            });
            return response.data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/allowances', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['allowances']);
            setAllowanceType('');
            setPercentage('');
            setEditingAllowance(null);
            toast.success('Allowance created successfully');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Error creating allowance');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/allowances/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['allowances']);
            setAllowanceType('');
            setPercentage('');
            setEditingAllowance(null);
            toast.success('Allowance updated successfully');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Error updating allowance');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/allowances/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['allowances']);
        },
    });

    const handleEdit = (allowance) => {
        setEditingAllowance(allowance);
        setAllowanceType(allowance.allowance_type);
        setPercentage(allowance.percentage.toString());
        setError('');
    };

    const handleCancel = () => {
        setEditingAllowance(null);
        setAllowanceType('');
        setPercentage('');
        setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        if (!allowanceType.trim()) {
            setError('Please enter an allowance type');
            return;
        }

        if (!percentage || parseFloat(percentage) < 0 || parseFloat(percentage) > 100) {
            setError('Please enter a valid percentage (0-100)');
            return;
        }

        const data = {
            allowance_type: allowanceType.trim(),
            percentage: parseFloat(percentage)
        };

        if (editingAllowance) {
            updateMutation.mutate({ id: editingAllowance.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = (id) => {
        setAllowanceToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(allowanceToDelete);
            toast.success('Allowance deleted successfully');
            setIsDeleteDialogOpen(false);
            setAllowanceToDelete(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting allowance');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Allowance Settings</h2>
                <p className="text-muted-foreground">Configure allowance types and their percentage values</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Allowance Type</CardTitle>
                        <CardDescription>
                            Add or edit allowance types and their percentage values.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="allowance_type">Allowance Type</Label>
                                <Input
                                    id="allowance_type"
                                    type="text"
                                    value={allowanceType}
                                    onChange={(e) => setAllowanceType(e.target.value)}
                                    placeholder="Enter allowance type"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="percentage">Percentage (%)</Label>
                                <Input
                                    id="percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={percentage}
                                    onChange={(e) => setPercentage(e.target.value)}
                                    required
                                    placeholder="Enter percentage"
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingAllowance ? 'Update Allowance' : 'Add Allowance'}
                                </Button>
                                {editingAllowance && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
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
                                        placeholder="Search allowance types..."
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
                                                    <th className="p-3 text-left font-medium text-sm">Allowance Type</th>
                                                    <th className="p-3 text-left font-medium text-sm">Percentage</th>
                                                    <th className="p-3 text-left font-medium text-sm">Created By</th>
                                                    <th className="p-3 text-center font-medium text-sm">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data?.data?.length > 0 ? (
                                                    data.data.map((allowance, index) => (
                                                        <tr key={allowance.id} className="border-b hover:bg-muted/30">
                                                            <td className="p-3 text-sm">{(page - 1) * perPage + index + 1}</td>
                                                            <td className="p-3 text-sm font-medium">{allowance.allowance_type}</td>
                                                            <td className="p-3 text-sm">{allowance.percentage}%</td>
                                                            <td className="p-3">
                                                                <Badge variant="outline">
                                                                    {allowance.creator?.user_name || 'System'}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-3">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                        onClick={() => handleEdit(allowance)}
                                                                    >
                                                                        <Edit2 className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        onClick={() => handleDelete(allowance.id)}
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
                                                            No allowances found. Add your first allowance type.
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
                            This action cannot be undone. This will permanently delete the allowance
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
