# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an HR Portal application for managing job applications and employee records. The application uses:
- **Backend**: Laravel 11 with MySQL database
- **Frontend Admin Panel**: React 19 + Vite + Shadcn UI (Radix UI components)
- **Frontend Public Form**: Blade templates with Bootstrap 5
- **Authentication**: Laravel Sanctum (API token-based)
- **State Management**: TanStack Query (React Query) for server state
- **File Storage**: DigitalOcean Spaces (S3-compatible)
- **Styling**: Tailwind CSS

## Architecture

### Backend Structure
The application follows a strict RESTful API architecture:
- **API Controllers**: All admin functionality is in `app/Http/Controllers/Api/Admin/`
- **Models**: Located in `app/Models/` with Eloquent ORM
- **Routes**: API routes in `routes/api.php`, web routes in `routes/web.php`
- **Middleware**: Sanctum authentication on all `/api/admin/*` routes

### Frontend Structure
- **Admin SPA**: Single-page React application in `resources/js/admin/`
- **Components**: Shadcn UI components in `resources/js/admin/components/ui/`
- **Pages**: Feature-based pages in `resources/js/admin/pages/`
- **API Service**: Axios instance with interceptors in `resources/js/admin/services/api.js`
- **Public Form**: Traditional Blade views in `resources/views/` (separate from admin)

### Key Architectural Principles

**IMPORTANT**: When writing backend code:
1. **ALWAYS use controller methods** - Never write business logic directly in routes
2. **ALWAYS use Eloquent models** - Never write raw SQL queries in routes
3. **Follow the existing controller pattern** - See `app/Http/Controllers/Api/Admin/EmployeeController.php` as reference
4. **Use model validation rules** - Define validation rules as static methods in models (e.g., `Employee::createRules()`)
5. **Return consistent JSON responses** - Always include `success` and `message`/`data` keys

## Development Commands

### Starting Development Environment
```bash
# Start all services (Laravel server, queue, logs, Vite)
composer dev

# Or start individually:
php artisan serve                    # Laravel dev server (port 8000)
npm run dev                          # Vite dev server for assets
php artisan queue:listen --tries=1   # Queue worker
php artisan pail --timeout=0         # Real-time logs
```

### Building for Production
```bash
npm run build    # Compiles React app and Tailwind CSS
```

### Database
```bash
php artisan migrate              # Run migrations
php artisan migrate:fresh        # Reset database and run all migrations
php artisan db:seed             # Run seeders
```

### Code Quality
```bash
php artisan pint    # Laravel Pint code formatter
```

### Testing
```bash
php artisan test              # Run PHPUnit tests
./vendor/bin/phpunit          # Alternative test runner
```

## API Architecture Patterns

### Controller Method Structure

All API controllers follow this pattern:

```php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModelName;
use Illuminate\Http\Request;
use Validator;

class ResourceController extends Controller
{
    // List with pagination and search
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $search = $request->input('search', '');

        $query = ModelName::orderBy('id', 'DESC');

        if ($search) {
            $query->where('field', 'LIKE', "%{$search}%");
        }

        $data = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    // Show single resource
    public function show($id)
    {
        $resource = ModelName::find($id);

        if (!$resource) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $resource
        ]);
    }

    // Create new resource
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), ModelName::createRules());

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $resource = ModelName::create($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Created successfully',
                'data' => $resource
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Update resource
    public function update(Request $request, $id)
    {
        $resource = ModelName::find($id);

        if (!$resource) {
            return response()->json([
                'success' => false,
                'message' => 'Resource not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), ModelName::updateRules($id));

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        try {
            $resource->update($request->all());

            return response()->json([
                'success' => true,
                'message' => 'Updated successfully',
                'data' => $resource
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Delete resource
    public function destroy($id)
    {
        try {
            $resource = ModelName::find($id);

            if (!$resource) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found'
                ], 404);
            }

            $resource->delete();

            return response()->json([
                'success' => true,
                'message' => 'Deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    // Toggle status
    public function toggleStatus($id)
    {
        try {
            $resource = ModelName::find($id);

            if (!$resource) {
                return response()->json([
                    'success' => false,
                    'message' => 'Resource not found'
                ], 404);
            }

            $newStatus = $resource->status == 1 ? 0 : 1;
            $resource->update(['status' => $newStatus]);

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully',
                'data' => ['status' => $newStatus]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
```

