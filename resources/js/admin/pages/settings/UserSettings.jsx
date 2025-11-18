import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import DataTableControls from '../../components/DataTableControls';
import { Trash2, Edit, Power, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserSettings() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [viewingUser, setViewingUser] = useState(null);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [errors, setErrors] = useState({});
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState({
        user_name: '',
        email: '',
        countrycode: '+91',
        mobile: '',
        password: '',
        role_id: '2',
    });

    const { data, isLoading } = useQuery({
        queryKey: ['users', page, search, perPage],
        queryFn: async () => {
            const response = await api.get('/admin/users', {
                params: { page, search, per_page: perPage }
            });
            return response.data.data;
        },
    });

    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/users', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsDialogOpen(false);
            resetForm();
            toast.success('User created successfully');
        },
        onError: (error) => {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                toast.error(error.response?.data?.message || 'Error creating user');
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/users/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
            setIsDialogOpen(false);
            resetForm();
            toast.success('User updated successfully');
        },
        onError: (error) => {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors || {});
            } else {
                toast.error(error.response?.data?.message || 'Error updating user');
            }
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/users/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/users/${id}/toggle-status`),
        onSuccess: () => {
            queryClient.invalidateQueries(['users']);
        },
    });

    const resetForm = () => {
        setFormData({
            user_name: '',
            email: '',
            countrycode: '+91',
            mobile: '',
            password: '',
            role_id: '2',
        });
        setEditingUser(null);
        setErrors({});
    };

    const handleOpenDialog = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                user_name: user.user_name || '',
                email: user.email || '',
                countrycode: user.countrycode || '+91',
                mobile: user.mobile || '',
                password: '',
                role_id: user.role_id?.toString() || '2',
            });
        } else {
            resetForm();
        }
        setIsDialogOpen(true);
    };

    const handleViewUser = async (userId) => {
        try {
            const response = await api.get(`/admin/users/${userId}`);
            setViewingUser(response.data.data);
            setIsViewDialogOpen(true);
        } catch (error) {
            toast.error('Error loading user details');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const submitData = { ...formData };

        if (editingUser && !submitData.password) {
            delete submitData.password;
        }

        if (editingUser) {
            updateMutation.mutate({ id: editingUser.id, data: submitData });
        } else {
            createMutation.mutate(submitData);
        }
    };

    const handleDelete = (id) => {
        setUserToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteMutation.mutateAsync(userToDelete);
            toast.success('User deleted successfully');
            setIsDeleteDialogOpen(false);
            setUserToDelete(null);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error deleting user');
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleStatusMutation.mutateAsync(id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating status');
        }
    };

    const getRoleName = (roleId) => {
        switch(roleId) {
            case 1: return 'Admin';
            case 2: return 'User';
            default: return 'Unknown';
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-4 p-4 sm:p-6">
                    <div>
                        <CardTitle className="text-base sm:text-lg">User Settings</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Manage system users, their roles and permissions</CardDescription>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">+ Add User</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                                <DialogDescription>
                                    {editingUser ? 'Update user information' : 'Fill in the user details'}
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="user_name">User Name *</Label>
                                        <Input
                                            id="user_name"
                                            value={formData.user_name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                                            required
                                            maxLength={25}
                                        />
                                        {errors.user_name && <p className="text-sm text-destructive">{errors.user_name[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            required
                                        />
                                        {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="countrycode">Country Code</Label>
                                        <Input
                                            id="countrycode"
                                            value={formData.countrycode}
                                            onChange={(e) => setFormData(prev => ({ ...prev, countrycode: e.target.value }))}
                                            placeholder="+91"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="mobile">Mobile Number *</Label>
                                        <Input
                                            id="mobile"
                                            value={formData.mobile}
                                            onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                                            required
                                        />
                                        {errors.mobile && <p className="text-sm text-destructive">{errors.mobile[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">
                                            Password {editingUser ? '(leave blank to keep current)' : '*'}
                                        </Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            required={!editingUser}
                                            minLength={6}
                                        />
                                        {errors.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="role_id">Role *</Label>
                                        <Select
                                            value={formData.role_id}
                                            onValueChange={(value) => setFormData(prev => ({ ...prev, role_id: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Admin</SelectItem>
                                                <SelectItem value="2">User</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={createMutation.isPending || updateMutation.isPending}
                                    >
                                        {editingUser ? 'Update' : 'Create'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>

                <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
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
                            searchPlaceholder="Search users..."
                        />

                        {isLoading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : (() => {
                            const filteredUsers = data?.data?.filter(user => user.role_id !== 1) || [];
                            const filteredTotal = data?.total ? data.total - (data?.data?.length - filteredUsers.length) : 0;

                            return (
                            <div className="space-y-4">
                                {/* Desktop Table View */}
                                <div className="hidden md:block rounded-md border overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b bg-muted/50">
                                                <th className="p-3 text-left font-medium text-sm">Name</th>
                                                <th className="p-3 text-left font-medium text-sm">Email</th>
                                                <th className="p-3 text-left font-medium text-sm">Mobile</th>
                                                <th className="p-3 text-left font-medium text-sm">Role</th>
                                                <th className="p-3 text-left font-medium text-sm">Status</th>
                                                <th className="p-3 text-left font-medium text-sm">Created At</th>
                                                <th className="p-3 text-center font-medium text-sm">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="border-b hover:bg-muted/30">
                                                    <td className="p-3 text-sm font-medium">{user.user_name}</td>
                                                    <td className="p-3 text-sm">{user.email}</td>
                                                    <td className="p-3 text-sm">{user.mobile}</td>
                                                    <td className="p-3 text-sm">
                                                        <Badge variant={user.role_id === 1 ? 'default' : 'outline'}>
                                                            {getRoleName(user.role_id)}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant={user.status === 1 ? 'default' : 'secondary'}>
                                                            {user.status === 1 ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3 text-sm">{user.created_at}</td>
                                                    <td className="p-3">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                    <span className="text-xl">⋮</span>
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => handleViewUser(user.id)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleOpenDialog(user)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleToggleStatus(user.id)}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Power className="mr-2 h-4 w-4" />
                                                                    Toggle Status
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(user.id)}
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

                                {/* Mobile Card View */}
                                <div className="md:hidden space-y-3">
                                    {filteredUsers.map((user) => (
                                        <div key={user.id} className="border rounded-lg p-3 space-y-2 bg-card">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1 flex-1">
                                                    <div className="font-medium text-sm">{user.user_name}</div>
                                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    <div className="text-xs text-muted-foreground">{user.mobile}</div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <span className="text-xl">⋮</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => handleViewUser(user.id)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleOpenDialog(user)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleStatus(user.id)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Power className="mr-2 h-4 w-4" />
                                                            Toggle Status
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleDelete(user.id)}
                                                            className="text-destructive cursor-pointer"
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                <Badge variant={user.role_id === 1 ? 'default' : 'outline'} className="text-xs">
                                                    {getRoleName(user.role_id)}
                                                </Badge>
                                                <Badge variant={user.status === 1 ? 'default' : 'secondary'} className="text-xs">
                                                    {user.status === 1 ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                Created: {user.created_at}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
                                    <div>
                                        Showing {data?.from || 0} to {Math.min(data?.to || 0, (data?.from || 0) + filteredUsers.length - 1)} of {filteredTotal} entries
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
                                        <span className="flex items-center px-3">{page}</span>
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
                            );
                        })()}
                    </div>
                </CardContent>
            </Card>

            {/* View User Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>User Details</DialogTitle>
                        <DialogDescription>{viewingUser?.user_name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <span className="font-medium">User Name:</span>
                            <span>{viewingUser?.user_name}</span>

                            <span className="font-medium">Email:</span>
                            <span>{viewingUser?.email}</span>

                            <span className="font-medium">Mobile:</span>
                            <span>{viewingUser?.countrycode} {viewingUser?.mobile}</span>

                            <span className="font-medium">Role:</span>
                            <span>
                                <Badge variant={viewingUser?.role_id === 1 ? 'default' : 'outline'}>
                                    {getRoleName(viewingUser?.role_id)}
                                </Badge>
                            </span>

                            <span className="font-medium">Status:</span>
                            <span>
                                <Badge variant={viewingUser?.status === 1 ? 'default' : 'secondary'}>
                                    {viewingUser?.status === 1 ? 'Active' : 'Inactive'}
                                </Badge>
                            </span>

                            <span className="font-medium">Last Login:</span>
                            <span>{viewingUser?.last_login || 'Never'}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            and remove their data from the server.
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
