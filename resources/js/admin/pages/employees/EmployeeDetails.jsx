import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Edit, ExternalLink, Download, User, Phone, Mail, MapPin, Briefcase, FileText, CreditCard, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function EmployeeDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Helper function to check if URL is an image
    const isImageUrl = (url) => {
        if (!url) return false;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    // Handle PDF export
    const handleExportPdf = async () => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`http://localhost:8000/api/admin/employees/${id}/export-pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/pdf',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to export PDF');
            }

            // Create blob from response
            const blob = await response.blob();

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `employee_${data?.employee_id || id}.pdf`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast.success('PDF exported successfully');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export PDF');
        }
    };

    const { data, isLoading } = useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            const response = await api.get(`/admin/employees/${id}`);
            return response.data.data;
        },
    });

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
            {/* Header Section with Custom Background */}
            <div style={{ backgroundColor: '#e7f4f4' }} className="rounded-lg shadow-lg p-3 sm:p-6">
                {/* Mobile Layout */}
                <div className="flex flex-col gap-4 sm:hidden">
                    {/* Back Button and Action buttons - Mobile */}
                    <div className="flex items-center justify-between">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/employees')}
                            className="hover:bg-teal-100 text-gray-700"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={handleExportPdf}
                                className="bg-white text-teal-600 hover:bg-teal-50 border-teal-300"
                            >
                                <Download className="h-4 w-4" />
                            </Button>
                            <Link to={`/employees/${id}/edit`}>
                                <Button size="icon" className="bg-teal-600 text-white hover:bg-teal-700">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Profile Section - Mobile */}
                    <div className="flex flex-col items-center gap-4">
                        {data?.profile_image_url ? (
                            <img
                                src={data.profile_image_url}
                                alt={data.full_name}
                                className="rounded-full object-cover border-4 border-teal-500 shadow-lg"
                                style={{ width: '7rem', height: '7rem' }}
                            />
                        ) : (
                            <div className="rounded-full bg-teal-100 flex items-center justify-center border-4 border-teal-500 shadow-lg" style={{ width: '7rem', height: '7rem' }}>
                                <User className="h-10 w-10 text-teal-600" />
                            </div>
                        )}
                        <div className="text-center">
                            <h1 className="text-xl font-bold text-gray-800 break-words">{data?.full_name}</h1>
                            <p className="text-teal-700 text-base font-semibold">{data?.employee_id}</p>
                            <div className="mt-2">
                                <Badge
                                    variant={data?.status === 1 ? 'default' : 'secondary'}
                                    className={data?.status === 1 ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white hover:bg-gray-500'}
                                >
                                    {data?.status === 1 ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/employees')}
                            className="hover:bg-teal-100 text-gray-700"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-4">
                            {data?.profile_image_url ? (
                                <img
                                    src={data.profile_image_url}
                                    alt={data.full_name}
                                    className="rounded-full object-cover border-4 border-teal-500 shadow-lg"
                                    style={{ width: '7rem', height: '7rem' }}
                                />
                            ) : (
                                <div className="rounded-full bg-teal-100 flex items-center justify-center border-4 border-teal-500 shadow-lg" style={{ width: '7rem', height: '7rem' }}>
                                    <User className="h-10 w-10 text-teal-600" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{data?.full_name}</h1>
                                <p className="text-teal-700 text-lg font-semibold">{data?.employee_id}</p>
                                <div className="mt-2">
                                    <Badge
                                        variant={data?.status === 1 ? 'default' : 'secondary'}
                                        className={data?.status === 1 ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-400 text-white hover:bg-gray-500'}
                                    >
                                        {data?.status === 1 ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportPdf} className="bg-white text-teal-600 hover:bg-teal-50 border-teal-300">
                            <Download className="mr-2 h-4 w-4" />
                            <span className="hidden md:inline">Export PDF</span>
                            <span className="md:hidden">Export</span>
                        </Button>
                        <Link to={`/employees/${id}/edit`}>
                            <Button className="bg-teal-600 text-white hover:bg-teal-700">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-blue-600 text-base sm:text-lg">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 sm:pt-6">
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Full Name:</span>
                                <span className="text-gray-900 font-semibold text-sm sm:text-base break-words">{data?.full_name}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Employee ID:</span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.employee_id}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Date of Birth:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.date_of_birth || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Gender:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.gender || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Marital Status:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.marital_status || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Qualification ID:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.qualification_id || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Technology Stack:</span>
                                <span className="text-gray-900 text-sm sm:text-base break-words">{data?.technology_stack || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Join Date:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.join_date || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Relieving Date:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.releaving_date || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Contact Information */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-blue-600 text-base sm:text-lg">
                            <Phone className="h-5 w-5" />
                            Contact Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 sm:pt-6">
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                                    <Phone className="h-4 w-4 text-green-600" />
                                    Mobile Number:
                                </span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.mobile_number}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Alt Number 1:</span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.alternative_number_1 || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Alt Number 2:</span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.alternative_number_2 || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                    Email:
                                </span>
                                <span className="text-gray-900 text-sm sm:text-base break-all">{data?.email || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                                    <MapPin className="h-4 w-4 text-red-600" />
                                    Address:
                                </span>
                                <span className="text-gray-900 text-sm sm:text-base break-words sm:text-right">{data?.address || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">City:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.city || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">State:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.state || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Country:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.country || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Emergency Contact:</span>
                                <span className="text-gray-900 text-sm sm:text-base break-words">{data?.emergency_contact_name || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Emergency Number:</span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.emergency_contact_number || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Relationship:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.relationship || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Employment Details */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-blue-600 text-base sm:text-lg">
                            <Briefcase className="h-5 w-5" />
                            Employment Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 sm:pt-6">
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Job Title:</span>
                                <span className="text-gray-900 font-semibold text-sm sm:text-base break-words">{data?.job_title || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 flex items-center gap-2 text-sm sm:text-base">
                                    <Building2 className="h-4 w-4 text-purple-600" />
                                    Department ID:
                                </span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.department_id || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Designation ID:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.designation_id || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Date of Hire:</span>
                                <span className="text-gray-900 text-sm sm:text-base">{data?.date_of_hire || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Work Location:</span>
                                <span className="text-gray-900 text-sm sm:text-base break-words">{data?.work_location || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Starting Salary:</span>
                                <span className="text-gray-900 font-semibold text-sm sm:text-base">{data?.starting_salary ? `₹ ${parseFloat(data.starting_salary).toLocaleString('en-IN')}` : 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Details */}
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-blue-600 text-base sm:text-lg">
                            <CreditCard className="h-5 w-5" />
                            Additional Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4 sm:pt-6">
                        <div className="space-y-2 sm:space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Aadhar Number:</span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.aadhar_number || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">PAN Card Number:</span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.pancard_number || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Bank Name:</span>
                                <span className="text-gray-900 text-sm sm:text-base break-words">{data?.bank_name || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">Account Number:</span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.account_number || 'N/A'}</span>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:justify-between py-2 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                <span className="font-medium text-gray-600 text-sm sm:text-base">IFSC Code:</span>
                                <span className="text-gray-900 font-mono text-sm sm:text-base">{data?.ifsc_code || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card className="md:col-span-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="bg-gradient-to-r from-cyan-50 to-sky-50 border-b">
                        <CardTitle className="flex items-center gap-2 text-blue-600 text-base sm:text-lg">
                            <FileText className="h-5 w-5" />
                            Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 sm:pt-6">
                        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Aadhar Document */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-blue-600" />
                                    Aadhar Card
                                </h3>
                                {data?.aadhar_file_url ? (
                                    <div className="space-y-2">
                                        {isImageUrl(data.aadhar_file_url) ? (
                                            <div className="border-2 border-blue-200 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 shadow-md hover:shadow-lg transition-all">
                                                <img
                                                    src={data.aadhar_file_url}
                                                    alt="Aadhar Card"
                                                    className="w-full h-48 object-contain cursor-pointer hover:scale-105 transition-transform p-2"
                                                    onClick={() => window.open(data.aadhar_file_url, '_blank')}
                                                />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                                                onClick={() => window.open(data.aadhar_file_url, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Document
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center bg-gray-50">
                                        <span className="text-sm text-gray-400">Not uploaded</span>
                                    </div>
                                )}
                            </div>

                            {/* PAN Card Document */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-green-600" />
                                    PAN Card
                                </h3>
                                {data?.pancard_file_url ? (
                                    <div className="space-y-2">
                                        {isImageUrl(data.pancard_file_url) ? (
                                            <div className="border-2 border-green-200 rounded-lg overflow-hidden bg-gradient-to-br from-green-50 to-green-100 shadow-md hover:shadow-lg transition-all">
                                                <img
                                                    src={data.pancard_file_url}
                                                    alt="PAN Card"
                                                    className="w-full h-48 object-contain cursor-pointer hover:scale-105 transition-transform p-2"
                                                    onClick={() => window.open(data.pancard_file_url, '_blank')}
                                                />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-green-300 text-green-700 hover:bg-green-50"
                                                onClick={() => window.open(data.pancard_file_url, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Document
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center bg-gray-50">
                                        <span className="text-sm text-gray-400">Not uploaded</span>
                                    </div>
                                )}
                            </div>

                            {/* Experience Certificate */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-purple-600" />
                                    Experience Certificate
                                </h3>
                                {data?.experience_certificate_url ? (
                                    <div className="space-y-2">
                                        {isImageUrl(data.experience_certificate_url) ? (
                                            <div className="border-2 border-purple-200 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 shadow-md hover:shadow-lg transition-all">
                                                <img
                                                    src={data.experience_certificate_url}
                                                    alt="Experience Certificate"
                                                    className="w-full h-48 object-contain cursor-pointer hover:scale-105 transition-transform p-2"
                                                    onClick={() => window.open(data.experience_certificate_url, '_blank')}
                                                />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                                                onClick={() => window.open(data.experience_certificate_url, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Document
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center bg-gray-50">
                                        <span className="text-sm text-gray-400">Not uploaded</span>
                                    </div>
                                )}
                            </div>

                            {/* Other Document */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm text-gray-700 flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-amber-600" />
                                    Other Document
                                </h3>
                                {data?.other_document_url ? (
                                    <div className="space-y-2">
                                        {isImageUrl(data.other_document_url) ? (
                                            <div className="border-2 border-amber-200 rounded-lg overflow-hidden bg-gradient-to-br from-amber-50 to-amber-100 shadow-md hover:shadow-lg transition-all">
                                                <img
                                                    src={data.other_document_url}
                                                    alt="Other Document"
                                                    className="w-full h-48 object-contain cursor-pointer hover:scale-105 transition-transform p-2"
                                                    onClick={() => window.open(data.other_document_url, '_blank')}
                                                />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                                                onClick={() => window.open(data.other_document_url, '_blank')}
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                View Document
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg h-48 flex items-center justify-center bg-gray-50">
                                        <span className="text-sm text-gray-400">Not uploaded</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
