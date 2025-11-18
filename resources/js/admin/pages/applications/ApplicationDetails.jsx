import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Download, FileText, User, MapPin, Briefcase, Phone, Mail } from 'lucide-react';

export default function ApplicationDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['application', id],
        queryFn: async () => {
            const response = await api.get(`/admin/applications/${id}`);
            return response.data.data;
        },
    });

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
            {/* Header Section with Photo */}
            <div className="flex items-center gap-2 sm:gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/applications')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1">
                    <h1 className="font-bold tracking-tight text-lg sm:text-xl">Application Details</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">Complete application information</p>
                </div>
            </div>

            {/* Profile Header Card */}
            <Card style={{ background: '#e7f4f4' }}>
                <CardContent className="p-3 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                        {/* Photo */}
                        <div className="flex-shrink-0">
                            {data?.photo_url ? (
                                <img
                                    src={data.photo_url}
                                    alt={data?.name}
                                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 shadow-lg"
                                    style={{ borderColor: '#14b8a6' }}
                                />
                            ) : (
                                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gray-200 flex items-center justify-center border-4" style={{ borderColor: '#14b8a6' }}>
                                    <User className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* Header Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 break-words">{data?.name}</h2>
                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mb-4">
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm sm:text-base">
                                    <Mail className="h-4 w-4 flex-shrink-0" />
                                    <span className="break-all">{data?.email}</span>
                                </div>
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-gray-600 text-sm sm:text-base">
                                    <Phone className="h-4 w-4 flex-shrink-0" />
                                    <span>{data?.mobile}</span>
                                </div>
                                {data?.job_category && (
                                    <div className="flex justify-center sm:justify-start">
                                        <Badge variant="default" className="text-xs sm:text-sm">
                                            {data.job_category}
                                        </Badge>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center sm:justify-start gap-2">
                                {data?.cv_url && (
                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={() => window.open(data.cv_url, '_blank')}
                                        className="w-full sm:w-auto"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download CV
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Information Cards Grid */}
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3" style={{ background: 'linear-gradient(135deg, #e0e7ff 0%, #ddd6fe 100%)' }}>
                        <CardTitle className="text-gray-700 flex items-center gap-2 text-base sm:text-lg">
                            <User className="h-4 w-4 sm:h-5 sm:w-5" />
                            Personal Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 sm:pt-4 p-3 sm:p-6 sm:pt-4">
                        <div className="space-y-2 sm:space-y-3">
                            {[
                                { label: 'Full Name', value: data?.name },
                                { label: 'Date of Birth', value: data?.date_of_birth },
                                { label: 'Gender', value: data?.gender },
                                { label: 'Marital Status', value: data?.marital_status },
                                { label: 'Father Name', value: data?.father_name },
                            ].map((field, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                    <span className="font-medium text-gray-600 text-sm sm:text-base">{field.label}:</span>
                                    <span className="text-gray-800 text-sm sm:text-base break-words">{field.value || 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Address Information */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3" style={{ background: 'linear-gradient(135deg, #fce7f3 0%, #fecaca 100%)' }}>
                        <CardTitle className="text-gray-700 flex items-center gap-2 text-base sm:text-lg">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                            Address Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 sm:pt-4 p-3 sm:p-6 sm:pt-4">
                        <div className="space-y-2 sm:space-y-3">
                            {[
                                { label: 'Address', value: data?.address },
                                { label: 'District', value: data?.district },
                                { label: 'State', value: data?.state },
                                { label: 'Pincode', value: data?.pincode },
                            ].map((field, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                    <span className="font-medium text-gray-600 text-sm sm:text-base">{field.label}:</span>
                                    <span className="text-gray-800 text-sm sm:text-base break-words sm:text-right">{field.value || 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Professional Information */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3" style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' }}>
                        <CardTitle className="text-gray-700 flex items-center gap-2 text-base sm:text-lg">
                            <Briefcase className="h-4 w-4 sm:h-5 sm:w-5" />
                            Professional Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 sm:pt-4 p-3 sm:p-6 sm:pt-4">
                        <div className="space-y-2 sm:space-y-3">
                            {[
                                { label: 'Job Category', value: data?.job_category },
                                { label: 'Qualification', value: data?.qualification },
                                { label: 'Technology Stack', value: data?.technology_stack },
                                { label: 'Experience', value: data?.experience },
                                { label: 'Experience Years', value: data?.experience_years },
                                { label: 'Previous Employer', value: data?.previous_employer },
                            ].map((field, index) => (
                                <div key={index} className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors gap-1">
                                    <span className="font-medium text-gray-600 text-sm sm:text-base">{field.label}:</span>
                                    <span className="text-gray-800 text-sm sm:text-base break-words sm:text-right">{field.value || 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Salary & Expectations */}
                <Card className="shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' }}>
                        <CardTitle className="text-gray-700 flex items-center gap-2 text-base sm:text-lg">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                            Salary & Expectations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 sm:pt-4 p-3 sm:p-6 sm:pt-4">
                        <div className="space-y-2 sm:space-y-3">
                            {[
                                { label: 'Last Drawn Salary', value: data?.last_drawn_salary ? `₹${data.last_drawn_salary}` : null },
                                { label: 'Expected Salary', value: data?.expected_salary ? `₹${data.expected_salary}` : null },
                                { label: 'Why Changing Job', value: data?.why_changing_job },
                                { label: 'Why GetLead', value: data?.why_getlead },
                            ].map((field, index) => (
                                <div key={index} className="py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded transition-colors">
                                    <div className="font-medium text-gray-600 mb-1 text-sm sm:text-base">{field.label}:</div>
                                    <div className="text-gray-800 text-sm sm:text-base break-words">{field.value || 'N/A'}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Documents Section */}
            {(data?.photo_url || data?.cv_url) && (
                <Card className="shadow-md">
                    <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3" style={{ background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' }}>
                        <CardTitle className="text-gray-700 flex items-center gap-2 text-base sm:text-lg">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                            Documents
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-3 sm:pt-4 p-3 sm:p-6 sm:pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {data?.photo_url && (
                                <div className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-blue-50 to-blue-100">
                                    <h4 className="font-semibold text-blue-800 mb-2 text-sm sm:text-base">Photo</h4>
                                    <img
                                        src={data.photo_url}
                                        alt="Photo"
                                        className="w-full h-40 sm:h-48 object-cover rounded-md mb-2"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs sm:text-sm"
                                        onClick={() => window.open(data.photo_url, '_blank')}
                                    >
                                        View Full Size
                                    </Button>
                                </div>
                            )}
                            {data?.cv_url && (
                                <div className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-gradient-to-br from-green-50 to-green-100">
                                    <h4 className="font-semibold text-green-800 mb-2 text-sm sm:text-base">CV / Resume</h4>
                                    <div className="flex items-center justify-center h-40 sm:h-48 bg-white rounded-md mb-2">
                                        <FileText className="h-16 w-16 sm:h-20 sm:w-20 text-green-600" />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full text-xs sm:text-sm"
                                        onClick={() => window.open(data.cv_url, '_blank')}
                                    >
                                        Download CV
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
