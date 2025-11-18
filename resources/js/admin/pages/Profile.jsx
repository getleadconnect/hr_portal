import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { User, Mail, Phone, KeyRound } from 'lucide-react';

export default function Profile() {
    const { user, refreshUser } = useAuth();
    const queryClient = useQueryClient();

    const [profileData, setProfileData] = useState({
        user_name: '',
        email: '',
        mobile: '',
    });

    const [passwordData, setPasswordData] = useState({
        new_password: '',
        new_password_confirmation: '',
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                user_name: user.user_name || '',
                email: user.email || '',
                mobile: user.mobile || '',
            });
        }
    }, [user]);

    const updateProfileMutation = useMutation({
        mutationFn: (data) => api.put('/admin/profile', data),
        onSuccess: () => {
            toast.success('Profile updated successfully');
            refreshUser && refreshUser();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error updating profile');
        }
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data) => api.post('/admin/change-password', data),
        onSuccess: () => {
            toast.success('Password changed successfully');
            setPasswordData({
                new_password: '',
                new_password_confirmation: '',
            });
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Error changing password');
        }
    });

    const handleProfileUpdate = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(profileData);
    };

    const handlePasswordChange = (e) => {
        e.preventDefault();
        changePasswordMutation.mutate(passwordData);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>My Profile</h1>
                <p className="text-muted-foreground">Manage your profile information and password</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information - Column 1 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="user_name">Username *</Label>
                                <Input
                                    id="user_name"
                                    value={profileData.user_name}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        user_name: e.target.value
                                    }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        email: e.target.value
                                    }))}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile</Label>
                                <Input
                                    id="mobile"
                                    value={profileData.mobile}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        mobile: e.target.value
                                    }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                    value={user?.role_id === 1 ? 'Admin' : 'User'}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={updateProfileMutation.isPending}
                                style={{ width: '170px' }}
                            >
                                {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password - Column 2 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <KeyRound className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new_password">New Password *</Label>
                                <Input
                                    id="new_password"
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        new_password: e.target.value
                                    }))}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new_password_confirmation">Confirm New Password *</Label>
                                <Input
                                    id="new_password_confirmation"
                                    type="password"
                                    value={passwordData.new_password_confirmation}
                                    onChange={(e) => setPasswordData(prev => ({
                                        ...prev,
                                        new_password_confirmation: e.target.value
                                    }))}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={changePasswordMutation.isPending}
                                style={{ width: '170px' }}
                            >
                                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
