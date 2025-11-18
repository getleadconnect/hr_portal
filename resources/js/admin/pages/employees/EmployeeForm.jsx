import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function EmployeeForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        // Personal Information
        full_name: '',
        employee_id: '',
        date_of_birth: '',
        gender: '',
        marital_status: '',
        qualification_id: '',
        technology_stack: '',
        join_date: '',
        releaving_date: '',

        // Contact Information
        mobile_number: '',
        alternative_number_1: '',
        alternative_number_2: '',
        email: '',
        address: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        relationship: '',
        city: '',
        state: '',
        country: '',

        // Employment Details
        job_title: '',
        department_id: '',
        designation_id: '',
        date_of_hire: '',
        work_location: '',
        starting_salary: '',
        bank_name: '',
        account_number: '',
        ifsc_code: '',

        // Additional Details
        aadhar_number: '',
        pancard_number: '',
    });

    const [files, setFiles] = useState({
        profile_image: null,
        aadhar_file: null,
        pancard_file: null,
        experience_certificate: null,
        other_document: null,
    });

    const [previews, setPreviews] = useState({
        aadhar_file: null,
        pancard_file: null,
        experience_certificate: null,
        other_document: null,
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch employee data if editing
    const { data: employeeData } = useQuery({
        queryKey: ['employee', id],
        queryFn: async () => {
            const response = await api.get(`/admin/employees/${id}`);
            return response.data.data;
        },
        enabled: isEditMode,
    });

    // Fetch qualifications
    const { data: qualifications } = useQuery({
        queryKey: ['qualifications-all'],
        queryFn: async () => {
            const response = await api.get('/admin/qualifications', {
                params: { per_page: 1000 }
            });
            return response.data.data.data;
        },
    });

    // Fetch departments
    const { data: departments } = useQuery({
        queryKey: ['departments-all'],
        queryFn: async () => {
            const response = await api.get('/admin/departments', {
                params: { per_page: 1000 }
            });
            return response.data.data.data;
        },
    });

    // Fetch designations
    const { data: designations } = useQuery({
        queryKey: ['designations-all'],
        queryFn: async () => {
            const response = await api.get('/admin/designations', {
                params: { per_page: 1000 }
            });
            return response.data.data.data;
        },
    });

    // Fetch countries
    const { data: countries } = useQuery({
        queryKey: ['countries'],
        queryFn: async () => {
            const response = await api.get('/admin/countries');
            return response.data;
        },
    });

    useEffect(() => {
        if (employeeData) {
            setFormData(prevData => ({
                ...prevData,
                ...employeeData,
            }));

            // Load existing image previews
            const newPreviews = {};
            if (employeeData.aadhar_file_url && isImageUrl(employeeData.aadhar_file_url)) {
                newPreviews.aadhar_file = employeeData.aadhar_file_url;
            }
            if (employeeData.pancard_file_url && isImageUrl(employeeData.pancard_file_url)) {
                newPreviews.pancard_file = employeeData.pancard_file_url;
            }
            if (employeeData.experience_certificate_url && isImageUrl(employeeData.experience_certificate_url)) {
                newPreviews.experience_certificate = employeeData.experience_certificate_url;
            }
            if (employeeData.other_document_url && isImageUrl(employeeData.other_document_url)) {
                newPreviews.other_document = employeeData.other_document_url;
            }
            setPreviews(prev => ({ ...prev, ...newPreviews }));
        }
    }, [employeeData]);

    const isImageUrl = (url) => {
        if (!url) return false;
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
        return imageExtensions.some(ext => url.toLowerCase().includes(ext));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files: fileList } = e.target;
        const file = fileList[0];

        setFiles(prev => ({
            ...prev,
            [name]: file
        }));

        // Create preview for image files only
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviews(prev => ({
                    ...prev,
                    [name]: reader.result
                }));
            };
            reader.readAsDataURL(file);
        } else {
            // Clear preview if not an image
            setPreviews(prev => ({
                ...prev,
                [name]: null
            }));
        }

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const submitData = new FormData();

            // Append all form fields
            Object.keys(formData).forEach(key => {
                if (formData[key]) {
                    submitData.append(key, formData[key]);
                }
            });

            // Append files
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    submitData.append(key, files[key]);
                }
            });

            if (isEditMode) {
                await api.post(`/admin/employees/${id}`, submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Employee updated successfully');
            } else {
                await api.post('/admin/employees', submitData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Employee created successfully');
            }

            navigate('/employees');
        } catch (error) {
            if (error.response?.status === 422) {
                const errorData = error.response.data;
                if (errorData.errors) {
                    setErrors(errorData.errors);
                    toast.error('Please fix the validation errors');
                } else if (errorData.message) {
                    toast.error(errorData.message);
                }
            } else {
                toast.error(error.response?.data?.message || 'An error occurred');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/employees')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>
                        {isEditMode ? 'Edit Employee' : 'Add New Employee'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode ? 'Update employee information' : 'Fill in the employee details'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal and Contact Information Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name *</Label>
                            <Input
                                id="full_name"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.full_name && <p className="text-sm text-destructive">{errors.full_name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="employee_id">Employee ID *</Label>
                            <Input
                                id="employee_id"
                                name="employee_id"
                                value={formData.employee_id}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.employee_id && <p className="text-sm text-destructive">{errors.employee_id[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input
                                id="date_of_birth"
                                name="date_of_birth"
                                type="date"
                                value={formData.date_of_birth}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                key={`gender-${formData.gender || 'empty'}`}
                                value={formData.gender}
                                onValueChange={(value) => handleSelectChange('gender', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="marital_status">Marital Status</Label>
                            <Select
                                key={`marital-${formData.marital_status || 'empty'}`}
                                value={formData.marital_status}
                                onValueChange={(value) => handleSelectChange('marital_status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Single">Single</SelectItem>
                                    <SelectItem value="Married">Married</SelectItem>
                                    <SelectItem value="Divorced">Divorced</SelectItem>
                                    <SelectItem value="Widowed">Widowed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="qualification_id">Qualification</Label>
                            <Select
                                key={`qualification-${formData.qualification_id || 'empty'}`}
                                value={formData.qualification_id ? String(formData.qualification_id) : ''}
                                onValueChange={(value) => handleSelectChange('qualification_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select qualification" />
                                </SelectTrigger>
                                <SelectContent>
                                    {qualifications?.map((qual) => (
                                        <SelectItem key={qual.id} value={String(qual.id)}>
                                            {qual.qualification}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="technology_stack">Technology Stack</Label>
                            <Input
                                id="technology_stack"
                                name="technology_stack"
                                value={formData.technology_stack}
                                onChange={handleInputChange}
                                placeholder="e.g. React, Laravel, Node.js"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="join_date">Join Date</Label>
                            <Input
                                id="join_date"
                                name="join_date"
                                type="date"
                                value={formData.join_date}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="releaving_date">Relieving Date</Label>
                            <Input
                                id="releaving_date"
                                name="releaving_date"
                                type="date"
                                value={formData.releaving_date}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="profile_image">Profile Image</Label>
                            <Input
                                id="profile_image"
                                name="profile_image"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            {isEditMode && employeeData?.profile_image_url && (
                                <p className="text-sm text-muted-foreground">Current: <a href={employeeData.profile_image_url} target="_blank" rel="noopener noreferrer" className="text-primary">View</a></p>
                            )}
                            {errors.profile_image && <p className="text-sm text-destructive">{errors.profile_image[0]}</p>}
                        </div>
                    </CardContent>
                </Card>

                    {/* Contact Information */}
                    <Card>
                    <CardHeader>
                        <CardTitle>Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="mobile_number">Mobile Number *</Label>
                            <Input
                                id="mobile_number"
                                name="mobile_number"
                                value={formData.mobile_number}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.mobile_number && <p className="text-sm text-destructive">{errors.mobile_number[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alternative_number_1">Alternative Number 1</Label>
                            <Input
                                id="alternative_number_1"
                                name="alternative_number_1"
                                value={formData.alternative_number_1}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="alternative_number_2">Alternative Number 2</Label>
                            <Input
                                id="alternative_number_2"
                                name="alternative_number_2"
                                value={formData.alternative_number_2}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <Textarea
                                id="address"
                                name="address"
                                rows={4}
                                value={formData.address}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                                id="city"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Input
                                id="state"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="country">Country</Label>
                            <Select
                                key={`country-${formData.country || 'empty'}`}
                                value={formData.country}
                                onValueChange={(value) => handleSelectChange('country', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {countries?.map((country) => (
                                        <SelectItem key={country.id} value={country.name}>
                                            {country.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                            <Input
                                id="emergency_contact_name"
                                name="emergency_contact_name"
                                value={formData.emergency_contact_name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="emergency_contact_number">Emergency Contact Number</Label>
                            <Input
                                id="emergency_contact_number"
                                name="emergency_contact_number"
                                value={formData.emergency_contact_number}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="relationship">Relationship</Label>
                            <Select
                                key={`relationship-${formData.relationship || 'empty'}`}
                                value={formData.relationship}
                                onValueChange={(value) => handleSelectChange('relationship', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select relationship" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Father">Father</SelectItem>
                                    <SelectItem value="Mother">Mother</SelectItem>
                                    <SelectItem value="Husband">Husband</SelectItem>
                                    <SelectItem value="Wife">Wife</SelectItem>
                                    <SelectItem value="Brother">Brother</SelectItem>
                                    <SelectItem value="Sister">Sister</SelectItem>
                                    <SelectItem value="Guardian">Guardian</SelectItem>
                                    <SelectItem value="Cousin">Cousin</SelectItem>
                                    <SelectItem value="Uncle">Uncle</SelectItem>
                                    <SelectItem value="Aunt">Aunt</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
                </div>

                {/* Employment Details and Additional Details Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Employment Details */}
                    <Card>
                    <CardHeader>
                        <CardTitle>Employment Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="job_title">Job Title</Label>
                            <Select
                                key={`job-title-${formData.job_title || 'empty'}`}
                                value={formData.job_title}
                                onValueChange={(value) => handleSelectChange('job_title', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select job title" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations?.map((designation) => (
                                        <SelectItem key={designation.id} value={designation.designation_name}>
                                            {designation.designation_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="department_id">Department</Label>
                            <Select
                                key={`department-${formData.department_id || 'empty'}`}
                                value={formData.department_id ? String(formData.department_id) : ''}
                                onValueChange={(value) => handleSelectChange('department_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments?.map((dept) => (
                                        <SelectItem key={dept.id} value={String(dept.id)}>
                                            {dept.department_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="designation_id">Designation</Label>
                            <Select
                                key={`designation-${formData.designation_id || 'empty'}`}
                                value={formData.designation_id ? String(formData.designation_id) : ''}
                                onValueChange={(value) => handleSelectChange('designation_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations?.map((designation) => (
                                        <SelectItem key={designation.id} value={String(designation.id)}>
                                            {designation.designation_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date_of_hire">Date of Hire</Label>
                            <Input
                                id="date_of_hire"
                                name="date_of_hire"
                                type="date"
                                value={formData.date_of_hire}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="work_location">Work Location</Label>
                            <Input
                                id="work_location"
                                name="work_location"
                                value={formData.work_location}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="starting_salary">Starting Salary</Label>
                            <Input
                                id="starting_salary"
                                name="starting_salary"
                                type="number"
                                value={formData.starting_salary}
                                onChange={handleInputChange}
                                placeholder="Enter starting salary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bank_name">Bank Name</Label>
                            <Input
                                id="bank_name"
                                name="bank_name"
                                value={formData.bank_name}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="account_number">Account Number</Label>
                            <Input
                                id="account_number"
                                name="account_number"
                                value={formData.account_number}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="ifsc_code">IFSC Code</Label>
                            <Input
                                id="ifsc_code"
                                name="ifsc_code"
                                value={formData.ifsc_code}
                                onChange={handleInputChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                    {/* Additional Details */}
                    <Card>
                    <CardHeader>
                        <CardTitle>Additional Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="aadhar_number">Aadhar Number</Label>
                            <Input
                                id="aadhar_number"
                                name="aadhar_number"
                                value={formData.aadhar_number}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="aadhar_file">Aadhar File</Label>
                            <Input
                                id="aadhar_file"
                                name="aadhar_file"
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                            />
                            {isEditMode && employeeData?.aadhar_file_url && (
                                <p className="text-sm text-muted-foreground">Current: <a href={employeeData.aadhar_file_url} target="_blank" rel="noopener noreferrer" className="text-primary">View</a></p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pancard_number">PAN Card Number</Label>
                            <Input
                                id="pancard_number"
                                name="pancard_number"
                                value={formData.pancard_number}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pancard_file">PAN Card File</Label>
                            <Input
                                id="pancard_file"
                                name="pancard_file"
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                            />
                            {isEditMode && employeeData?.pancard_file_url && (
                                <p className="text-sm text-muted-foreground">Current: <a href={employeeData.pancard_file_url} target="_blank" rel="noopener noreferrer" className="text-primary">View</a></p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="experience_certificate">Experience Certificate</Label>
                            <Input
                                id="experience_certificate"
                                name="experience_certificate"
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                            />
                            {isEditMode && employeeData?.experience_certificate_url && (
                                <p className="text-sm text-muted-foreground">Current: <a href={employeeData.experience_certificate_url} target="_blank" rel="noopener noreferrer" className="text-primary">View</a></p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="other_document">Other Document</Label>
                            <Input
                                id="other_document"
                                name="other_document"
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileChange}
                            />
                            {isEditMode && employeeData?.other_document_url && (
                                <p className="text-sm text-muted-foreground">Current: <a href={employeeData.other_document_url} target="_blank" rel="noopener noreferrer" className="text-primary">View</a></p>
                            )}
                        </div>

                        {/* Image Previews Row */}
                        <div className="md:col-span-2 grid grid-cols-4 gap-4 pt-4 border-t">
                            {/* Aadhar Image Preview */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Aadhar Preview</Label>
                                {previews.aadhar_file ? (
                                    <div className="border rounded-lg overflow-hidden bg-muted/30">
                                        <img
                                            src={previews.aadhar_file}
                                            alt="Aadhar Preview"
                                            className="w-full h-32 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-dashed rounded-lg h-32 flex items-center justify-center bg-muted/10">
                                        <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </div>

                            {/* PAN Card Image Preview */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">PAN Card Preview</Label>
                                {previews.pancard_file ? (
                                    <div className="border rounded-lg overflow-hidden bg-muted/30">
                                        <img
                                            src={previews.pancard_file}
                                            alt="PAN Card Preview"
                                            className="w-full h-32 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-dashed rounded-lg h-32 flex items-center justify-center bg-muted/10">
                                        <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </div>

                            {/* Experience Certificate Preview */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Experience Preview</Label>
                                {previews.experience_certificate ? (
                                    <div className="border rounded-lg overflow-hidden bg-muted/30">
                                        <img
                                            src={previews.experience_certificate}
                                            alt="Experience Certificate Preview"
                                            className="w-full h-32 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-dashed rounded-lg h-32 flex items-center justify-center bg-muted/10">
                                        <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </div>

                            {/* Other Document Preview */}
                            <div className="space-y-2">
                                <Label className="text-xs text-muted-foreground">Other Doc Preview</Label>
                                {previews.other_document ? (
                                    <div className="border rounded-lg overflow-hidden bg-muted/30">
                                        <img
                                            src={previews.other_document}
                                            alt="Other Document Preview"
                                            className="w-full h-32 object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="border border-dashed rounded-lg h-32 flex items-center justify-center bg-muted/10">
                                        <span className="text-xs text-muted-foreground">No image</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/employees')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Employee' : 'Create Employee'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
