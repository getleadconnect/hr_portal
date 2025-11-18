import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';

export default function OpeningDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    // Fetch job opening details
    const { data: opening, isLoading } = useQuery({
        queryKey: ['job-opening', id],
        queryFn: async () => {
            const response = await api.get(`/admin/job-openings/${id}`);
            return response.data.data;
        },
    });

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    if (!opening) {
        return <div className="text-center py-8">Job opening not found</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
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
                            Job Opening Details
                        </h1>
                        <p className="text-muted-foreground">
                            View job opening information
                        </p>
                    </div>
                </div>
                <Link to={`/openings/${id}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Job Opening
                    </Button>
                </Link>
            </div>

            {/* Job Opening Information */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>{opening.job_title}</CardTitle>
                        <Badge variant={opening.status === 1 ? 'default' : 'secondary'}>
                            {opening.status === 1 ? 'Active' : 'Inactive'}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Basic Information */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Job Category</p>
                            <p className="text-sm">{opening.job_category_name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Position</p>
                            <p className="text-sm">{opening.designation_name || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Job Location</p>
                            <p className="text-sm">{opening.job_location || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Closing Date</p>
                            <p className="text-sm">{opening.job_closing_date || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Posted Date</p>
                            <p className="text-sm">{opening.created_at || 'N/A'}</p>
                        </div>
                    </div>

                    {/* Job Description */}
                    {opening.job_description && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Job Description</p>
                            <div
                                className="prose prose-sm max-w-none border rounded-lg p-4 bg-muted/30"
                                dangerouslySetInnerHTML={{ __html: opening.job_description }}
                            />
                        </div>
                    )}

                    {/* Job Details */}
                    {opening.job_details && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Job Details</p>
                            <div
                                className="prose prose-sm max-w-none border rounded-lg p-4 bg-muted/30"
                                dangerouslySetInnerHTML={{ __html: opening.job_details }}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