### Model Pattern

All models follow this structure:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ModelName extends Model
{
    use SoftDeletes;  // Optional: for soft deletes

    protected $guarded = [];
    protected $table = 'table_name';

    // Status constants
    const ACTIVE = 1;
    const INACTIVE = 0;

    // Validation rules for creation
    public static function createRules()
    {
        return [
            'field' => 'required|string|max:255',
            // ... more rules
        ];
    }

    // Validation rules for updates
    public static function updateRules($id)
    {
        return [
            'field' => 'required|string|unique:table,field,' . $id,
            // ... more rules
        ];
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', self::ACTIVE);
    }
}
```

### File Upload Pattern

When handling file uploads (used in Employee controller):

```php
// In controller method
$files = ['profile_image', 'aadhar_file', 'pancard_file'];

foreach ($files as $fileField) {
    if ($request->hasFile($fileField)) {
        // Delete old file if updating
        if (isset($employee) && $employee->$fileField) {
            Storage::disk('spaces')->delete($employee->$fileField);
        }

        $file = $request->file($fileField);
        $fileName = time() . '_' . $fileField . '_' . $file->getClientOriginalName();
        $filePath = 'Resume-Getlead/employees/' . $fileName;
        Storage::disk('spaces')->put($filePath, file_get_contents($file), 'public');
        $data[$fileField] = $filePath;
    }
}
```

Files are stored in DigitalOcean Spaces. File URLs use `config('constants.file_path')` prefix.

## Frontend React Patterns

### Data Fetching with React Query

```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

// Fetch list with pagination and search
const { data, isLoading } = useQuery({
    queryKey: ['resource-name', page, search, perPage],
    queryFn: async () => {
        const response = await api.get('/admin/resource', {
            params: { page, search, per_page: perPage }
        });
        return response.data.data;
    },
});

// Create mutation
const queryClient = useQueryClient();
const createMutation = useMutation({
    mutationFn: (data) => api.post('/admin/resource', data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['resource-name'] });
        toast.success('Created successfully');
    },
    onError: (error) => {
        toast.error(error.response?.data?.message || 'Error occurred');
    }
});

// Update mutation
const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/admin/resource/${id}`, data),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['resource-name'] });
        toast.success('Updated successfully');
    }
});

// Delete mutation
const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/resource/${id}`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['resource-name'] });
        toast.success('Deleted successfully');
    }
});

// Toggle status mutation
const toggleStatusMutation = useMutation({
    mutationFn: (id) => api.patch(`/admin/resource/${id}/toggle-status`),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['resource-name'] });
        toast.success('Status updated');
    }
});
```

### File Upload in React

```jsx
const handleSubmit = async (data) => {
    const formData = new FormData();

    // Add text fields
    Object.keys(data).forEach(key => {
        if (data[key] && typeof data[key] !== 'object') {
            formData.append(key, data[key]);
        }
    });

    // Add files
    if (fileInputRef.current?.files[0]) {
        formData.append('profile_image', fileInputRef.current.files[0]);
    }

    // For updates, add _method field
    if (isEdit) {
        formData.append('_method', 'PUT');
    }

    await api.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};
```

### DataTable Controls Pattern

Use the reusable `DataTableControls` component for consistent table UX:

```jsx
import DataTableControls from '../../components/DataTableControls';

<CardHeader>
    <DataTableControls
        perPage={perPage}
        onPerPageChange={(value) => {
            setPerPage(value);
            setPage(1);
        }}
        search={search}
        onSearchChange={(value) => {
            setSearch(value);
            setPage(1);
        }}
        searchPlaceholder="Search records..."
    />
</CardHeader>
```

### Toast Notifications

Always use `react-toastify` for user feedback:

```jsx
import { toast } from 'react-toastify';

