import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { ArrowLeft } from 'lucide-react';
import $ from 'jquery';
import 'summernote/dist/summernote-lite.css';
import 'summernote/dist/summernote-lite.js';

export default function OpeningForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = Boolean(id);

    // Refs for Summernote editors
    const descriptionRef = useRef(null);
    const detailsRef = useRef(null);

    const [formData, setFormData] = useState({
        job_title: '',
        job_category_id: '',
        job_designation_id: '',
        job_location: '',
        job_description: '',
        job_closing_date: '',
        job_details: '',
    });

    // Fetch job categories
    const { data: jobCategories } = useQuery({
        queryKey: ['job-categories'],
        queryFn: async () => {
            const response = await api.get('/admin/job-categories', {
                params: { per_page: 100 }
            });
            return response.data.data.data;
        },
    });

    // Fetch designations
    const { data: designations } = useQuery({
        queryKey: ['designations'],
        queryFn: async () => {
            const response = await api.get('/admin/designations', {
                params: { per_page: 100 }
            });
            return response.data.data.data;
        },
    });

    // Fetch job opening data if editing
    const { data: opening, isLoading } = useQuery({
        queryKey: ['job-opening', id],
        queryFn: async () => {
            const response = await api.get(`/admin/job-openings/${id}`);
            return response.data.data;
        },
        enabled: isEdit,
    });

    // Initialize Summernote editors
    useEffect(() => {
        // Initialize Summernote for job_description
        if (descriptionRef.current) {
            $(descriptionRef.current).summernote({
                height: 250,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['link']],
                    ['view', ['fullscreen', 'codeview', 'help']]
                ],
                callbacks: {
                    onChange: function(contents) {
                        setFormData(prev => ({ ...prev, job_description: contents }));
                    }
                }
            });
        }

        // Initialize Summernote for job_details
        if (detailsRef.current) {
            $(detailsRef.current).summernote({
                height: 250,
                toolbar: [
                    ['style', ['style']],
                    ['font', ['bold', 'underline', 'clear']],
                    ['color', ['color']],
                    ['para', ['ul', 'ol', 'paragraph']],
                    ['table', ['table']],
                    ['insert', ['link']],
                    ['view', ['fullscreen', 'codeview', 'help']]
                ],
                callbacks: {
                    onChange: function(contents) {
                        setFormData(prev => ({ ...prev, job_details: contents }));
                    }
                }
            });
        }

        // Cleanup on unmount
        return () => {
            if (descriptionRef.current) $(descriptionRef.current).summernote('destroy');
            if (detailsRef.current) $(detailsRef.current).summernote('destroy');
        };
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (opening && isEdit) {
            setFormData({
                job_title: opening.job_title || '',
                job_category_id: opening.job_category_id ? opening.job_category_id.toString() : '',
                job_designation_id: opening.job_designation_id ? opening.job_designation_id.toString() : '',
                job_location: opening.job_location || '',
                job_description: opening.job_description || '',
                job_closing_date: opening.job_closing_date || '',
                job_details: opening.job_details || '',
            });

            // Set Summernote content
            if (descriptionRef.current) {
                $(descriptionRef.current).summernote('code', opening.job_description || '');
            }
            if (detailsRef.current) {
                $(detailsRef.current).summernote('code', opening.job_details || '');
            }
        }
    }, [opening, isEdit]);

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data) => api.post('/admin/job-openings', data),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-openings']);
            toast.success('Job opening created successfully');
            navigate('/openings');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error creating job opening');
        }
    });

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (data) => api.put(`/admin/job-openings/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['job-openings']);
            queryClient.invalidateQueries(['job-opening', id]);
            toast.success('Job opening updated successfully');
            navigate('/openings');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error updating job opening');
        }
    });

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Get current Summernote content and prepare data
        const submissionData = {
            ...formData,
            job_category_id: formData.job_category_id ? parseInt(formData.job_category_id) : null,
            job_designation_id: formData.job_designation_id ? parseInt(formData.job_designation_id) : null,
            job_description: $(descriptionRef.current).summernote('code'),
            job_details: $(detailsRef.current).summernote('code'),
        };

        if (isEdit) {
            updateMutation.mutate(submissionData);
        } else {
            createMutation.mutate(submissionData);
        }
    };

    if (isLoading && isEdit) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/openings')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>
                        {isEdit ? 'Edit Job Opening' : 'Add New Job Opening'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEdit ? 'Update job opening details' : 'Create a new job opening'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>Job Opening Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="job_title">Job Title *</Label>
                                <Input
                                    id="job_title"
                                    value={formData.job_title}
                                    onChange={(e) => handleChange('job_title', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_category_id">Job Category</Label>
                                <Select
                                    key={`category-${formData.job_category_id || 'empty'}`}
                                    value={formData.job_category_id}
                                    onValueChange={(value) => handleChange('job_category_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobCategories?.map((category) => (
                                            <SelectItem key={category.id} value={category.id.toString()}>
                                                {category.category_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_designation_id">Job Position</Label>
                                <Select
                                    key={`designation-${formData.job_designation_id || 'empty'}`}
                                    value={formData.job_designation_id}
                                    onValueChange={(value) => handleChange('job_designation_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select job position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {designations?.map((designation) => (
                                            <SelectItem key={designation.id} value={designation.id.toString()}>
                                                {designation.designation_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_location">Job Location</Label>
                                <Input
                                    id="job_location"
                                    value={formData.job_location}
                                    onChange={(e) => handleChange('job_location', e.target.value)}
                                    placeholder="e.g., New York, Remote"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_closing_date">Job Closing Date</Label>
                                <Input
                                    id="job_closing_date"
                                    type="date"
                                    value={formData.job_closing_date}
                                    onChange={(e) => handleChange('job_closing_date', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Rich Text Fields */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="job_description">Job Description</Label>
                                <div ref={descriptionRef}></div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="job_details">Job Details</Label>
                                <div ref={detailsRef}></div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/openings')}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                            >
                                {createMutation.isPending || updateMutation.isPending
                                    ? 'Saving...'
                                    : isEdit
                                    ? 'Update Job Opening'
                                    : 'Create Job Opening'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
}
