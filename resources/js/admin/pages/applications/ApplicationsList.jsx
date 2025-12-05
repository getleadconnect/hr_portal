import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import DataTableControls from '../../components/DataTableControls';
import Pagination from '../../components/Pagination';
import { Eye, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = ['New', 'Short Listed', 'Appointed', 'Rejected','Not fit for this job'];

const getStatusColor = (status) => {
    switch (status) {
        case 'New':
            return 'bg-blue-100 text-blue-700 border-blue-300';
        case 'Short Listed':
            return 'bg-yellow-100 text-yellow-700 border-yellow-300';
        case 'Appointed':
            return 'bg-green-100 text-green-700 border-green-300';
        case 'Rejected':
            return 'bg-red-100 text-red-700 border-red-300';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-300';
    }
};

export default function ApplicationsList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const queryClient = useQueryClient();

    // Filter states
    const [jobCategoryId, setJobCategoryId] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({
        jobCategoryId: ''
    });

    // Status update mutation
    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => api.patch(`/admin/applications/${id}/status`, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            toast.success('Status updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    });

    const handleStatusChange = (id, newStatus) => {
        statusMutation.mutate({ id, status: newStatus });
    };

    // Fetch applications with filters
    const { data, isLoading } = useQuery({
        queryKey: ['applications', page, search, perPage, appliedFilters],
        queryFn: async () => {
            const response = await api.get('/admin/applications', {
                params: {
                    page,
                    search,
                    per_page: perPage,
                    job_category_id: appliedFilters.jobCategoryId || undefined
                }
            });
            return response.data.data;
        },
    });

    // Fetch job categories for filter dropdown
    const { data: jobCategories } = useQuery({
        queryKey: ['job-categories-all'],
        queryFn: async () => {
            const response = await api.get('/admin/job-categories', {
                params: { per_page: 1000 }
            });
            return response.data.data.data;
        },
    });

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                await api.delete(`/admin/applications/${id}`);
                // Refetch data
                window.location.reload();
            } catch (error) {
                alert('Error deleting application');
            }
        }
    };

    // Filter handlers
    const handleApplyFilters = () => {
        setAppliedFilters({
            jobCategoryId
        });
        setPage(1); // Reset to first page when applying filters
    };

    const handleClearFilters = () => {
        setJobCategoryId('');
        setAppliedFilters({
            jobCategoryId: ''
        });
        setPage(1);
    };

    return (
        <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
            <div>
                <h1 className="font-bold tracking-tight text-lg sm:text-xl">All Applications</h1>
                <p className="text-muted-foreground text-sm sm:text-base">View and manage submitted applications</p>
            </div>

            <Card>
                <CardHeader className="space-y-2 p-3">
                    {/* Filters Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3" style={{ background: '#f0f0f0', padding: '8px', borderRadius: '7px' }}>
                        <label className="text-sm font-medium whitespace-nowrap">Filter By:</label>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
                            <Select value={jobCategoryId} onValueChange={setJobCategoryId}>
                                <SelectTrigger className="w-full sm:w-[200px]">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobCategories?.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <div className="flex gap-2">
                                <Button onClick={handleApplyFilters} variant="default" size="sm" className="flex-1 sm:flex-none">
                                    Filter
                                </Button>
                                <Button onClick={handleClearFilters} variant="outline" size="sm" className="flex-1 sm:flex-none">
                                    Clear
                                </Button>
                            </div>
                        </div>
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
                        searchPlaceholder="Search applications..."
                    />
                </CardHeader>
                <CardContent className="p-2">
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : (
                        <div>
                            {/* Mobile Card View */}
                            <div className="block sm:hidden space-y-3">
                                {data?.data?.map((app, index) => (
                                    <div key={app.id} className="border rounded-lg p-3 space-y-3 bg-white shadow-sm">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {app.photo_url ? (
                                                    <img
                                                        src={app.photo_url}
                                                        alt={app.name}
                                                        className="w-12 h-12 object-cover rounded border"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                                                        <span className="text-xs text-muted-foreground">No Photo</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <Link
                                                        to={`/applications/${app.id}`}
                                                        className="text-primary hover:underline font-medium text-sm"
                                                    >
                                                        {app.name}
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">{app.created_at}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <span className="text-xl">⋮</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link to={`/applications/${app.id}`} className="cursor-pointer">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(app.id)}
                                                        className="text-destructive cursor-pointer"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-muted-foreground">Mobile:</span>
                                                <p className="font-medium">{app.mobile}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Category:</span>
                                                <p className="font-medium">{app.job_category || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground">Email:</span>
                                                <p className="font-medium break-all">{app.email}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Last Salary:</span>
                                                <p className="font-medium">{app.last_drawn_salary || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Expected:</span>
                                                <p className="font-medium">{app.expected_salary || 'N/A'}</p>
                                            </div>
                                            <div className="col-span-2">
                                                {app.cv_url ? (
                                                    <a
                                                        href={app.cv_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-primary hover:underline text-sm"
                                                    >
                                                        View CV →
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground">No CV</span>
                                                )}
                                            </div>
                                            <div className="col-span-2">
                                                <span className="text-muted-foreground">Status:</span>
                                                <Select
                                                    value={app.status || 'New'}
                                                    onValueChange={(value) => handleStatusChange(app.id, value)}
                                                >
                                                    <SelectTrigger className={`w-full mt-1 h-8 text-xs ${getStatusColor(app.status || 'New')}`}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {STATUS_OPTIONS.map((status) => (
                                                            <SelectItem key={status} value={status}>
                                                                {status}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden sm:block rounded-md border overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="px-2 py-2 text-left font-medium text-sm">SlNo</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">Dated</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">Name</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">Photo</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">Mobile</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">Email</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">Job_Category</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">Salary</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">CV_File</th>
                                            <th className="px-2 py-2 text-left font-medium text-sm">Status</th>
                                            <th className="px-2 py-2 text-center font-medium text-sm">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.map((app, index) => (
                                            <tr key={app.id} className="border-b hover:bg-muted/30">
                                                <td className="px-2 py-2 text-sm">{(page - 1) * perPage + index + 1}</td>
                                                <td className="px-2 py-2 text-sm">{app.created_at}</td>
                                                <td className="px-2 py-2 text-sm">
                                                    <Link
                                                        to={`/applications/${app.id}`}
                                                        className="text-primary hover:underline font-medium"
                                                    >
                                                        {app.name}
                                                    </Link>
                                                </td>
                                                <td className="px-2 py-2">
                                                    {app.photo_url ? (
                                                        <img
                                                            src={app.photo_url}
                                                            alt={app.name}
                                                            className="w-12 h-12 object-cover rounded border"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                                                            <span className="text-xs text-muted-foreground">No Photo</span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-2 py-2 text-sm">{app.mobile}</td>
                                                <td className="px-2 py-2 text-sm">{app.email}</td>
                                                <td className="px-2 py-2 text-sm">{app.job_category || 'N/A'}</td>
                                                <td className="px-2 py-2 text-sm">
                                                    <div className="space-y-1">
                                                        <div>Last: {app.last_drawn_salary || 'N/A'}</div>
                                                        <div>Expected: {app.expected_salary || 'N/A'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-2 py-2 text-sm">
                                                    {app.cv_url ? (
                                                        <a
                                                            href={app.cv_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline"
                                                        >
                                                            View CV
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-2 py-2">
                                                    <Select
                                                        value={app.status || 'New'}
                                                        onValueChange={(value) => handleStatusChange(app.id, value)}
                                                    >
                                                        <SelectTrigger className={`w-[130px] h-8 text-xs ${getStatusColor(app.status || 'New')}`}>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {STATUS_OPTIONS.map((status) => (
                                                                <SelectItem key={status} value={status}>
                                                                    {status}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </td>
                                                <td className="px-2 py-2">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <span className="text-xl">⋮</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/applications/${app.id}`} className="cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDelete(app.id)}
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
                            <div className="mt-4">
                                <Pagination
                                    currentPage={data?.current_page || 1}
                                    lastPage={data?.last_page || 1}
                                    total={data?.total || 0}
                                    from={data?.from || 0}
                                    to={data?.to || 0}
                                    onPageChange={setPage}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