toast.success('Operation successful');
toast.error('Operation failed');
toast.info('Information message');
toast.warning('Warning message');
```

### Confirmation Dialogs

Use Shadcn AlertDialog for destructive actions:

```jsx
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../../components/ui/alert-dialog';

<AlertDialog open={isOpen} onOpenChange={setIsOpen}>
    <AlertDialogContent>
        <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone.
            </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
    </AlertDialogContent>
</AlertDialog>
```

## API Endpoints Reference

All admin API endpoints are prefixed with `/api/admin/` and protected by Sanctum authentication.

### Authentication
- `POST /api/admin/login` - Login (public)
- `POST /api/admin/logout` - Logout
- `GET /api/admin/user` - Get authenticated user

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Jobs (formerly Applications)
- `GET /api/admin/applications` - List job applications (pagination, search)
- `GET /api/admin/applications/{id}` - Get single job application
- `DELETE /api/admin/applications/{id}` - Delete job application

**Note**: The menu displays "Jobs" but the API endpoints still use `/applications` for consistency.

### Employees
- `GET /api/admin/employees` - List employees (pagination, search)
- `POST /api/admin/employees` - Create employee (multipart/form-data)
- `GET /api/admin/employees/{id}/export-pdf` - Export employee details to PDF
- `GET /api/admin/employees/{id}` - Get single employee
- `POST /api/admin/employees/{id}` - Update employee (multipart/form-data with _method=PUT)
- `DELETE /api/admin/employees/{id}` - Delete employee
- `PATCH /api/admin/employees/{id}/toggle-status` - Toggle employee status

### Users
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `GET /api/admin/users/{id}` - Get single user
- `PUT /api/admin/users/{id}` - Update user
- `DELETE /api/admin/users/{id}` - Delete user
- `PATCH /api/admin/users/{id}/toggle-status` - Toggle user status

### Job Categories
- `GET /api/admin/job-categories` - List job categories
- `POST /api/admin/job-categories` - Create job category
- `GET /api/admin/job-categories/{id}` - Get single job category
- `PUT /api/admin/job-categories/{id}` - Update job category
- `DELETE /api/admin/job-categories/{id}` - Delete job category
- `PATCH /api/admin/job-categories/{id}/toggle-status` - Toggle job category status

### Settings Resources (Departments, Designations, Qualifications)
Each follows the same pattern:
- `GET /api/admin/{resource}` - List with pagination
- `POST /api/admin/{resource}` - Create
- `GET /api/admin/{resource}/{id}` - Get single
- `PUT /api/admin/{resource}/{id}` - Update
- `DELETE /api/admin/{resource}/{id}` - Delete
- `PATCH /api/admin/{resource}/{id}/toggle-status` - Toggle status

### Utility
- `GET /api/admin/countries` - Get all countries for dropdown

## Database Schema

### Key Tables
- **employees** - Employee records with personal, contact, employment, and document fields
  - Uses foreign keys: `qualification_id`, `department_id`, `designation_id` (NOT string names)
  - Stores document file paths for Aadhar, PAN, Experience Certificate, and Other documents
  - Has `starting_salary` field (decimal)
  - Does NOT have verification fields (verified_by, verification_date, verification_remarks)
- **applications** - Job application submissions from public form
- **users** - Admin users with role-based access
- **job_categories** - Job category master data
- **departments** - Department master data with `department_name` column
- **designations** - Designation master data with `designation_name` column
- **qualifications** - Qualification master data with `qualification` column
- **countries** - Country master data
- **personal_access_tokens** - Sanctum authentication tokens

All master data tables have `status` field (1=active, 0=inactive).

### Important: Employee Foreign Keys
Employees table uses **foreign key IDs** to reference master data:
- `qualification_id` → references `qualifications.id`
- `department_id` → references `departments.id`
- `designation_id` → references `designations.id`

When displaying data, fetch the related names from the respective tables.

## Important Conventions

### Status Values
- Active: `1`
- Inactive: `0`

Always use model constants when available:
```php
const ACTIVE = 1;
const INACTIVE = 0;
```

### Date Formats
- **Database**: `Y-m-d` (YYYY-MM-DD)
- **Display**: `d-m-Y` (DD-MM-YYYY)
- Use Carbon for date manipulation

### Response Structure
All API responses follow this format:

**Success:**
```json
{
    "success": true,
    "data": { /* response data */ },
    "message": "Optional success message"
}
```

**Error:**
```json
{
    "success": false,
    "message": "Error message"
}
```

### HTTP Status Codes
- `200` - Success (GET, PUT, PATCH, DELETE)
- `201` - Created (POST)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (inactive account)
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

## Authentication Flow

1. User logs in via `/api/admin/login` with email and password
2. Backend validates credentials and returns Sanctum token
3. Frontend stores token in `localStorage` as `admin_token`
4. Frontend includes token in all subsequent requests via Authorization header
5. Axios interceptor automatically adds token to requests
6. 401 responses automatically log user out and redirect to login

## File Upload Configuration

Files are stored in **DigitalOcean Spaces** (S3-compatible storage).

**Configuration**: Check `config/filesystems.php` for Spaces configuration.

**File paths**:
- Upload path: `Resume-Getlead/employees/`
- URL generation: Use `config('constants.file_path')` prefix

**Accepted formats**:
- Images: `jpeg`, `png`, `jpg` (max 2MB)
- Documents: `pdf`, `jpeg`, `png`, `jpg` (max 2MB)

## PDF Export Feature

Employee details can be exported to PDF using DomPDF:

**Endpoint**: `GET /api/admin/employees/{id}/export-pdf`

**Features**:
- Exports complete employee information to PDF
- Embeds images (profile, Aadhar, PAN, certificates) directly in PDF
- Documents displayed in 2x2 grid format (Aadhar/PAN in first row, Experience/Other in second row)
- Professional layout with color-coded sections
- Auto-generates filename: `employee_{employee_id}.pdf`

**Configuration**:
- DomPDF config: `config/dompdf.php`
- `enable_remote` is set to `true` to allow loading remote images
- PDF template: `resources/views/pdf/employee-details.blade.php`

**Frontend**:
- Export button on employee details page triggers download
- Uses fetch API with Authorization header
- Creates blob and triggers browser download

## Development Environment

### XAMPP/LAMPP Setup
This project runs on XAMPP/LAMPP stack:
- **Web root**: `/opt/lampp/htdocs/AI/hr_portal`
- **Database**: MySQL via XAMPP
- **PHP**: Version 8.2+

### Node.js Requirements
- Node.js 18+ recommended
- Package manager: npm

### Browser Requirements
- Modern browsers with ES6+ support
- Chrome/Firefox/Safari/Edge (latest versions)

## Common Tasks

### Adding a New Resource

1. **Create Migration**: `php artisan make:migration create_resources_table`
2. **Create Model**: `php artisan make:model Resource` with validation rules
3. **Create Controller**: `php artisan make:controller Api/Admin/ResourceController`
   - Follow the controller pattern above
   - Implement all CRUD methods
4. **Add Routes**: Add RESTful routes to `routes/api.php`
5. **Create React Components**:
   - List page in `resources/js/admin/pages/resources/ResourcesList.jsx`
   - Form page in `resources/js/admin/pages/resources/ResourceForm.jsx`
6. **Add Navigation**: Update `resources/js/admin/components/layouts/AdminLayout.jsx`
7. **Add Routes**: Update `resources/js/admin/App.jsx`

### Adding a Shadcn UI Component

If component not already in project:
1. Copy component code from [ui.shadcn.com](https://ui.shadcn.com)
2. Place in `resources/js/admin/components/ui/[component-name].jsx`
3. Install any required dependencies
4. Import and use in your page

### Debugging

**Backend:**
- Check Laravel logs: `storage/logs/laravel.log`
- Use `php artisan pail` for real-time logs
- Enable debug mode: `APP_DEBUG=true` in `.env`

**Frontend:**
- Browser DevTools Console for JavaScript errors
- React Query DevTools (already included) for data fetching issues
- Network tab for API request/response inspection

**API Testing:**
- Use Postman or similar tool to test endpoints directly
- Get auth token from login endpoint first
- Add token to Authorization header: `Bearer {token}`

## UI/UX Design Guidelines

### Employee Details Page
The employee details page follows a modern, beautified design:

**Header Section**:
- Background color: `#e7f4f4` (light cyan/turquoise)
- Employee name: Dark gray (`text-gray-800`)
- Employee ID: Teal color (`text-teal-700`)
- Profile image: Circular with teal border
- Status badge: Green for active, gray for inactive
- Action buttons: Teal theme with white backgrounds

