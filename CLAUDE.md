# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

HR Portal application for managing job applications, employee records, attendance, leave requests, and payroll.

**Tech Stack:**
- **Backend**: Laravel 11, MySQL, Laravel Sanctum (API auth)
- **Frontend Admin**: React 19 + Vite + Shadcn UI (Radix) + TanStack Query
- **Frontend Public**: Blade + Bootstrap 5
- **File Storage**: DigitalOcean Spaces (S3-compatible)
- **Styling**: Tailwind CSS

## Development Commands

```bash
# Start all services (Laravel, queue, logs, Vite) - uses concurrently
composer dev

# Individual services
php artisan serve                    # Laravel (port 8000)
npm run dev                          # Vite dev server
php artisan queue:listen --tries=1   # Queue worker
php artisan pail --timeout=0         # Real-time logs

# Build & Quality
npm run build                        # Production build
php artisan pint                     # Code formatter (Laravel Pint)
php artisan test                     # Run tests

# Database
php artisan migrate                  # Run migrations
php artisan migrate:fresh --seed     # Reset + seed
```

## Architecture

### Backend Structure
```
app/Http/Controllers/Api/Admin/   # All API controllers
app/Models/                       # Eloquent models with validation rules
routes/api.php                    # API routes (Sanctum protected under /api/admin/*)
routes/web.php                    # Web routes for public job application form
```

### Frontend Structure
```
resources/js/admin/
├── components/
│   ├── ui/                       # Shadcn UI components
│   ├── layouts/
│   │   ├── AdminLayout.jsx       # Layout for admin users (role 1, 2)
│   │   └── UserLayout.jsx        # Layout for staff users (role 3)
│   └── DataTableControls.jsx     # Reusable table controls
├── hooks/useAuth.jsx             # Authentication hook
├── pages/                        # Feature-based pages
│   └── user-dashboard/           # Staff portal pages
├── services/api.js               # Axios instance with auth interceptors
└── App.jsx                       # React Router with role-based routing
```

### Key Patterns

**Controller Pattern** - All controllers follow:
```php
// List with pagination/search
public function index(Request $request) {
    $query = Model::orderBy('id', 'DESC');
    if ($search = $request->input('search')) {
        $query->where('field', 'LIKE', "%{$search}%");
    }
    return response()->json(['success' => true, 'data' => $query->paginate($request->input('per_page', 10))]);
}

// Validation via model static methods
$validator = Validator::make($request->all(), Model::createRules());
```

**Model Pattern** - Validation rules in models:
```php
public static function createRules() { return ['field' => 'required|string']; }
public static function updateRules($id) { return ['field' => 'required|unique:table,field,'.$id]; }
```

**React Query Pattern**:
```jsx
const { data, isLoading } = useQuery({
    queryKey: ['resource', page, search, perPage],
    queryFn: () => api.get('/admin/resource', { params: { page, search, per_page: perPage } }).then(r => r.data.data),
});
```

**Form Validation with react-hook-form + zod**:
```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
});

const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
});
```

## API Response Format

```json
// Success
{ "success": true, "data": {...}, "message": "Optional message" }

// Error
{ "success": false, "message": "Error description" }
```

HTTP Status: 200 (success), 201 (created), 401 (unauthorized), 404 (not found), 422 (validation), 500 (error)

## API Endpoints Reference

All endpoints prefixed with `/api/admin/` and require Sanctum authentication (except login).

### Authentication
- `POST /login` - Login (public)
- `POST /logout`, `GET /user`, `PUT /profile`, `POST /change-password`

### Core Resources (CRUD + toggle-status)
- `/employees` - Employee management (POST for create/update uses multipart/form-data)
- `/users` - Admin users
  - `/users/employees-dropdown` - Returns all employees (active + inactive) for user creation dropdown
- `/applications` - Job applications (includes status workflow with rejection reason)
- `/job-openings` - Job postings
- `/job-categories`, `/departments`, `/designations`, `/qualifications` - Master data

### Attendance & Leave
- `/attendances` - Attendance records, bulk marking, export
  - Supports date range filtering: `start_date`, `end_date`
  - Supports employee filtering: `employee_id`
  - Supports status filtering: `status`
- `/leave-requests` - Leave requests with approve/reject actions
- `/leave-settings` - Leave type configuration

### Payroll
- `/payrolls` - Payroll processing and management
- `/payrolls/process` - Process monthly payroll
- `/payrolls/salary` - Employee salary management
- `/allowances` - Allowance types configuration

### Employee Sub-resources
- `/employees/{id}/documents` - Document management
- `/employees/{id}/attendance` - Attendance history
- `/employees/{id}/leaves` - Leave history
- `/employees/{id}/export-pdf` - PDF export

### User Dashboard (Staff Portal)
- `/user/dashboard-stats` - Staff dashboard statistics
- `/user/profile` - View own profile
- `/user/attendance` - Own attendance, check-in/check-out
- `/user/attendance/calendar` - Calendar view of attendance
- `/user/leave-requests` - Own leave requests
- `/user/change-password` - Change own password

### Settings
- `/notification-settings` - Email/notification configuration

## Database Schema

