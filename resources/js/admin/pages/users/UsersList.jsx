import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import DataTableControls from '../../components/DataTableControls';
import Pagination from '../../components/Pagination';
import { Eye, Trash2, Edit, Power } from 'lucide-react';

export default function UsersList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['users', page, search, perPage],
        queryFn: async () => {
            const response = await api.get('/admin/users', {
                params: { page, search, per_page: perPage }
            });
            return response.data.data;
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

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await deleteMutation.mutateAsync(id);
                alert('User deleted successfully');
            } catch (error) {
                alert(error.response?.data?.message || 'Error deleting user');
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

    const getRoleName = (roleId) => {
        switch(roleId) {
            case 1: return 'Admin';
            case 2: return 'User';
            default: return 'Unknown';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>All Users</h1>
                    <p className="text-muted-foreground">Manage admin users</p>
                </div>
                <Link to="/users/create">
                    <Button>Add New User</Button>
                </Link>
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
                        searchPlaceholder="Search users..."
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
                                            <th className="p-3 text-left font-medium text-sm">User_Name</th>
                                            <th className="p-3 text-left font-medium text-sm">Email</th>
                                            <th className="p-3 text-left font-medium text-sm">Mobile</th>
                                            <th className="p-3 text-left font-medium text-sm">Role</th>
                                            <th className="p-3 text-left font-medium text-sm">Last_Login</th>
                                            <th className="p-3 text-left font-medium text-sm">Status</th>
                                            <th className="p-3 text-center font-medium text-sm">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.map((user, index) => (
                                            <tr key={user.id} className="border-b hover:bg-muted/30">
                                                <td className="p-3 text-sm">{(page - 1) * perPage + index + 1}</td>
                                                <td className="p-3 text-sm">{user.created_at}</td>
                                                <td className="p-3 text-sm font-medium">{user.user_name}</td>
                                                <td className="p-3 text-sm">{user.email}</td>
                                                <td className="p-3 text-sm">{user.mobile}</td>
                                                <td className="p-3 text-sm">
                                                    <Badge variant={user.role_id === 1 ? 'default' : 'outline'}>
                                                        {getRoleName(user.role_id)}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-sm">{user.last_login || 'Never'}</td>
                                                <td className="p-3">
                                                    <Badge variant={user.status === 1 ? 'default' : 'secondary'}>
                                                        {user.status === 1 ? 'Active' : 'Inactive'}
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
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/users/${user.id}`} className="cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/users/${user.id}/edit`} className="cursor-pointer">
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
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

                            {/* Pagination */}
                            <Pagination
                                currentPage={data?.current_page || 1}
                                lastPage={data?.last_page || 1}
                                total={data?.total || 0}
                                from={data?.from || 0}
                                to={data?.to || 0}
                                onPageChange={setPage}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
