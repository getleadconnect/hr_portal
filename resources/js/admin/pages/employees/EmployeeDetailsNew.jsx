import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
    User,
    Calendar,
    Mail,
    Edit,
    FileText,
    CheckCircle,
    Clock,
    DollarSign,
    CalendarDays,
    ExternalLink,
    Check,
    X,
    Download,
    ArrowLeft,
    Trash2,
    Upload
} from 'lucide-react';

export default function EmployeeDetailsNew() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('overview');
    const [attendanceMonth, setAttendanceMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    });

    // Salary edit modal state
    const [salaryModalOpen, setSalaryModalOpen] = useState(false);
    const [salaryForm, setSalaryForm] = useState({
        salary: '',
        hra: '',
        ta: ''
    });

    // Bank details edit modal state
    const [bankModalOpen, setBankModalOpen] = useState(false);
    const [bankForm, setBankForm] = useState({
        bank_name: '',
        account_number: '',
        ifsc_code: ''
    });

    // Document upload state
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [documentName, setDocumentName] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [deleteDocumentId, setDeleteDocumentId] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Fetch employee details
    const { data, isLoading } = useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            const response = await api.get(`/admin/employees/${id}`);
            return response.data.data;
        },
    });

    // Fetch attendance history
    const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
        queryKey: ['employee-attendance', id, attendanceMonth],
        queryFn: async () => {
            const response = await api.get(`/admin/employees/${id}/attendance`, {
                params: { month: attendanceMonth }
            });
            return response.data.data;
        },
        enabled: activeTab === 'attendance',
    });

    // Fetch leave history
    const { data: leaveData, isLoading: leaveLoading } = useQuery({
        queryKey: ['employee-leaves', id],
        queryFn: async () => {
            const response = await api.get(`/admin/employees/${id}/leaves`);
            return response.data.data;
        },
        enabled: activeTab === 'leave',
    });

    // Fetch employee documents
    const { data: documentsData, isLoading: documentsLoading } = useQuery({
        queryKey: ['employee-documents', id],
        queryFn: async () => {
            const response = await api.get(`/admin/employees/${id}/documents`);
            return response.data.data;
        },
        enabled: activeTab === 'documents',
    });

    // Upload document mutation
    const uploadDocumentMutation = useMutation({
        mutationFn: async (formData) => {
            return api.post(`/admin/employees/${id}/documents`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employee-documents', id]);
            toast.success('Document uploaded successfully');
            setUploadModalOpen(false);
            setDocumentName('');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error uploading document');
        }
    });

    // Delete document mutation
    const deleteDocumentMutation = useMutation({
        mutationFn: async (documentId) => {
            return api.delete(`/admin/employees/${id}/documents/${documentId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employee-documents', id]);
            toast.success('Document deleted successfully');
            setDeleteDialogOpen(false);
            setDeleteDocumentId(null);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error deleting document');
        }
    });

    // Handle document upload
    const handleUploadDocument = (e) => {
        e.preventDefault();
        if (!documentName.trim() || !selectedFile) {
            toast.error('Please enter document name and select a file');
            return;
        }
        const formData = new FormData();
        formData.append('document_name', documentName);
        formData.append('file', selectedFile);
        uploadDocumentMutation.mutate(formData);
    };

    // Handle delete document
    const handleDeleteDocument = (docId) => {
        setDeleteDocumentId(docId);
        setDeleteDialogOpen(true);
    };

    const confirmDeleteDocument = () => {
        if (deleteDocumentId) {
            deleteDocumentMutation.mutate(deleteDocumentId);
        }
    };

    // Mutation for updating salary info
    const updateSalaryMutation = useMutation({
        mutationFn: async (salaryData) => {
            const formData = new FormData();
            formData.append('salary', salaryData.salary);
            formData.append('hra', salaryData.hra);
            formData.append('ta', salaryData.ta);
            return api.post(`/admin/employees/${id}`, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employee', id]);
            toast.success('Salary information updated successfully');
            setSalaryModalOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error updating salary information');
        }
    });

    // Open salary modal with current values
    const handleOpenSalaryModal = () => {
        setSalaryForm({
            salary: data?.salary || '',
            hra: data?.hra || '',
            ta: data?.ta || ''
        });
        setSalaryModalOpen(true);
    };

    // Handle salary form submit
    const handleSalarySubmit = (e) => {
        e.preventDefault();
        updateSalaryMutation.mutate(salaryForm);
    };

    // Mutation for updating bank details
    const updateBankMutation = useMutation({
        mutationFn: async (bankData) => {
            const formData = new FormData();
            formData.append('bank_name', bankData.bank_name);
            formData.append('account_number', bankData.account_number);
            formData.append('ifsc_code', bankData.ifsc_code);
            return api.post(`/admin/employees/${id}`, formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['employee', id]);
            toast.success('Bank details updated successfully');
            setBankModalOpen(false);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error updating bank details');
        }
    });

    // Open bank modal with current values
    const handleOpenBankModal = () => {
        setBankForm({
            bank_name: data?.bank_name || '',
            account_number: data?.account_number || '',
            ifsc_code: data?.ifsc_code || ''
        });
        setBankModalOpen(true);
    };

    // Handle bank form submit
    const handleBankSubmit = (e) => {
        e.preventDefault();
        updateBankMutation.mutate(bankForm);
    };

    const getInitials = (name) => {
        if (!name) return 'NA';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return '$' + parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
    };

    const getActivityIcon = (activity) => {
        if (activity.type === 'attendance') {
            return (
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                </div>
            );
        }
        if (activity.type === 'leave') {
            if (activity.status === 'approved') {
                return (
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <CalendarDays className="h-4 w-4 text-orange-600" />
                    </div>
                );
            }
            if (activity.status === 'rejected') {
                return (
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="h-4 w-4 text-red-600" />
                    </div>
                );
            }
            return (
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <CalendarDays className="h-4 w-4 text-yellow-600" />
                </div>
            );
        }
        return (
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
        );
    };

    const getTimeAgo = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} mins ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            present: { label: 'Present', className: 'bg-green-100 text-green-700' },
            absent: { label: 'Absent', className: 'bg-red-100 text-red-700' },
            on_leave: { label: 'Leave', className: 'bg-blue-100 text-blue-700' },
            half_day: { label: 'Half Day', className: 'bg-yellow-100 text-yellow-700' },
            approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
            pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700' },
            rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        };
        const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
        return <Badge className={config.className}>{config.label}</Badge>;
    };

    const getMonthOptions = () => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            options.push({ value, label });
        }
        return options;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'attendance', label: 'Attendance' },
        { id: 'leave', label: 'Leave History' },
        { id: 'payroll', label: 'Payroll' },
        { id: 'documents', label: 'Documents' },
    ];

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 bg-gray-100">
                            {data?.profile_image_url ? (
                                <AvatarImage
                                    src={data.profile_image_url}
                                    alt={data.full_name}
                                    className="object-cover"
                                />
                            ) : null}
                            <AvatarFallback className="text-xl bg-gray-100 text-gray-500 font-medium">
                                {getInitials(data?.full_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{data?.full_name}</h1>
                            <p className="text-gray-500">
                                {data?.designation_name || data?.job_title || 'No Designation'} - {data?.department_name || 'No Department'}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {data?.employee_id}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Joined {formatDate(data?.join_date)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {data?.email || 'No email'}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Link to={`/employees/${id}/edit`}>
                            <Button variant="outline" className="gap-2">
                                <Edit className="h-4 w-4" />
                                Edit Details
                            </Button>
                        </Link>
                        <Button className="bg-gray-900 hover:bg-gray-800 text-white gap-2">
                            <FileText className="h-4 w-4" />
                            View Payslip
                        </Button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{data?.attendance_rate || 0}%</p>
                                <p className="text-sm text-gray-500">Attendance Rate</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <CalendarDays className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {data?.leave_balance || 0}/{data?.total_leave || 23}
                                </p>
                                <p className="text-sm text-gray-500">Leave Balance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                                <DollarSign className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatCurrency(data?.salary)}
                                </p>
                                <p className="text-sm text-gray-500">Monthly Salary</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Clock className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{Math.abs(Math.floor(data?.hours_this_month || 0))}h</p>
                                <p className="text-sm text-gray-500">This Month</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <Card className="bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Full Name</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Date of Birth</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(data?.date_of_birth)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Gender</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.gender || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Phone Number</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.mobile_number || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Email Address</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1 break-all">{data?.email || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Emergency Contact</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.emergency_contact_number || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-wide">Address</p>
                                    <p className="text-sm font-medium text-gray-900 mt-1">
                                        {[data?.address, data?.city, data?.state, data?.country].filter(Boolean).join(', ') || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Employment Details */}
                    <Card className="bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Employment Details</h3>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Employee ID</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.employee_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Join Date</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{formatDate(data?.join_date)}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Department</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.department_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Designation</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.designation_name || data?.job_title || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Employment Type</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">Full-Time</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Work Location</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.work_location || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Reporting Manager</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">N/A</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Status</p>
                                        <Badge
                                            className={`mt-1 ${
                                                data?.status === 1
                                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                                    : 'bg-gray-400 hover:bg-gray-500 text-white'
                                            }`}
                                        >
                                            {data?.status === 1 ? 'ACTIVE' : 'INACTIVE'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card className="bg-white">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                            <div className="space-y-4">
                                {data?.recent_activity && data.recent_activity.length > 0 ? (
                                    data.recent_activity.map((activity, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            {getActivityIcon(activity)}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                                            </div>
                                            <p className="text-xs text-gray-400 whitespace-nowrap">{getTimeAgo(activity.created_at)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No recent activity</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
                <Card className="bg-white">
                    <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Attendance History - {getMonthOptions().find(m => m.value === attendanceMonth)?.label}
                            </h3>
                            <div className="flex gap-2">
                                <Select value={attendanceMonth} onValueChange={setAttendanceMonth}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select month" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getMonthOptions().map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        {/* Attendance Summary */}
                        <div className="flex flex-wrap gap-8 mb-6 py-4 border-b">
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Working Days</p>
                                <p className="text-2xl font-semibold text-gray-900">{attendanceData?.summary?.working_days || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Present</p>
                                <p className="text-2xl font-semibold text-green-600">{attendanceData?.summary?.present || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Absent</p>
                                <p className="text-2xl font-semibold text-red-600">{attendanceData?.summary?.absent || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Leave</p>
                                <p className="text-2xl font-semibold text-gray-900">{attendanceData?.summary?.leave || 0}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Total Hours</p>
                                <p className="text-2xl font-semibold text-gray-900">{Math.abs(Math.floor(attendanceData?.summary?.total_hours || 0))}h</p>
                            </div>
                        </div>

                        {/* Attendance Table */}
                        {attendanceLoading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check In</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check Out</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total Hours</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData?.records?.length > 0 ? (
                                            attendanceData.records.map((record) => (
                                                <tr key={record.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-sm">{record.date}</td>
                                                    <td className="py-3 px-4">{getStatusBadge(record.status)}</td>
                                                    <td className="py-3 px-4 text-sm">{record.check_in}</td>
                                                    <td className="py-3 px-4 text-sm">{record.check_out}</td>
                                                    <td className="py-3 px-4 text-sm">{record.hours || '-'}</td>
                                                    <td className="py-3 px-4 text-sm text-gray-500">{record.remarks}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                                    No attendance records found for this month
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Leave History Tab */}
            {activeTab === 'leave' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Leave Balance */}
                        <Card className="bg-white">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Balance</h3>
                                <div className="space-y-4">
                                    {leaveData?.balance?.map((leave, index) => (
                                        <div key={index} className="p-4 border rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{leave.type}</h4>
                                                    <p className="text-sm text-gray-500">Total: {leave.total} days</p>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <span className="text-gray-500">Used: {leave.used}</span>
                                                    <span className="mx-2">|</span>
                                                    <span className="text-green-600 font-medium">Remaining: {leave.remaining}</span>
                                                </div>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${leave.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Leave Statistics */}
                        <Card className="bg-white">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Statistics</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-500">Total Allocated ({new Date().getFullYear()})</span>
                                        <span className="font-medium">{leaveData?.statistics?.total_allocated || 0} days</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-500">Total Leave Taken ({new Date().getFullYear()})</span>
                                        <span className="font-medium">{leaveData?.statistics?.total_taken || 0} days</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-500">Total Remaining</span>
                                        <span className="font-medium text-green-600">{leaveData?.statistics?.total_remaining || 0} days</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b">
                                        <span className="text-gray-500">Pending Requests</span>
                                        <span className="font-medium">{leaveData?.statistics?.pending_requests || 0}</span>
                                    </div>
                                    <div className="flex justify-between py-3">
                                        <span className="text-gray-500">Most Used Type</span>
                                        <span className="font-medium">{leaveData?.statistics?.most_used_type || 'None'}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Leave History Table */}
                    <Card className="bg-white">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave History</h3>
                            {leaveLoading ? (
                                <div className="text-center py-8">Loading...</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Leave Type</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">From Date</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">To Date</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Days</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Reason</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Applied On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {leaveData?.history?.length > 0 ? (
                                                leaveData.history.map((leave) => (
                                                    <tr key={leave.id} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-sm">{leave.leave_type}</td>
                                                        <td className="py-3 px-4 text-sm">{leave.from_date}</td>
                                                        <td className="py-3 px-4 text-sm">{leave.to_date}</td>
                                                        <td className="py-3 px-4 text-sm">{leave.days}</td>
                                                        <td className="py-3 px-4 text-sm text-gray-500">{leave.reason}</td>
                                                        <td className="py-3 px-4">{getStatusBadge(leave.status)}</td>
                                                        <td className="py-3 px-4 text-sm">{leave.applied_on}</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={7} className="text-center py-8 text-gray-500">
                                                        No leave requests found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Payroll Tab */}
            {activeTab === 'payroll' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Salary Information */}
                        <Card className="bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Salary Information</h3>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenSalaryModal}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Base Salary</span>
                                        <span className="font-medium">{formatCurrency(data?.salary)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">HRA ({data?.hra || 0}%)</span>
                                        <span className="font-medium">{formatCurrency((data?.salary || 0) * (data?.hra || 0) / 100)}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-gray-500">Transport Allowance ({data?.ta || 0}%)</span>
                                        <span className="font-medium">{formatCurrency((data?.salary || 0) * (data?.ta || 0) / 100)}</span>
                                    </div>
                                    <div className="flex justify-between py-3 bg-gray-50 px-2 rounded">
                                        <span className="font-semibold text-gray-900">Gross Salary</span>
                                        <span className="font-bold text-gray-900">{formatCurrency((data?.salary || 0) * (1 + (data?.hra || 0) / 100 + (data?.ta || 0) / 100))}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bank Details */}
                        <Card className="bg-white">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Bank Details</h3>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenBankModal}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Bank Name</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.bank_name || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Account Number</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                            {data?.account_number ? '****' + data.account_number.slice(-4) : 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">Account Type</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">Checking</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">IFSC Code</p>
                                        <p className="text-sm font-medium text-gray-900 mt-1">{data?.ifsc_code || 'N/A'}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Payroll History */}
                    <Card className="bg-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Payroll History</h3>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Month</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Working Days</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Present</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Gross Salary</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Deductions</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Net Salary</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(() => {
                                            const baseSalary = data?.salary || 0;
                                            const hraPercent = data?.hra || 0;
                                            const taPercent = data?.ta || 0;
                                            const grossSalary = baseSalary * (1 + hraPercent / 100 + taPercent / 100);

                                            const months = [
                                                { month: 'November 2024', workingDays: 23, present: 22 },
                                                { month: 'October 2024', workingDays: 22, present: 22 },
                                                { month: 'September 2024', workingDays: 21, present: 21 },
                                            ];

                                            return months.map((item, index) => {
                                                const perDaySalary = grossSalary / item.workingDays;
                                                const absentDays = item.workingDays - item.present;
                                                const deductions = perDaySalary * absentDays;
                                                const netSalary = grossSalary - deductions;

                                                return (
                                                    <tr key={index} className="border-b hover:bg-gray-50">
                                                        <td className="py-3 px-4 text-sm">{item.month}</td>
                                                        <td className="py-3 px-4 text-sm">{item.workingDays}</td>
                                                        <td className="py-3 px-4 text-sm">{item.present}</td>
                                                        <td className="py-3 px-4 text-sm">{formatCurrency(grossSalary)}</td>
                                                        <td className="py-3 px-4 text-sm text-red-600">
                                                            {deductions > 0 ? `-${formatCurrency(deductions)}` : formatCurrency(0)}
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-green-600 font-semibold">
                                                            {formatCurrency(netSalary)}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Badge className="bg-green-100 text-green-700">Paid</Badge>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <Button variant="link" size="sm" className="text-blue-600 p-0">View</Button>
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
                <Card className="bg-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b">
                            <h3 className="text-lg font-semibold text-gray-900">Employee Documents</h3>
                            <Button
                                className="bg-gray-900 hover:bg-gray-800 text-white"
                                onClick={() => setUploadModalOpen(true)}
                            >
                                Upload Document
                            </Button>
                        </div>

                        {documentsLoading ? (
                            <div className="text-center py-8">Loading documents...</div>
                        ) : documentsData && documentsData.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {documentsData.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="border border-dashed border-blue-300 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                                    >
                                        {/* Document Icon */}
                                        <div className="flex justify-center mb-3">
                                            <div className="w-12 h-12 flex items-center justify-center">
                                                <FileText className="h-10 w-10 text-blue-500" />
                                            </div>
                                        </div>

                                        {/* Document Name */}
                                        <h4 className="font-medium text-gray-900 text-sm truncate mb-1">
                                            {doc.file_name}
                                        </h4>

                                        {/* Upload Date */}
                                        <p className="text-xs text-gray-500 mb-1">
                                            Uploaded on {doc.uploaded_at}
                                        </p>

                                        {/* File Size */}
                                        <p className="text-xs text-gray-500 mb-3">
                                            {doc.file_size}
                                        </p>

                                        {/* Action Buttons */}
                                        <div className="flex gap-3">
                                            <button
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                onClick={() => window.open(doc.file_url, '_blank')}
                                            >
                                                Download
                                            </button>
                                            <button
                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                onClick={() => handleDeleteDocument(doc.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                <p>No documents uploaded yet</p>
                                <p className="text-sm mt-1">Click "Upload Document" to add files</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Salary Edit Modal */}
            <Dialog open={salaryModalOpen} onOpenChange={setSalaryModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Salary Information</DialogTitle>
                        <DialogDescription>
                            Update the salary, HRA, and TA percentage for this employee.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSalarySubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="salary">Base Salary</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={salaryForm.salary}
                                    onChange={(e) => setSalaryForm({ ...salaryForm, salary: e.target.value })}
                                    placeholder="Enter base salary"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hra">HRA (%)</Label>
                                <Input
                                    id="hra"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={salaryForm.hra}
                                    onChange={(e) => setSalaryForm({ ...salaryForm, hra: e.target.value })}
                                    placeholder="Enter HRA percentage"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ta">TA (%)</Label>
                                <Input
                                    id="ta"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    value={salaryForm.ta}
                                    onChange={(e) => setSalaryForm({ ...salaryForm, ta: e.target.value })}
                                    placeholder="Enter TA percentage"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setSalaryModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateSalaryMutation.isPending}>
                                {updateSalaryMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bank Details Edit Modal */}
            <Dialog open={bankModalOpen} onOpenChange={setBankModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Bank Details</DialogTitle>
                        <DialogDescription>
                            Update the bank account information for this employee.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleBankSubmit}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="bank_name">Bank Name</Label>
                                <Input
                                    id="bank_name"
                                    type="text"
                                    value={bankForm.bank_name}
                                    onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                                    placeholder="Enter bank name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="account_number">Account Number</Label>
                                <Input
                                    id="account_number"
                                    type="text"
                                    value={bankForm.account_number}
                                    onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                                    placeholder="Enter account number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ifsc_code">IFSC Code</Label>
                                <Input
                                    id="ifsc_code"
                                    type="text"
                                    value={bankForm.ifsc_code}
                                    onChange={(e) => setBankForm({ ...bankForm, ifsc_code: e.target.value })}
                                    placeholder="Enter IFSC code"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setBankModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateBankMutation.isPending}>
                                {updateBankMutation.isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Upload Document Modal */}
            <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Upload a new document for this employee.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUploadDocument}>
                        <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="document_name">Document Name</Label>
                                <Input
                                    id="document_name"
                                    type="text"
                                    value={documentName}
                                    onChange={(e) => setDocumentName(e.target.value)}
                                    placeholder="Document Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="file">Select File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                />
                                <p className="text-xs text-gray-500">
                                    Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 10MB)
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setUploadModalOpen(false);
                                    setDocumentName('');
                                    setSelectedFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={uploadDocumentMutation.isPending}>
                                {uploadDocumentMutation.isPending ? 'Uploading...' : 'Upload'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Document Confirmation */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Document</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this document? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteDocumentId(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDeleteDocument}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteDocumentMutation.isPending ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
