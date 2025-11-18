import { useState, useEffect } from 'react';
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

export default function JobCategorySettings() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState('');
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);
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
            setCategoryName('');
            setEditingCategory(null);
            toast.success('Job category created successfully');
        },
        onError: (error) => {
            setError(error.response?.data?.message || 'Error creating category');
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/job-categories/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-categories']);
            setCategoryName('');
            setEditingCategory(null);
            toast.success('Job category updated successfully');
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

    const handleEdit = (category) => {
        setEditingCategory(category);
        setCategoryName(category.category_name);
        setError('');
    };

    const handleCancel = () => {
        setEditingCategory(null);
        setCategoryName('');
        setError('');
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

    const handleDelete = (id) => {
        setCategoryToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(categoryToDelete);
            toast.success('Job category deleted successfully');
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting category');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Job Category Management</h2>
                <p className="text-muted-foreground">Manage job categories for applications and employees</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Job Category</CardTitle>
                        <CardDescription>
                            Manage job categories in your system. Create, edit, or delete categories for organizing applications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="category_name">Category Name</Label>
                                <Input
                                    id="category_name"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                    placeholder="Enter category name"
                                />
                                {error && <p className="text-sm text-destructive">{error}</p>}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={createMutation.isPending || updateMutation.isPending}
                                >
                                    {editingCategory ? 'Update Category' : 'Add Category'}
                                </Button>
                                {editingCategory && (
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
                                        placeholder="Search categories..."
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
                                                    <th className="p-3 text-left font-medium text-sm">Category Name</th>
                                                    <th className="p-3 text-left font-medium text-sm">Status</th>
                                                    <th className="p-3 text-center font-medium text-sm">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data?.data?.map((category, index) => (
                                                    <tr key={category.id} className="border-b hover:bg-muted/30">
                                                        <td className="p-3 text-sm">{(page - 1) * perPage + index + 1}</td>
                                                        <td className="p-3 text-sm font-medium">{category.category_name}</td>
                                                        <td className="p-3">
                                                            <Badge variant={category.status === 1 ? 'default' : 'secondary'}>
                                                                {category.status === 1 ? 'Active' : 'Inactive'}
                                                            </Badge>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    onClick={() => handleEdit(category)}
                                                                >
                                                                    <Edit2 className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                    onClick={() => handleDelete(category.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
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
                            This action cannot be undone. This will permanently delete the job category
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
