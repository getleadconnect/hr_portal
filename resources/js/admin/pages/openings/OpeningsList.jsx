import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
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
import DataTableControls from '../../components/DataTableControls';
import Pagination from '../../components/Pagination';
import { Eye, Trash2, Edit, Power } from 'lucide-react';

export default function OpeningsList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [openingToDelete, setOpeningToDelete] = useState(null);

    // Filter states
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({
        from_date: '',
        to_date: '',
        category: '',
        designation: ''
    });

    const queryClient = useQueryClient();

    // Fetch job categories for filter
    const { data: jobCategories } = useQuery({
        queryKey: ['job-categories-filter'],
        queryFn: async () => {
            const response = await api.get('/admin/job-categories', {
                params: { per_page: 100 }
            });
            return response.data.data.data;
        },
    });

    // Fetch designations for filter
    const { data: designations } = useQuery({
        queryKey: ['designations-filter'],
        queryFn: async () => {
            const response = await api.get('/admin/designations', {
                params: { per_page: 100 }
            });
            return response.data.data.data;
        },
    });

    // Fetch job openings
    const { data, isLoading, error } = useQuery({
        queryKey: ['job-openings', page, search, perPage, appliedFilters],
        queryFn: async () => {
            const response = await api.get('/admin/job-openings', {
                params: {
                    page,
                    search,
                    per_page: perPage,
                    from_date: appliedFilters.from_date,
                    to_date: appliedFilters.to_date,
                    job_category_id: appliedFilters.category,
                    job_designation_id: appliedFilters.designation,
                }
            });
            return response.data.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/job-openings/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-openings']);
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/job-openings/${id}/toggle-status`),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-openings']);
        },
    });

    const handleDeleteClick = (id) => {
        setOpeningToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (openingToDelete) {
            try {
                await deleteMutation.mutateAsync(openingToDelete);
                toast.success('Job opening deleted successfully');
                setDeleteDialogOpen(false);
                setOpeningToDelete(null);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting job opening');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleStatusMutation.mutateAsync(id);
            toast.success('Job opening status updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating status');
        }
    };

    const handleApplyFilters = () => {
        setAppliedFilters({
            from_date: fromDate,
            to_date: toDate,
            category: categoryFilter,
            designation: designationFilter
        });
        setPage(1);
    };

    const handleClearFilters = () => {
        setFromDate('');
        setToDate('');
        setCategoryFilter('');
        setDesignationFilter('');
        setAppliedFilters({
            from_date: '',
            to_date: '',
            category: '',
            designation: ''
        });
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>All Job Openings</h1>
                    <p className="text-muted-foreground">Manage job openings and positions</p>
                </div>
                <Link to="/openings/create">
                    <Button>Add New Job Opening</Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="space-y-4 p-3">
                    {/* Filters */}
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ backgroundColor: '#cbced04d' }}>
                        <span className="text-sm font-medium whitespace-nowrap">Filter By:</span>

                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            placeholder="From Date"
                            className="w-[160px] bg-white"
                        />

                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            placeholder="To Date"
                            className="w-[160px] bg-white"
                        />

                        <Select
                            value={categoryFilter}
                            onValueChange={setCategoryFilter}
                        >
                            <SelectTrigger className="w-[200px] bg-white">
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

                        <Select
                            value={designationFilter}
                            onValueChange={setDesignationFilter}
                        >
                            <SelectTrigger className="w-[200px] bg-white">
                                <SelectValue placeholder="Select Position" />
                            </SelectTrigger>
                            <SelectContent>
                                {designations?.map((designation) => (
                                    <SelectItem key={designation.id} value={designation.id.toString()}>
                                        {designation.designation_name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={handleApplyFilters}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Filter
                        </Button>

                        <Button
                            onClick={handleClearFilters}
                            variant="outline"
                        >
                            Clear
                        </Button>
                    </div>

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
                        searchPlaceholder="Search job openings..."
                    />
                </CardHeader>
                <CardContent className="p-3">
                    {isLoading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">
                            Error loading job openings: {error.message}
                        </div>
                    ) : data?.data?.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No job openings found
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left font-medium text-sm">SlNo</th>
                                            <th className="p-3 text-left font-medium text-sm">Posted Date</th>
                                            <th className="p-3 text-left font-medium text-sm">Job Title</th>
                                            <th className="p-3 text-left font-medium text-sm">Job Category</th>
                                            <th className="p-3 text-left font-medium text-sm">Position</th>
                                            <th className="p-3 text-left font-medium text-sm">Job Location</th>
                                            <th className="p-3 text-left font-medium text-sm">Closing Date</th>
                                            <th className="p-3 text-left font-medium text-sm">Status</th>
                                            <th className="p-3 text-center font-medium text-sm">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.map((opening, index) => (
                                            <tr key={opening.id} className="border-b hover:bg-muted/30">
                                                <td className="p-3 text-sm">{(page - 1) * perPage + index + 1}</td>
                                                <td className="p-3 text-sm">{opening.created_at}</td>
                                                <td className="p-3 text-sm font-medium">
                                                    <Link
                                                        to={`/openings/${opening.id}`}
                                                        className="text-primary hover:underline cursor-pointer"
                                                    >
                                                        {opening.job_title}
                                                    </Link>
                                                </td>
                                                <td className="p-3 text-sm">{opening.job_category_name}</td>
                                                <td className="p-3 text-sm">{opening.designation_name}</td>
                                                <td className="p-3 text-sm">{opening.job_location}</td>
                                                <td className="p-3 text-sm">{opening.job_closing_date}</td>
                                                <td className="p-3">
                                                    <Badge variant={opening.status === 1 ? 'default' : 'secondary'}>
                                                        {opening.status === 1 ? 'Active' : 'Inactive'}
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
                                                                <Link to={`/openings/${opening.id}`} className="cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/openings/${opening.id}/edit`} className="cursor-pointer">
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleStatus(opening.id)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Power className="mr-2 h-4 w-4" />
                                                                Toggle Status
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(opening.id)}
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

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the job opening
                            and remove its data from the server.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