**Information Cards**:
- All section titles use light blue (`text-blue-600`)
- Each section has color-coded gradient header backgrounds:
  - Personal Information: Blue gradient
  - Contact Information: Green gradient
  - Employment Details: Purple gradient
  - Additional Details: Amber gradient
  - Documents: Cyan gradient
- Cards have shadow effects and hover transitions
- Fields displayed with hover effects on each row

**Documents Section**:
- 4-column responsive grid (1 column mobile, 2 tablet, 4 desktop)
- Each document has color-coded borders:
  - Aadhar: Blue border with blue gradient background
  - PAN: Green border with green gradient background
  - Experience: Purple border with purple gradient background
  - Other: Amber border with amber gradient background
- Images show with hover scale effect
- Non-images show "View Document" button

### Page Titles
- Employee list page: "Employees"
- Employee detail/edit pages: "Employee Details"
- Jobs (Applications): "Jobs"

## Troubleshooting

### CORS Issues
- Check `config/cors.php` - should allow all origins in development
- Ensure `php artisan config:cache` is run after CORS changes

### Authentication Issues
- Clear browser localStorage
- Check token expiration
- Verify Sanctum configuration in `config/sanctum.php`

### File Upload Issues
- Check DigitalOcean Spaces credentials in `.env`
- Verify file size limits in `php.ini`
- Check file permissions in upload directories

