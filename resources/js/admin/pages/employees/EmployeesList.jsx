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

export default function EmployeesList() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // Filter states
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [designationId, setDesignationId] = useState('');
    const [appliedFilters, setAppliedFilters] = useState({
        startDate: '',
        endDate: '',
        departmentId: '',
        designationId: ''
    });

    const queryClient = useQueryClient();

    // Fetch employees with filters
    const { data, isLoading } = useQuery({
        queryKey: ['employees', page, search, perPage, appliedFilters],
        queryFn: async () => {
            const response = await api.get('/admin/employees', {
                params: {
                    page,
                    search,
                    per_page: perPage,
                    start_date: appliedFilters.startDate || undefined,
                    end_date: appliedFilters.endDate || undefined,
                    department_id: appliedFilters.departmentId || undefined,
                    designation_id: appliedFilters.designationId || undefined
                }
            });
            return response.data.data;
        },
    });

    // Fetch departments for filter dropdown
    const { data: departments } = useQuery({
        queryKey: ['departments-all'],
        queryFn: async () => {
            const response = await api.get('/admin/departments', {
                params: { per_page: 1000 }
            });
            return response.data.data.data;
        },
    });

    // Fetch designations for filter dropdown
    const { data: designations } = useQuery({
        queryKey: ['designations-all'],
        queryFn: async () => {
            const response = await api.get('/admin/designations', {
                params: { per_page: 1000 }
            });
            return response.data.data.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => api.delete(`/admin/employees/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
        },
    });

    const toggleStatusMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/employees/${id}/toggle-status`),
        onSuccess: () => {
            queryClient.invalidateQueries(['employees']);
        },
    });

    const handleDeleteClick = (id) => {
        setEmployeeToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (employeeToDelete) {
            try {
                await deleteMutation.mutateAsync(employeeToDelete);
                toast.success('Employee deleted successfully');
                setDeleteDialogOpen(false);
                setEmployeeToDelete(null);
            } catch (error) {
                toast.error(error.response?.data?.message || 'Error deleting employee');
            }
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await toggleStatusMutation.mutateAsync(id);
            toast.success('Employee status updated successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating status');
        }
    };

    // Filter handlers
    const handleApplyFilters = () => {
        setAppliedFilters({
            startDate,
            endDate,
            departmentId,
            designationId
        });
        setPage(1); // Reset to first page when applying filters
    };

    const handleClearFilters = () => {
        setStartDate('');
        setEndDate('');
        setDepartmentId('');
        setDesignationId('');
        setAppliedFilters({
            startDate: '',
            endDate: '',
            departmentId: '',
            designationId: ''
        });
        setPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>All Employees</h1>
                    <p className="text-muted-foreground">Manage employee records</p>
                </div>
                <Link to="/employees/create">
                    <Button>Add New Employee</Button>
                </Link>
            </div>

            <Card>
                <CardHeader className="space-y-4 p-3">
                    {/* Filters Row */}
                    <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '7px' }}>
                        {/* Label Row */}
                        <div className="mb-3">
                            <label className="text-sm font-medium">Filter By:</label>
                        </div>

                        {/* Controls Row */}
                        <div className="flex flex-wrap items-end gap-3">
                            <label className="text-sm text-gray-600 mb-2 block">Date :</label>
                            <div>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    style={{ width: '150px' }}
                                />
                            </div>
                            <div>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    style={{ width: '150px' }}
                                />
                            </div>
                            <div>
                                <Select value={departmentId} onValueChange={setDepartmentId}>
                                    <SelectTrigger style={{ width: '190px' }}>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments?.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                                {dept.department_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select value={designationId} onValueChange={setDesignationId}>
                                    <SelectTrigger style={{ width: '190px' }}>
                                        <SelectValue placeholder="Select Designation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {designations?.map((desig) => (
                                            <SelectItem key={desig.id} value={desig.id.toString()}>
                                                {desig.designation_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleApplyFilters} variant="default" size="sm">
                                    Filter
                                </Button>
                                <Button onClick={handleClearFilters} variant="outline" size="sm">
                                    Clear
                                </Button>
                            </div>
                        </div>
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
                                            <th className="p-3 text-left font-medium text-sm">SlNo</th>
                                            <th className="p-3 text-left font-medium text-sm">Dated</th>
                                            <th className="p-3 text-left font-medium text-sm">Photo</th>
                                            <th className="p-3 text-left font-medium text-sm">Employee_ID</th>
                                            <th className="p-3 text-left font-medium text-sm">Name</th>
                                            <th className="p-3 text-left font-medium text-sm">Mobile</th>
                                            <th className="p-3 text-left font-medium text-sm">Email</th>
                                            <th className="p-3 text-left font-medium text-sm">Job_Title</th>
                                            <th className="p-3 text-left font-medium text-sm">Department</th>
                                            <th className="p-3 text-left font-medium text-sm">Status</th>
                                            <th className="p-3 text-center font-medium text-sm">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data?.data?.map((employee, index) => (
                                            <tr key={employee.id} className="border-b hover:bg-muted/30">
                                                <td className="p-3 text-sm">{(page - 1) * perPage + index + 1}</td>
                                                <td className="p-3 text-sm">{employee.created_at}</td>
                                                <td className="p-3">
                                                    {employee.profile_image_url ? (
                                                        <img
                                                            src={employee.profile_image_url}
                                                            alt={employee.full_name}
                                                            className="w-12 h-12 object-cover rounded-full border"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 bg-muted rounded-full border flex items-center justify-center">
                                                            <span className="text-xs text-muted-foreground font-medium">
                                                                {employee.full_name?.charAt(0) || 'N'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-sm font-medium">{employee.employee_id}</td>
                                                <td className="p-3 text-sm">
                                                    <Link
                                                        to={`/employees/${employee.id}`}
                                                        className="text-primary hover:underline font-medium"
                                                    >
                                                        {employee.full_name}
                                                    </Link>
                                                </td>
                                                <td className="p-3 text-sm">{employee.mobile_number}</td>
                                                <td className="p-3 text-sm">{employee.email || 'N/A'}</td>
                                                <td className="p-3 text-sm">{employee.job_title || 'N/A'}</td>
                                                <td className="p-3 text-sm">{employee.department || 'N/A'}</td>
                                                <td className="p-3">
                                                    <Badge variant={employee.status === 1 ? 'default' : 'secondary'}>
                                                        {employee.status === 1 ? 'Active' : 'Inactive'}
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
                                                                <Link to={`/employees/${employee.id}`} className="cursor-pointer">
                                                                    <Eye className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem asChild>
                                                                <Link to={`/employees/${employee.id}/edit`} className="cursor-pointer">
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleStatus(employee.id)}
                                                                className="cursor-pointer"
                                                            >
                                                                <Power className="mr-2 h-4 w-4" />
                                                                Toggle Status
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => handleDeleteClick(employee.id)}
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
                            This action cannot be undone. This will permanently delete the employee
                            and remove their data from the server.
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
