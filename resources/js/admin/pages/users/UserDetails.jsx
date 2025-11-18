import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Edit } from 'lucide-react';

export default function UserDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await api.get(`/admin/users/${id}`);
            return response.data.data;
        },
    });

    const getRoleName = (roleId) => {
        switch(roleId) {
            case 1: return 'Admin';
            case 2: return 'User';
            default: return 'Unknown';
        }
    };

    if (isLoading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/users')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>User Details</h1>
                        <p className="text-muted-foreground">{data?.user_name}</p>
                    </div>
                </div>
                <Link to={`/users/${id}/edit`}>
                    <Button>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                            <span className="font-medium">User Name:</span>
                            <span>{data?.user_name}</span>

                            <span className="font-medium">Email:</span>
                            <span>{data?.email}</span>

                            <span className="font-medium">Country Code:</span>
                            <span>{data?.countrycode || 'N/A'}</span>

                            <span className="font-medium">Mobile:</span>
                            <span>{data?.mobile}</span>

                            <span className="font-medium">Role:</span>
                            <span>
                                <Badge variant={data?.role_id === 1 ? 'default' : 'outline'}>
                                    {getRoleName(data?.role_id)}
                                </Badge>
                            </span>

                            <span className="font-medium">Status:</span>
                            <span>
                                <Badge variant={data?.status === 1 ? 'default' : 'secondary'}>
                                    {data?.status === 1 ? 'Active' : 'Inactive'}
                                </Badge>
                            </span>

                            <span className="font-medium">Last Login:</span>
                            <span>{data?.last_login || 'Never'}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="space-y-4">
                            <div>
                                <span className="font-medium text-sm text-muted-foreground">User ID</span>
                                <p className="text-lg font-semibold">#{data?.id}</p>
                            </div>

                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Account Status</span>
                                <p className="mt-1">
                                    <Badge variant={data?.status === 1 ? 'default' : 'secondary'} className="text-sm">
                                        {data?.status === 1 ? 'Active Account' : 'Inactive Account'}
                                    </Badge>
                                </p>
                            </div>

                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Access Level</span>
                                <p className="mt-1">
                                    <Badge variant={data?.role_id === 1 ? 'default' : 'outline'} className="text-sm">
                                        {getRoleName(data?.role_id)} Access
                                    </Badge>
                                </p>
                            </div>

                            <div>
                                <span className="font-medium text-sm text-muted-foreground">Contact</span>
                                <p className="mt-1">{data?.countrycode} {data?.mobile}</p>
                                <p className="text-sm text-muted-foreground">{data?.email}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