### PDF Export Issues
- Verify DomPDF is installed: `composer show barryvdh/laravel-dompdf`
- Check `enable_remote` is `true` in `config/dompdf.php`
- Ensure remote image URLs are accessible
- Check PDF template exists at `resources/views/pdf/employee-details.blade.php`

### Build Issues
- Clear Vite cache: `rm -rf node_modules/.vite`
- Clear Laravel cache: `php artisan cache:clear && php artisan config:clear`
- Rebuild assets: `npm run build`

## Recent Updates

### November 14, 2025

#### 1. Job Openings List - Padding Consistency
**File**: `resources/js/admin/pages/openings/OpeningsList.jsx`

Updated CardHeader and CardContent padding to match employees list:
- CardHeader: `className="space-y-4 p-3"`
- CardContent: `className="p-3"`

This ensures consistent padding across all list pages in the application.

#### 2. Employee Edit Form - Fixed Data Population and Update Issues
**File**: `resources/js/admin/pages/employees/EmployeeForm.jsx`

**Issue 1**: PUT method error when updating employee
- **Problem**: FormData included `_method: 'PUT'` field causing "PUT method not supported" error
- **Solution**: Removed the `_method` field since the route at `routes/api.php:40` is already configured as POST for handling multipart/form-data file uploads
- **Code Change** (line 241-245):
  ```jsx
  // Before:
  if (isEditMode) {
      submitData.append('_method', 'PUT');
      await api.post(`/admin/employees/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
  }

  // After:
  if (isEditMode) {
      await api.post(`/admin/employees/${id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });
  }
  ```

**Issue 2**: Dropdown selects not showing existing employee data
- **Problem**: Select components from Shadcn UI weren't re-rendering when employee data loaded, so existing values weren't displayed
- **Solution**: Added dynamic `key` props to all Select components to force re-render when values change
- **Affected Dropdowns**:
  - Gender (line 338): `key={`gender-${formData.gender || 'empty'}`}`
  - Marital Status (line 356): `key={`marital-${formData.marital_status || 'empty'}`}`
  - Qualification (line 375): `key={`qualification-${formData.qualification_id || 'empty'}`}`
  - Country (line 525): `key={`country-${formData.country || 'empty'}`}`
  - Job Title (line 587): `key={`job-title-${formData.job_title || 'empty'}`}`
  - Department (line 607): `key={`department-${formData.department_id || 'empty'}`}`
  - Designation (line 627): `key={`designation-${formData.designation_id || 'empty'}`}`

**Pattern Used**:
```jsx
<Select
    key={`field-name-${formData.fieldName || 'empty'}`}
    value={formData.fieldName}
    onValueChange={(value) => handleSelectChange('fieldName', value)}
>
    <SelectTrigger>
        <SelectValue placeholder="Select..." />
    </SelectTrigger>
    <SelectContent>
        {/* Options */}
    </SelectContent>
</Select>
```

#### 3. Settings Page - Mobile Responsive Design
**Files**:
- `resources/js/admin/pages/Settings.jsx`
- `resources/js/admin/pages/settings/UserSettings.jsx`

**Main Settings Navigation**:
- **Mobile** (< 640px): Horizontal scrolling tabs with icons and labels
  - Tabs scroll horizontally to fit all options
  - Active tab has border and background highlight
  - Touch-friendly button sizes
- **Desktop** (≥ 640px): Traditional vertical sidebar navigation
  - Fixed width sidebar (w-56)
  - Vertical stacked menu items

**Settings Structure Changes**:
```jsx
// Mobile horizontal tabs (visible only on small screens)
<div className="sm:hidden overflow-x-auto px-2">
    <div className="flex gap-2 min-w-max pb-2">
        {tabs.map((tab) => (
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg...">
                <Icon className="h-4 w-4" />
                {tab.label}
            </button>
        ))}
    </div>
</div>

// Desktop sidebar (hidden on small screens)
<div className="hidden sm:block w-56 shrink-0">
    <nav className="space-y-1">
        {/* Vertical menu items */}
    </nav>
</div>
```

**UserSettings Component**:
- **CardHeader**: Responsive layout
  - Stacks vertically on mobile
  - "Add User" button full-width on mobile, auto-width on desktop
  - Responsive text sizing: `text-base sm:text-lg`
- **Table vs Card Views**:
  - **Desktop** (≥ 768px): Traditional table with all columns
  - **Mobile** (< 768px): Card-based layout for better readability
    - User name prominently displayed
    - Email and mobile in smaller, muted text
    - Role and Status badges
    - Created date
    - Action dropdown in top-right corner
- **Pagination**: Responsive
  - Stacks vertically on mobile
  - Horizontal on desktop
  - Responsive text sizes: `text-xs sm:text-sm`

**Mobile Card Pattern**:
```jsx
<div className="md:hidden space-y-3">
    {filteredUsers.map((user) => (
        <div key={user.id} className="border rounded-lg p-3 space-y-2 bg-card">
            <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                    <div className="font-medium text-sm">{user.user_name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">{user.mobile}</div>
                </div>
                <DropdownMenu>
                    {/* Actions */}
                </DropdownMenu>
            </div>
            <div className="flex gap-2 flex-wrap">
                <Badge>{getRoleName(user.role_id)}</Badge>
                <Badge>{user.status === 1 ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
                Created: {user.created_at}
            </div>
        </div>
    ))}
</div>
```

**Responsive Design Breakpoints**:
- **Mobile**: < 640px (sm breakpoint)
- **Tablet**: 640px - 768px
- **Desktop**: ≥ 768px (md breakpoint)

**Key Responsive Features**:
- Horizontal scrolling navigation on mobile
- Card-based layouts for better mobile readability
- Touch-friendly button and tap target sizes
- Responsive typography scaling
- Adaptive spacing and padding
- Full-width buttons on mobile, auto-width on desktop

**Note**: Other settings sub-pages (Job Categories, Departments, Designations, Qualifications) still use table layouts with horizontal scroll. These can be updated with card views following the UserSettings pattern if needed.

### November 28, 2025

#### 1. Navigation Menu - Employees Dropdown Structure
**File**: `resources/js/admin/components/layouts/AdminLayout.jsx`

Changed "Employees" from a single menu item to a dropdown menu with sub-options:

**Before**:
```jsx
{ path: '/employees', label: 'Employees', icon: Users },
{ path: '/attendance', label: 'Attendance', icon: CalendarCheck },
```

**After**:
```jsx
{
    label: 'Employees',
    icon: Users,
    children: [
        { path: '/employees', label: 'Employee List' },
        { path: '/attendance', label: 'Attendance' },
        { path: '/leave-requests', label: 'Leave Requests' }
    ]
},
```

**Menu Structure**:
```
Dashboard
Jobs ▼
  ├── Applications
  └── Openings
Employees ▼
  ├── Employee List
  ├── Attendance
  └── Leave Requests
Settings
```

#### 2. Attendance List - DataTableControls Added
**File**: `resources/js/admin/pages/attendance/AttendanceList.jsx`

Added DataTableControls component for consistent table UX with "Show entries" dropdown and search box.

**Layout Order**:
1. Department filter dropdown
2. Status filter dropdown
3. DataTableControls (Show entries + Search)
4. Data table

**Code Changes**:
- Added import: `import DataTableControls from '../../components/DataTableControls';`
- Replaced inline search input with DataTableControls component
- Moved filters above DataTableControls

```jsx
<CardHeader className="space-y-4 p-3">
    {/* Filters - Department and Status */}
    <div className="flex flex-wrap items-center gap-3">
        <Select value={departmentId} ...>
            {/* All Departments dropdown */}
        </Select>
        <Select value={statusFilter} ...>
            {/* All Status dropdown */}
        </Select>
    </div>
    {/* DataTable Controls - Show entries and Search */}
    <DataTableControls
        perPage={perPage}
        onPerPageChange={(value) => { setPerPage(value); setPage(1); }}
        search={search}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        searchPlaceholder="Search employees..."
    />
</CardHeader>
```

#### 3. Leave Requests - New Feature
Added complete Leave Requests management module for employee leave tracking.

**Database Table**: `leave_requests`
```sql
CREATE TABLE leave_requests (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    employee_id BIGINT UNSIGNED NOT NULL,
    leave_type ENUM('Annual Leave', 'Sick Leave', 'Casual Leave') NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    days INT NOT NULL,
    reason TEXT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT UNSIGNED NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);
```

**Model**: `app/Models/LeaveRequest.php`
- Uses SoftDeletes
- Status constants: `STATUS_PENDING`, `STATUS_APPROVED`, `STATUS_REJECTED`
- Leave type constants: `TYPE_ANNUAL`, `TYPE_SICK`, `TYPE_CASUAL`
- Relationships: `employee()`, `approver()`
- Validation rules: `createRules()`, `updateRules($id)`
- Scopes: `scopeByStatus()`, `scopeByEmployee()`, `scopeByLeaveType()`

**Controller**: `app/Http/Controllers/Api/Admin/LeaveRequestController.php`
- `index()` - List with filters (status, leave_type, department_id) and search
- `store()` - Create new leave request with overlap check
- `show()` - View single leave request
- `update()` - Update (only pending requests can be updated)
- `destroy()` - Delete leave request
- `approve()` - Approve pending request (sets approved_by, approved_at)
- `reject()` - Reject pending request
- `getEmployees()` - Get active employees for dropdown

**API Routes** (in `routes/api.php`):
```php
// Leave Requests
Route::get('/leave-requests', [LeaveRequestController::class, 'index']);
Route::post('/leave-requests', [LeaveRequestController::class, 'store']);
Route::get('/leave-requests/employees', [LeaveRequestController::class, 'getEmployees']);
Route::get('/leave-requests/{id}', [LeaveRequestController::class, 'show']);
Route::put('/leave-requests/{id}', [LeaveRequestController::class, 'update']);
Route::delete('/leave-requests/{id}', [LeaveRequestController::class, 'destroy']);
Route::patch('/leave-requests/{id}/approve', [LeaveRequestController::class, 'approve']);
Route::patch('/leave-requests/{id}/reject', [LeaveRequestController::class, 'reject']);
```

**Frontend Page**: `resources/js/admin/pages/leave-requests/LeaveRequestList.jsx`

**Features**:
- List view with employee avatar/initials, leave type badge, dates, days, reason (with tooltip), status badge
- Filters: Department and Leave Type dropdowns
- Status filtering via clickable count tabs
- DataTableControls: Show entries (10/25/50/100) and search box
- Pagination
- Add Leave Request dialog with:
  - Employee dropdown
  - Leave type selection (Annual/Sick/Casual)
  - From date, To date (auto-calculates days)
  - Reason textarea
- Edit Leave Request (only for pending requests)
- Delete with confirmation
- **Approve button** (green checkmark) - Shows confirmation dialog with leave details
- **Reject button** (red X) - Shows confirmation dialog

**Status Badges**:
- PENDING: Yellow background (`bg-yellow-100 text-yellow-700`)
- APPROVED: Green background (`bg-green-100 text-green-700`)
- REJECTED: Red background (`bg-red-100 text-red-700`)

**Leave Type Badges**:
- Annual Leave: Blue background (`bg-blue-100 text-blue-700`)
- Sick Leave: Orange background (`bg-orange-100 text-orange-700`)
- Casual Leave: Purple background (`bg-purple-100 text-purple-700`)

**React Router** (in `App.jsx`):
```jsx
import LeaveRequestList from './pages/leave-requests/LeaveRequestList';

// In getPageTitle function:
if (pathname.startsWith('/leave-requests')) return 'Leave Requests';

// In Routes:
<Route path="/leave-requests" element={<LeaveRequestList />} />
```

**Action Buttons Logic**:
- Pending requests show: Approve, Reject, Edit, Delete buttons
- Approved/Rejected requests show: Edit (disabled), Delete buttons
- Only pending requests can be edited

**Date Handling**:
- Database format: `Y-m-d`
- Display format: `d/m/Y`
- Auto-calculate days between from_date and to_date (inclusive)

**Overlap Check**:
When creating a leave request, the system checks for overlapping leave requests for the same employee that are not rejected.

**Status Count Tabs**:
Status filter tabs are displayed below the "Leave Requests" title showing real-time counts:
- All (total count)
- Pending (count)
- Approved (count)
- Rejected (count)

These tabs are clickable and filter the leave requests accordingly. The counts update dynamically based on department and leave type filters.

**Table Columns**:
1. Employee (with avatar/initials)
2. Leave Type (badge)
3. From Date
4. To Date
5. Days
6. Reason (truncated with tooltip on hover - shows full text)
7. Status (badge)
8. Action (buttons)

**Action Buttons with Tooltips**:
All action buttons (Approve, Reject, Edit, Delete) now have tooltips:
- Approve: Shows "Approve" tooltip
- Reject: Shows "Reject" tooltip
- Edit: Shows "Edit" or "Only pending requests can be edited" (when disabled)
- Delete: Shows "Delete" tooltip

### API Endpoints Reference Update

#### Leave Requests
- `GET /api/admin/leave-requests` - List leave requests (pagination, search, filters)
- `POST /api/admin/leave-requests` - Create leave request
- `GET /api/admin/leave-requests/employees` - Get active employees for dropdown
- `GET /api/admin/leave-requests/{id}` - Get single leave request
- `PUT /api/admin/leave-requests/{id}` - Update leave request (pending only)
- `DELETE /api/admin/leave-requests/{id}` - Delete leave request
- `PATCH /api/admin/leave-requests/{id}/approve` - Approve pending leave request
- `PATCH /api/admin/leave-requests/{id}/reject` - Reject pending leave request

### Database Schema Update

#### leave_requests Table
- `id` - Primary key
- `employee_id` - FK to employees.id (CASCADE on delete)
- `leave_type` - ENUM: 'Annual Leave', 'Sick Leave', 'Casual Leave'
- `from_date` - DATE
- `to_date` - DATE
- `days` - INT (calculated from date range)
- `reason` - TEXT (nullable)
- `status` - ENUM: 'pending', 'approved', 'rejected' (default: pending)
- `approved_by` - FK to users.id (SET NULL on delete)
- `approved_at` - TIMESTAMP (nullable)
- `created_at`, `updated_at` - Timestamps
- `deleted_at` - Soft delete timestamp
