import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import Pagination from '../../components/Pagination';
import { List } from 'lucide-react';

export default function EmployeeCards() {
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(12);
    const [departmentId, setDepartmentId] = useState('all');
    const navigate = useNavigate();

    // Fetch employees
    const { data, isLoading } = useQuery({
        queryKey: ['employees-cards', page, search, perPage, departmentId],
        queryFn: async () => {
            const params = {
                page,
                search,
                per_page: perPage,
            };
            if (departmentId && departmentId !== 'all') {
                params.department_id = departmentId;
            }
            const response = await api.get('/admin/employees', { params });
            return response.data.data;
        },
    });

    // Fetch departments for filter
    const { data: departments } = useQuery({
        queryKey: ['departments-all'],
        queryFn: async () => {
            const response = await api.get('/admin/departments', {
                params: { per_page: 1000 }
            });
            return response.data.data.data;
        },
    });

    const getInitials = (name) => {
        if (!name) return 'NA';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const handleViewDetails = (id) => {
        navigate(`/employees/${id}`);
    };

    const handleAddEmployee = () => {
        navigate('/employees/create');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>All Employees</h1>
                    <p className="text-muted-foreground">Manage employee records</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Toggle to List View */}
                    <Link to="/employees/list">
                        <Button
                            variant="outline"
                            size="icon"
                            title="Switch to List View"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Button onClick={handleAddEmployee}>
                        Add New Employee
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search employees..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                    />
                </div>
                <Select
                    value={departmentId}
                    onValueChange={(value) => {
                        setDepartmentId(value);
                        setPage(1);
                    }}
                >
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        {departments?.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id.toString()}>
                                {dept.department_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Employee Cards Grid */}
            {isLoading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading employees...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {data?.data?.map((employee) => (
                            <Card key={employee.id} className="hover:shadow-lg transition-shadow bg-white relative">
                                {/* Status indicator - top right corner */}
                                <div
                                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium ${
                                        employee.status === 1
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {employee.status === 1 ? 'Active' : 'Resigned'}
                                </div>
                                <CardContent className="p-6 pt-8">
                                    <div className="flex flex-col items-center text-center">
                                        {/* Avatar */}
                                        <div className="relative mb-2">
                                            <Avatar className="h-14 w-14 bg-gray-100">
                                                {employee.profile_image_url ? (
                                                    <AvatarImage
                                                        src={employee.profile_image_url}
                                                        alt={employee.full_name}
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                                <AvatarFallback className="text-xl bg-gray-100 text-gray-500 font-medium">
                                                    {getInitials(employee.full_name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        {/* Employee Name */}
                                        <h3 className="font-semibold text-base text-gray-900 line-clamp-1">
                                            {employee.full_name}
                                        </h3>

                                        {/* Designation */}
                                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">
                                            {employee.job_title || 'No Designation'}
                                        </p>

                                        {/* Department Badge */}
                                        <Badge variant="secondary" className="mt-2 bg-gray-100 text-gray-600 font-normal text-sm px-2 py-0.5">
                                            {employee.department || 'No Department'}
                                        </Badge>

                                        {/* Stats Row */}
                                        <div className="flex justify-between gap-3 mt-3 pt-3 border-t border-gray-100 w-full">
                                            <div className="flex items-center">
                                                <span className="text-base font-semibold text-gray-900">
                                                    {employee.attendance_percentage ?? '--'}%
                                                </span>
                                                <span className="text-xs text-gray-400 ml-1">Attendance</span>
                                            </div>
                                            <div className="flex items-center">
                                                <span className="text-base font-semibold text-gray-900">
                                                    {employee.leave_taken ?? '--'}/{employee.total_leave ?? '15'}
                                                </span>
                                                <span className="text-xs text-gray-400 ml-1">Leave</span>
                                            </div>
                                        </div>

                                        {/* View Details Button */}
                                        <Button
                                            size="sm"
                                            className="mt-2 text-xs h-7 w-full hover:opacity-80"
                                            style={{ backgroundColor: '#d7e1f5', color: '#2c59bc' }}
                                            onClick={() => handleViewDetails(employee.id)}
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Empty State */}
                    {(!data?.data || data.data.length === 0) && (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No employees found</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {data?.data?.length > 0 && (
                        <div className="mt-6">
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
                </>
            )}
        </div>
    );
}
