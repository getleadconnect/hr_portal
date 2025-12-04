import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '../../components/ui/dialog';
import {
    DollarSign,
    CheckCircle,
    Clock,
    Calendar,
    Download,
    Eye,
    Edit
} from 'lucide-react';

export default function PayrollList() {
    const queryClient = useQueryClient();
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });
    const [search, setSearch] = useState('');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    const [baseSalaryInput, setBaseSalaryInput] = useState('');
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewPayroll, setViewPayroll] = useState(null);

    // Set Base Salary Modal state
    const [setSalaryModalOpen, setSetSalaryModalOpen] = useState(false);
    const [salaryForm, setSalaryForm] = useState({
        employee_id: '',
        base_salary: '',
        hra_percentage: '',
        ta_percentage: '',
        effective_from: new Date().toISOString().split('T')[0],
        notes: ''
    });

    // Fetch months for dropdown
    const { data: monthsData } = useQuery({
        queryKey: ['payroll-months'],
        queryFn: async () => {
            const response = await api.get('/admin/payrolls/months');
            return response.data.data;
        },
    });

    // Fetch employees for dropdown
    const { data: employeesData } = useQuery({
        queryKey: ['payroll-employees'],
        queryFn: async () => {
            const response = await api.get('/admin/payrolls/employees');
            return response.data.data;
        },
    });

    // Fetch payroll data
    const { data, isLoading } = useQuery({
        queryKey: ['payrolls', selectedMonth, search],
        queryFn: async () => {
            const response = await api.get('/admin/payrolls', {
                params: { month: selectedMonth, search }
            });
            return response.data.data;
        },
    });

    // Process payroll mutation
    const processPayrollMutation = useMutation({
        mutationFn: () => api.post('/admin/payrolls/process', { month: selectedMonth }),
        onSuccess: (response) => {
            queryClient.invalidateQueries(['payrolls']);
            toast.success(response.data.message);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error processing payroll');
        }
    });

    // Update payroll mutation
    const updatePayrollMutation = useMutation({
        mutationFn: ({ id, data }) => api.put(`/admin/payrolls/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['payrolls']);
            toast.success('Payroll updated successfully');
            setEditModalOpen(false);
            setSelectedPayroll(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error updating payroll');
        }
    });

    // Approve payroll mutation
    const approvePayrollMutation = useMutation({
        mutationFn: (id) => api.patch(`/admin/payrolls/${id}/approve`),
        onSuccess: () => {
            queryClient.invalidateQueries(['payrolls']);
            toast.success('Payroll approved successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error approving payroll');
        }
    });

    // Store salary mutation
    const storeSalaryMutation = useMutation({
        mutationFn: (data) => api.post('/admin/payrolls/salary', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['payrolls']);
            toast.success('Base salary saved successfully');
            setSetSalaryModalOpen(false);
            setSalaryForm({
                employee_id: '',
                base_salary: '',
                hra_percentage: '',
                ta_percentage: '',
                effective_from: new Date().toISOString().split('T')[0],
                notes: ''
            });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error saving salary');
        }
    });

    const formatCurrency = (amount) => {
        return '$' + parseFloat(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pending: { label: 'PENDING', className: 'bg-orange-100 text-orange-700 border-orange-200' },
            approved: { label: 'APPROVED', className: 'bg-green-100 text-green-700 border-green-200' },
            paid: { label: 'PAID', className: 'bg-blue-100 text-blue-700 border-blue-200' },
        };
        const config = statusConfig[status] || { label: status?.toUpperCase(), className: 'bg-gray-100 text-gray-700' };
        return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
    };

    const handleEditClick = (payroll) => {
        setSelectedPayroll(payroll);
        setBaseSalaryInput(payroll.base_salary.toString());
        setEditModalOpen(true);
    };

    const handleSaveBaseSalary = () => {
        if (!selectedPayroll) return;
        updatePayrollMutation.mutate({
            id: selectedPayroll.id,
            data: { base_salary: parseFloat(baseSalaryInput) }
        });
    };

    const handleViewClick = (payroll) => {
        setViewPayroll(payroll);
        setViewModalOpen(true);
    };

    const handleSetSalarySubmit = (e) => {
        e.preventDefault();
        if (!salaryForm.employee_id || !salaryForm.base_salary || !salaryForm.effective_from) {
            toast.error('Please fill in all required fields');
            return;
        }
        storeSalaryMutation.mutate(salaryForm);
    };

    const getMonthLabel = (monthValue) => {
        if (!monthValue) return '';
        const [year, month] = monthValue.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    const stats = [
        {
            title: 'Total Payroll',
            value: formatCurrency(data?.summary?.total_payroll || 0),
            icon: DollarSign,
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            borderColor: 'border-l-blue-500',
        },
        {
            title: 'Employees Processed',
            value: data?.summary?.employees_processed || 0,
            icon: CheckCircle,
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            borderColor: 'border-l-green-500',
        },
        {
            title: 'Pending Approval',
            value: data?.summary?.pending_approval || 0,
            icon: Clock,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            borderColor: 'border-l-orange-500',
        },
        {
            title: 'Avg Attendance',
            value: `${data?.summary?.avg_attendance || 0}%`,
            icon: Calendar,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            borderColor: 'border-l-red-500',
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
                <div className="flex flex-wrap items-center gap-3">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                            {monthsData?.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        className="bg-gray-900 hover:bg-gray-800 text-white"
                        onClick={() => processPayrollMutation.mutate()}
                        disabled={processPayrollMutation.isPending}
                    >
                        {processPayrollMutation.isPending ? 'Processing...' : 'Process Payroll'}
                    </Button>
                    <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export Payslips
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={index} className={`border-l-4 ${stat.borderColor}`}>
                            <CardContent className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className={`${stat.iconBg} rounded-lg p-3`}>
                                        <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Payroll Table */}
            <Card>
                <CardHeader className="p-4 border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h2 className="text-lg font-semibold">
                            Employee Payroll - {getMonthLabel(selectedMonth)}
                        </h2>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSetSalaryModalOpen(true)}
                        >
                            Set Base Salary
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Employee</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Base Salary</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Working Days</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Present</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Absent</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Leave</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Per Day Salary</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Deduction</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Net Salary</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data?.payrolls?.length > 0 ? (
                                    data.payrolls.map((payroll) => (
                                        <tr key={payroll.id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        {payroll.profile_image_url ? (
                                                            <AvatarImage src={payroll.profile_image_url} alt={payroll.employee_name} />
                                                        ) : null}
                                                        <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                                                            {payroll.employee_initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium text-sm">{payroll.employee_name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm">{formatCurrency(payroll.base_salary)}</td>
                                            <td className="py-3 px-4 text-sm">{payroll.working_days}</td>
                                            <td className="py-3 px-4 text-sm">{payroll.present_days}</td>
                                            <td className="py-3 px-4 text-sm">{payroll.absent_days}</td>
                                            <td className="py-3 px-4 text-sm">{payroll.leave_days}</td>
                                            <td className="py-3 px-4 text-sm">{formatCurrency(payroll.per_day_salary)}</td>
                                            <td className="py-3 px-4 text-sm text-red-600">
                                                {payroll.deduction > 0 ? `-${formatCurrency(payroll.deduction)}` : '$0.00'}
                                            </td>
                                            <td className="py-3 px-4 text-sm font-semibold">{formatCurrency(payroll.net_salary)}</td>
                                            <td className="py-3 px-4">{getStatusBadge(payroll.status)}</td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={() => handleViewClick(payroll)}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-7 px-2 text-xs"
                                                        onClick={() => handleEditClick(payroll)}
                                                    >
                                                        Edit
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="text-center py-8 text-gray-500">
                                            No payroll records found for this month. Click "Process Payroll" to generate.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Set Employee Base Salary Modal */}
            <Dialog open={setSalaryModalOpen} onOpenChange={setSetSalaryModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Set Employee Base Salary</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSetSalarySubmit}>
                        <div className="grid gap-4 py-4">
                            {/* Employee Select */}
                            <div className="space-y-2">
                                <Label htmlFor="employee_id">Employee *</Label>
                                <Select
                                    value={salaryForm.employee_id}
                                    onValueChange={(value) => setSalaryForm({ ...salaryForm, employee_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choose employee..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employeesData?.map((emp) => (
                                            <SelectItem key={emp.id} value={emp.id.toString()}>
                                                {emp.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Base Salary and Effective From */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="base_salary">Base Salary (Monthly) *</Label>
                                    <Input
                                        id="base_salary"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={salaryForm.base_salary}
                                        onChange={(e) => setSalaryForm({ ...salaryForm, base_salary: e.target.value })}
                                        placeholder="6000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="effective_from">Effective From *</Label>
                                    <Input
                                        id="effective_from"
                                        type="date"
                                        value={salaryForm.effective_from}
                                        onChange={(e) => setSalaryForm({ ...salaryForm, effective_from: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* HRA and TA Percentage */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hra_percentage">HRA (%)</Label>
                                    <Input
                                        id="hra_percentage"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={salaryForm.hra_percentage}
                                        onChange={(e) => setSalaryForm({ ...salaryForm, hra_percentage: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ta_percentage">TA (%)</Label>
                                    <Input
                                        id="ta_percentage"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="100"
                                        value={salaryForm.ta_percentage}
                                        onChange={(e) => setSalaryForm({ ...salaryForm, ta_percentage: e.target.value })}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={salaryForm.notes}
                                    onChange={(e) => setSalaryForm({ ...salaryForm, notes: e.target.value })}
                                    placeholder="Add notes (optional)"
                                    rows={3}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSetSalaryModalOpen(false);
                                    setSalaryForm({
                                        employee_id: '',
                                        base_salary: '',
                                        hra_percentage: '',
                                        ta_percentage: '',
                                        effective_from: new Date().toISOString().split('T')[0],
                                        notes: ''
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gray-900 hover:bg-gray-800"
                                disabled={storeSalaryMutation.isPending}
                            >
                                {storeSalaryMutation.isPending ? 'Saving...' : 'Save Salary'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Base Salary Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Base Salary</DialogTitle>
                        <DialogDescription>
                            Update the base salary for {selectedPayroll?.employee_name}. This will recalculate deductions and net salary.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="base_salary">Base Salary</Label>
                            <Input
                                id="base_salary"
                                type="number"
                                step="0.01"
                                min="0"
                                value={baseSalaryInput}
                                onChange={(e) => setBaseSalaryInput(e.target.value)}
                                placeholder="Enter base salary"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveBaseSalary} disabled={updatePayrollMutation.isPending}>
                            {updatePayrollMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Payroll Details Modal */}
            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Payroll Details</DialogTitle>
                        <DialogDescription>
                            {viewPayroll?.employee_name} - {getMonthLabel(viewPayroll?.month)}
                        </DialogDescription>
                    </DialogHeader>
                    {viewPayroll && (
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Base Salary</p>
                                    <p className="font-semibold">{formatCurrency(viewPayroll.base_salary)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Working Days</p>
                                    <p className="font-semibold">{viewPayroll.working_days}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Present Days</p>
                                    <p className="font-semibold text-green-600">{viewPayroll.present_days}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Absent Days</p>
                                    <p className="font-semibold text-red-600">{viewPayroll.absent_days}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Leave Days</p>
                                    <p className="font-semibold">{viewPayroll.leave_days}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Per Day Salary</p>
                                    <p className="font-semibold">{formatCurrency(viewPayroll.per_day_salary)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Deduction</p>
                                    <p className="font-semibold text-red-600">-{formatCurrency(viewPayroll.deduction)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Net Salary</p>
                                    <p className="font-semibold text-green-600">{formatCurrency(viewPayroll.net_salary)}</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <p className="text-sm text-gray-500">Status</p>
                                {getStatusBadge(viewPayroll.status)}
                            </div>
                            {viewPayroll.status === 'pending' && (
                                <div className="pt-4">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        onClick={() => {
                                            approvePayrollMutation.mutate(viewPayroll.id);
                                            setViewModalOpen(false);
                                        }}
                                    >
                                        Approve Payroll
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
