import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../../components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import DataTableControls from '../../components/DataTableControls';
import { Trash2, Edit, Power } from 'lucide-react';

export default function JobCategoriesList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['job-categories', page, search, perPage],
        queryFn: async () => {
            const response = await api.get('/admin/job-categories', {
                params: { page, search, per_page: perPage }
            });
            return response.data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/job-categories', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-categories']);
            setIsDialogOpen(false);
            setCategoryName('');
            setEditingCategory(null);
            alert('Job category created successfully');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Error creating category');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/job-categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-categories']);
            setIsDialogOpen(false);
            setCategoryName('');
            setEditingCategory(null);
            alert('Job category updated successfully');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Error updating category');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/job-categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-categories']);
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/job-categories/${id}/toggle-status`),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-categories']);
        },
    });

    const handleOpenDialog = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setCategoryName(category.category_name);
        } else {
            setEditingCategory(null);
            setCategoryName('');
        }
        setError('');
        setIsDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        const data = { category_name: categoryName };

        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this job category?')) {
            try {
                await deleteMutation.mutateAsync(id);
                alert('Job category deleted successfully');
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting category');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleStatusMutation.mutateAsync(id);
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>All Job Categories</h1>
                    <p className="text-muted-foreground">Manage job categories</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()}>Add New Category</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Edit Job Category' : 'Add New Job Category'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory
                                    ? 'Update the job category name.'
                                    : 'Enter the name for the new job category.'}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category_name">Category Name *</Label>
                                <Input
                                    id="category_name"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                    placeholder="Enter category name"
                                />
                                {error && <p className="text-sm text-destructive">{error}</p>}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingCategory ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
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
                        searchPlaceholder="Search job categories..."
                    />
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium text-sm">SlNo</th>
                                            <th className="p-3 text-left font-medium text-sm">Dated</th>
                                            <th className="p-3 text-left font-medium text-sm">Category_Name</th>
                                            <th className="p-3 text-left font-medium text-sm">Status</th>
                                            <th className="p-3 text-center font-medium text-sm">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.map((category, index) => (
                                            <tr key={category.id} className="border-b hover:bg-muted/30">
                                                <td className="p-3 text-sm">{(page - 1) * perPage + index + 1}</td>
                                                <td className="p-3 text-sm">{category.created_at}</td>
                                                <td className="p-3 text-sm font-medium">{category.category_name}</td>
                                                <td className="p-3">
                                                    <Badge variant={category.status === 1 ? 'default' : 'secondary'}>
                                                        {category.status === 1 ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <span className="text-xl">⋮</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleOpenDialog(category)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleStatus(category.id)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Power className="mr-2 h-4 w-4" />
                                                                Toggle Status
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(category.id)}
                                                                className="text-destructive cursor-pointer"
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">
                                    Showing {data?.from || 0} to {data?.to || 0} of {data?.total || 0} results
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
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={!data?.next_page_url}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