### Key Tables & Relationships
- **employees** - Uses FK IDs: `qualification_id`, `department_id`, `designation_id`
- **users** - Admin users, optional `employee_id` FK for staff accounts
  - `role_id`: 1=Super Admin, 2=Admin, 3=Staff
  - Staff users (role 3) are redirected to `/user/*` routes with `UserLayout`
  - Admin users (role 1, 2) use `/dashboard` routes with `AdminLayout`
- **attendances** - Employee attendance records
- **leave_requests** - Leave applications with status workflow
- **payrolls** - Monthly payroll records
- **employee_salaries** - Salary configuration per employee
- **allowances** - Allowance type master data
- **employee_documents** - Uploaded documents per employee

### Status Values
- Active: `1`, Inactive: `0`
- Leave status: `pending`, `approved`, `rejected`
- Application status: `New`, `Short Listed`, `Appointed`, `Rejected`, `Not fit for this job`, `Not Interested`, `No vacancies now`, `Not Joined`
  - When status is set to `Rejected` or `Not fit for this job`, a `rejection_reason` is required and stored
- Attendance status: `present`, `absent`, `on_leave`, `half_day`

### Attendance Module
- **Table columns**: Employee, Check In, Check Out, Hours, Notes, Status, Action
- **Hours**: Always stored and displayed as absolute values (positive numbers)
- **Filters**: Employee dropdown, Date range (start/end), Status dropdown
- **Filter buttons**: "Filter" to apply, "Clear" to reset filters
- **Status badges**:
  - `present` → Green (PRESENT)
  - `absent` → Red (ABSENT)
  - `on_leave` → Yellow (ON LEAVE)
  - `half_day` → Blue (HALF DAY)

### Date Formats
- Database: `Y-m-d`
- Display: `d-m-Y` or `d/m/Y`

## File Uploads

Files stored in DigitalOcean Spaces at `Resume-Getlead/employees/`.
URL prefix: `config('constants.file_path')`

```php
// Upload pattern
$file = $request->file('field');
$path = 'Resume-Getlead/employees/' . time() . '_' . $file->getClientOriginalName();
Storage::disk('spaces')->put($path, file_get_contents($file), 'public');
```

## Frontend Conventions

### DataTable Controls
Use `DataTableControls` component for consistent table UX:
```jsx
<DataTableControls
    perPage={perPage}
    onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
    search={search}
    onSearchChange={(v) => { setSearch(v); setPage(1); }}
    searchPlaceholder="Search..."
/>
```

### Select Component Re-rendering Fix
For Shadcn Select to show pre-populated values in edit forms, add dynamic `key`:
```jsx
<Select key={`field-${formData.field || 'empty'}`} value={formData.field} ...>
```

### Authentication Storage
```jsx
// Token and user stored in localStorage
localStorage.getItem('admin_token');  // Bearer token for API requests
localStorage.getItem('admin_user');   // JSON stringified user object
```

### Toast Notifications
```jsx
import { toast } from 'react-toastify';
toast.success('Success'); toast.error('Error');
```

### Confirmation Dialogs
Use Shadcn `AlertDialog` for destructive actions. Use Shadcn `Dialog` for input modals (e.g., rejection reason modal).

### Employee Selection Dropdown (User Settings)
The employee dropdown in Settings > Users shows employees grouped by status:
- **Available Employees (Active)** - Green label, selectable
- **Available Employees (Inactive)** - Yellow label, selectable
- **Already Has User Account** - Gray label, disabled (unless editing that user)

API returns `is_active` and `has_user` flags for each employee to enable this grouping.

### File Uploads in Forms
Use `FormData` for multipart/form-data requests:
```jsx
const formData = new FormData();
formData.append('full_name', data.full_name);
formData.append('profile_image', fileInput.files[0]);

await api.post('/admin/employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
```

## Navigation Structure

```
Dashboard
Jobs ▼
  ├── Applications
  └── Openings
Employees ▼
  ├── Employee List
  ├── Attendance
  └── Leave Requests
Payroll
Settings (tabs: Users, Job Categories, Departments, Designations,
          Qualifications, Notifications, Leave Settings, Allowances)
```

## Adding New Resources

1. **Migration**: `php artisan make:migration create_resources_table`
2. **Model**: Add validation rules as `createRules()` / `updateRules($id)`
3. **Controller**: Follow existing CRUD pattern in `Api/Admin/`
4. **Routes**: Add to `routes/api.php` under Sanctum middleware group
5. **React Pages**: Add list/form pages in `resources/js/admin/pages/`
6. **Navigation**: Update `AdminLayout.jsx`
7. **Router**: Add routes in `App.jsx`

## Troubleshooting

- **CORS**: Check `config/cors.php`, run `php artisan config:cache`
- **Auth**: Clear localStorage, check Sanctum config
- **File Upload**: Verify Spaces credentials in `.env`, check `php.ini` limits
- **Build**: Clear caches: `rm -rf node_modules/.vite && php artisan cache:clear`
- **Empty Dropdowns**: If employee dropdowns show empty, check database has records and they're not soft-deleted (`deleted_at` should be NULL)

## Telegram Notifications

The system sends notifications via Telegram for:
- New job applications
- Application status changes

Service: `app/Services/TelegramService.php`

## Testing

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test --filter=TestClassName

# Run tests with verbose output
php artisan test -v
```
