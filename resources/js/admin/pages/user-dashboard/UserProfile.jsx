import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../../components/ui/dialog';
import { Mail, Phone, Building, Briefcase, Calendar, Lock, MapPin, User, Cake, Heart } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserProfile() {
    const queryClient = useQueryClient();
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        new_password: '',
        new_password_confirmation: '',
    });

    // Fetch user profile
    const { data: profile, isLoading } = useQuery({
        queryKey: ['user-profile'],
        queryFn: async () => {
            const response = await api.get('/admin/user/profile');
            return response.data.data;
        },
    });

    // Change password mutation
    const changePasswordMutation = useMutation({
        mutationFn: (data) => api.post('/admin/user/change-password', data),
        onSuccess: () => {
            setIsPasswordDialogOpen(false);
            setPasswordData({
                new_password: '',
                new_password_confirmation: '',
            });
            toast.success('Password changed successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to change password');
        },
    });

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            toast.error('New passwords do not match');
            return;
        }
        changePasswordMutation.mutate(passwordData);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    if (isLoading) {
        return (
            <div className="space-y-4 sm:space-y-6">
                <div className="animate-pulse">
                    <div className="bg-gradient-to-r from-gray-200 to-gray-300 h-32 sm:h-40 rounded-t-xl"></div>
                    <Card className="relative -mt-16 mx-3 sm:mx-6 p-4 sm:p-6">
                        <div className="flex flex-col items-center">
                            <div className="h-24 w-24 sm:h-28 sm:w-28 bg-gray-200 rounded-full border-4 border-white -mt-16 sm:-mt-20"></div>
                            <div className="h-6 w-40 bg-gray-200 rounded mt-4"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded mt-2"></div>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {/* Profile Header with Gradient */}
            <div className="relative">
                <div className="h-32 sm:h-40 rounded-xl" style={{ backgroundColor: '#b6def080' }}></div>

                <Card className="relative -mt-16 mx-3 sm:mx-6 bg-white shadow-lg">
                    <div className="p-4 sm:p-6">
                        {/* Avatar and Basic Info */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16 sm:-mt-20" style={{ paddingTop: '10px' }}>
                            {profile?.employee?.profile_image ? (
                                <img
                                    src={profile.employee.profile_image}
                                    alt={profile?.user_name}
                                    className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover border-4 border-white shadow-lg"
                                />
                            ) : (
                                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl sm:text-3xl font-bold text-white border-4 border-white shadow-lg">
                                    {getInitials(profile?.user_name)}
                                </div>
                            )}

                            <div className="flex-1 text-center sm:text-left pb-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ lineHeight: '1.3rem' }}>{profile?.user_name}</h1>
                                <p className="text-sm text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-1">
                                    <Briefcase className="h-4 w-4" />
                                    {profile?.employee?.designation || 'Staff'}
                                </p>
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setIsPasswordDialogOpen(true)}
                                className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Change Password
                            </Button>
                        </div>

                        {/* Quick Info Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t">
                            <div className="text-center p-3 rounded-lg bg-blue-50">
                                <User className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Employee ID</p>
                                <p className="text-sm font-semibold text-gray-900">{profile?.employee?.employee_id || '-'}</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-green-50">
                                <Building className="h-5 w-5 text-green-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Department</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{profile?.employee?.department || '-'}</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-purple-50">
                                <MapPin className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{profile?.employee?.work_location || '-'}</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-orange-50">
                                <Calendar className="h-5 w-5 text-orange-600 mx-auto mb-1" />
                                <p className="text-xs text-gray-500">Joined</p>
                                <p className="text-sm font-semibold text-gray-900">{profile?.employee?.join_date ? new Date(profile.employee.join_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Contact Information */}
            <Card className="bg-white shadow-sm">
                <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        Contact Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Email Address</p>
                                <p className="text-sm font-medium text-gray-900 truncate">{profile?.email || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                                <Phone className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
                                <p className="text-sm font-medium text-gray-900">{profile?.mobile ? `${profile?.countrycode || ''} ${profile?.mobile}` : '-'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Personal Information */}
            {profile?.employee && (
                <Card className="bg-white shadow-sm">
                    <div className="p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <User className="h-4 w-4 text-purple-600" />
                            </div>
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-pink-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Full Name</p>
                                    <p className="text-sm font-medium text-gray-900 truncate">{profile.employee.full_name || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                    <Cake className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Birth</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(profile.employee.date_of_birth)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                                    <User className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Gender</p>
                                    <p className="text-sm font-medium text-gray-900">{profile.employee.gender || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                    <Heart className="h-5 w-5 text-red-500" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Marital Status</p>
                                    <p className="text-sm font-medium text-gray-900">{profile.employee.marital_status || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                    <Calendar className="h-5 w-5 text-teal-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Date of Joining</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(profile.employee.join_date)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                                <div className="h-10 w-10 rounded-full bg-cyan-100 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-cyan-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Work Location</p>
                                    <p className="text-sm font-medium text-gray-900">{profile.employee.work_location || '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            )}

            {/* Change Password Dialog */}
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
                <DialogContent className="w-[400px] max-w-[95vw]">
                    <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>Enter a new password for your account</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePasswordSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <Label>New Password *</Label>
                            <Input
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-1">
                            <Label>Confirm New Password *</Label>
                            <Input
                                type="password"
                                value={passwordData.new_password_confirmation}
                                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirmation: e.target.value }))}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={changePasswordMutation.isPending}>
                                {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
