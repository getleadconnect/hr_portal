import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../../components/ui/select';
import { ArrowLeft } from 'lucide-react';

export default function UserForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        user_name: '',
        email: '',
        countrycode: '+91',
        mobile: '',
        password: '',
        role_id: '2',
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch user data if editing
    const { data: userData } = useQuery({
        queryKey: ['user', id],
        queryFn: async () => {
            const response = await api.get(`/admin/users/${id}`);
            return response.data.data;
        },
        enabled: isEditMode,
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                user_name: userData.user_name || '',
                email: userData.email || '',
                countrycode: userData.countrycode || '+91',
                mobile: userData.mobile || '',
                password: '',
                role_id: userData.role_id?.toString() || '2',
            });
        }
    }, [userData]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        try {
            const submitData = { ...formData };

            // Don't send empty password in edit mode
            if (isEditMode && !submitData.password) {
                delete submitData.password;
            }

            if (isEditMode) {
                await api.put(`/admin/users/${id}`, submitData);
                alert('User updated successfully');
            } else {
                await api.post('/admin/users', submitData);
                alert('User created successfully');
            }

            navigate('/users');
        } catch (error) {
            if (error.response?.status === 422) {
                const errorData = error.response.data;
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else if (errorData.message) {
                    alert(errorData.message);
                }
            } else {
                alert(error.response?.data?.message || 'An error occurred');
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
                    onClick={() => navigate('/users')}
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="font-bold tracking-tight" style={{ fontSize: '1.25rem' }}>
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode ? 'Update user information' : 'Fill in the user details'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>User Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="user_name">User Name *</Label>
                            <Input
                                id="user_name"
                                name="user_name"
                                value={formData.user_name}
                                onChange={handleInputChange}
                                required
                                maxLength={25}
                            />
                            {errors.user_name && <p className="text-sm text-destructive">{errors.user_name[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="countrycode">Country Code</Label>
                            <Input
                                id="countrycode"
                                name="countrycode"
                                value={formData.countrycode}
                                onChange={handleInputChange}
                                placeholder="+91"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number *</Label>
                            <Input
                                id="mobile"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.mobile && <p className="text-sm text-destructive">{errors.mobile[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Password {isEditMode ? '(leave blank to keep current)' : '*'}
                            </Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required={!isEditMode}
                                minLength={6}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password[0]}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role_id">Role *</Label>
                            <Select
                                value={formData.role_id}
                                onValueChange={(value) => handleSelectChange('role_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Admin</SelectItem>
                                    <SelectItem value="2">User</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.role_id && <p className="text-sm text-destructive">{errors.role_id[0]}</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Form Actions */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/users')}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
