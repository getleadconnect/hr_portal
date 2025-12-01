import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Switch } from '../../components/ui/switch';
import { Label } from '../../components/ui/label';
import { Bell, Send, FileText, RefreshCw } from 'lucide-react';

const getSettingIcon = (key) => {
    switch (key) {
        case 'telegram_new_application':
            return <FileText className="h-5 w-5 text-blue-500" />;
        case 'telegram_status_change':
            return <RefreshCw className="h-5 w-5 text-orange-500" />;
        default:
            return <Send className="h-5 w-5 text-gray-500" />;
    }
};

const getSettingLabel = (key) => {
    switch (key) {
        case 'telegram_new_application':
            return 'New Job Application';
        case 'telegram_status_change':
            return 'Application Status Change';
        default:
            return key;
    }
};

const getSettingBgColor = (key) => {
    switch (key) {
        case 'telegram_new_application':
            return 'bg-blue-50 border-blue-200';
        case 'telegram_status_change':
            return 'bg-orange-50 border-orange-200';
        default:
            return 'bg-gray-50 border-gray-200';
    }
};

export default function NotificationsSettings() {
    const queryClient = useQueryClient();

    // Fetch notification settings
    const { data: settings, isLoading } = useQuery({
        queryKey: ['notification-settings'],
        queryFn: async () => {
            const response = await api.get('/admin/notification-settings');
            return response.data.data;
        },
    });

    // Update setting mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, value }) => api.put(`/admin/notification-settings/${id}`, { setting_value: value }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notification-settings'] });
            toast.success('Setting updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update setting');
        }
    });

    const handleToggle = (setting) => {
        updateMutation.mutate({
            id: setting.id,
            value: !setting.setting_value
        });
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="text-center py-8">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Send className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Telegram Notifications</CardTitle>
                            <CardDescription>
                                Configure which events trigger Telegram notifications
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    {settings?.map((setting) => (
                        <div
                            key={setting.id}
                            className={`flex items-center justify-between p-4 rounded-lg border ${getSettingBgColor(setting.setting_key)}`}
                        >
                            <div className="flex items-center gap-3">
                                {getSettingIcon(setting.setting_key)}
                                <div>
                                    <Label htmlFor={setting.setting_key} className="text-sm font-medium cursor-pointer">
                                        {getSettingLabel(setting.setting_key)}
                                    </Label>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {setting.description}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id={setting.setting_key}
                                checked={Boolean(setting.setting_value)}
                                onCheckedChange={() => handleToggle(setting)}
                                disabled={updateMutation.isPending}
                            />
                        </div>
                    ))}

                    {(!settings || settings.length === 0) && (
                        <div className="text-center py-8 text-muted-foreground">
                            No notification settings found
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Note</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Make sure Telegram Bot Token and Chat ID are configured in the environment settings for notifications to work properly.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
