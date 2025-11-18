import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';

export default function RolesSettings() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Roles</CardTitle>
                <CardDescription>Manage user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg font-medium">Roles Management</p>
                    <p className="text-sm mt-2">This feature will be implemented soon</p>
                </div>
            </CardContent>
        </Card>
    );
}
