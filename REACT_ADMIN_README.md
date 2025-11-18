# HR Portal - React Admin Dashboard Migration

## Overview
The admin section has been completely rebuilt using React, Shadcn UI, and Laravel Sanctum for API authentication. The public-facing job application form remains as Blade templates with Bootstrap 5.

## What's Been Completed

### 1. Frontend Setup ✅
- **React with Vite** - Configured and integrated with Laravel
- **Shadcn UI** - Installed with Tailwind CSS
- **React Router** - Client-side routing configured
- **TanStack Query (React Query)** - Data fetching and caching
- **Form Libraries** - react-hook-form, zod for validation

### 2. Backend API ✅
- **Laravel Sanctum** - API authentication configured
- **API Routes** - `/api/admin/*` routes created
- **API Controllers** - All admin controllers converted to API format:
  - `AuthController` - Login, logout, user profile
  - `DashboardController` - Statistics endpoint
  - `ApplicationController` - Applications CRUD
  - `EmployeeController` - Employees CRUD
  - `UserController` - Users CRUD
  - `JobCategoryController` - Job Categories CRUD

### 3. Core Components ✅
- **Shadcn UI Components** - Button, Card, Input, Label, Table, Dialog, DropdownMenu, Avatar, Badge
- **Admin Layout** - Responsive sidebar and header with navigation
- **Auth Context** - Authentication state management
- **API Service** - Axios instance with interceptors
- **Protected Routes** - Route guards for authentication

### 4. Pages Implemented ✅
- **Login Page** - Fully functional with Sanctum authentication
- **Dashboard** - Statistics cards with real-time data
- **Applications List** - Paginated table with search
- **Application Details** - Full application view

### 5. Pages (Placeholder - Need Implementation) ⏳
- **Employees Management** - List, Add, Edit, Delete, Toggle Status
- **Users Management** - List, Add, Edit, Delete, Toggle Status
- **Job Categories** - List, Add, Edit, Delete, Toggle Status

## Project Structure

```
resources/
├── js/
│   └── admin/
│       ├── components/
│       │   ├── layouts/
│       │   │   └── AdminLayout.jsx
│       │   └── ui/
│       │       ├── button.jsx
│       │       ├── card.jsx
│       │       ├── input.jsx
│       │       ├── label.jsx
│       │       ├── table.jsx
│       │       ├── dialog.jsx
│       │       ├── dropdown-menu.jsx
│       │       ├── avatar.jsx
│       │       └── badge.jsx
│       ├── hooks/
│       │   └── useAuth.jsx
│       ├── lib/
│       │   └── utils.js
│       ├── pages/
│       │   ├── Login.jsx ✅
│       │   ├── Dashboard.jsx ✅
│       │   ├── applications/
│       │   │   ├── ApplicationsList.jsx ✅
│       │   │   └── ApplicationDetails.jsx ✅
│       │   ├── employees/
│       │   │   └── EmployeesList.jsx ⏳ (placeholder)
│       │   ├── users/
│       │   │   └── UsersList.jsx ⏳ (placeholder)
│       │   └── job-categories/
│       │       └── JobCategoriesList.jsx ⏳ (placeholder)
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       └── main.jsx
├── css/
│   └── app.css
└── views/
    └── admin.blade.php

app/Http/Controllers/Api/Admin/
├── AuthController.php ✅
├── DashboardController.php ✅
├── ApplicationController.php ✅
├── EmployeeController.php ✅
├── UserController.php ✅
└── JobCategoryController.php ✅

routes/
├── api.php ✅
└── web.php (updated for React SPA)
```

## How to Use

### 1. Start Development Server
```bash
npm run dev
```

### 2. Access Admin Panel
Navigate to: `http://localhost/admin`

### 3. Login Credentials
Use existing admin user credentials from your users table.

### 4. API Endpoints
All admin APIs are available at `/api/admin/*`:
- POST `/api/admin/login` - Login
- POST `/api/admin/logout` - Logout
- GET `/api/admin/user` - Get authenticated user
- GET `/api/admin/dashboard/stats` - Dashboard statistics
- GET `/api/admin/applications` - List applications
- GET `/api/admin/employees` - List employees
- GET `/api/admin/users` - List users
- GET `/api/admin/job-categories` - List job categories

## What Needs to Be Completed

### 1. Employees Management (Priority: High)
**File**: `resources/js/admin/pages/employees/EmployeesList.jsx`

**Requirements**:
- List employees with pagination and search
- Add employee form with file uploads (profile image, documents)
- Edit employee (inline or modal)
- Delete employee with confirmation
- Toggle status (active/inactive)
- View employee details page

**Reference**: Use `ApplicationsList.jsx` as a template

**API Endpoints** (already created):
- GET `/api/admin/employees` - List
- POST `/api/admin/employees` - Create
- GET `/api/admin/employees/{id}` - Show
- POST `/api/admin/employees/{id}` - Update
- DELETE `/api/admin/employees/{id}` - Delete
- PATCH `/api/admin/employees/{id}/toggle-status` - Toggle

### 2. Users Management (Priority: High)
**File**: `resources/js/admin/pages/users/UsersList.jsx`

**Requirements**:
- List users with role and status
- Add user form
- Edit user
- Delete user
- Toggle status
- Password update functionality

**API Endpoints** (already created):
- GET `/api/admin/users`
- POST `/api/admin/users`
- GET `/api/admin/users/{id}`
- PUT `/api/admin/users/{id}`
- DELETE `/api/admin/users/{id}`
- PATCH `/api/admin/users/{id}/toggle-status`

### 3. Job Categories Management (Priority: Medium)
**File**: `resources/js/admin/pages/job-categories/JobCategoriesList.jsx`

**Requirements**:
- List categories
- Add/Edit category (simple form - just name)
- Delete category
- Toggle status

**API Endpoints** (already created):
- GET `/api/admin/job-categories`
- POST `/api/admin/job-categories`
- GET `/api/admin/job-categories/{id}`
- PUT `/api/admin/job-categories/{id}`
- DELETE `/api/admin/job-categories/{id}`
- PATCH `/api/admin/job-categories/{id}/toggle-status`

### 4. Additional Components Needed

**File Uploads**:
Create a reusable file upload component for employee documents:
- `resources/js/admin/components/ui/file-upload.jsx`

**Dialogs/Modals**:
- Add Employee Dialog
- Edit Employee Dialog
- Confirmation Dialogs for delete operations

**Forms**:
Implement forms using react-hook-form and zod:
- Employee Form (complex - many fields + files)
- User Form
- Job Category Form (simple)

**Data Tables**:
Consider using:
- `@tanstack/react-table` for advanced table features
- Or build custom tables with Shadcn UI Table component

## Development Tips

### 1. Building Forms
Use react-hook-form with zod validation:
```jsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
    full_name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
    // ... more fields
});

const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
});
```

### 2. Making API Calls
Use React Query for data fetching:
```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Fetching data
const { data, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
        const response = await api.get('/admin/employees');
        return response.data.data;
    }
});

// Mutations (create, update, delete)
const queryClient = useQueryClient();
const mutation = useMutation({
    mutationFn: (newEmployee) => api.post('/admin/employees', newEmployee),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
});
```

### 3. File Uploads
For file uploads, use `FormData`:
```jsx
const formData = new FormData();
formData.append('full_name', data.full_name);
formData.append('profile_image', fileInput.files[0]);

await api.post('/admin/employees', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
```

### 4. Building
```bash
# Development
npm run dev

# Production
npm run build
```

## Key Features Implemented

1. **Authentication**: Sanctum-based API authentication with token storage
2. **Protected Routes**: Automatic redirect to login for unauthenticated users
3. **Responsive Design**: Mobile-friendly sidebar and layout
4. **Dark Mode Ready**: Shadcn UI supports dark mode (add toggle if needed)
5. **Search & Pagination**: Already implemented in Applications list
6. **Loading States**: Loading indicators throughout the app
7. **Error Handling**: API error interceptors and user feedback

## Common Tasks

### Adding a New Shadcn UI Component
```bash
# If shadcn CLI was set up (optional)
npx shadcn@latest add [component-name]

# Otherwise, copy from shadcn UI docs and paste into components/ui/
```

### Creating a New Page
1. Create component in `resources/js/admin/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `AdminLayout.jsx` (if needed)

### Debugging API Issues
Check:
1. Browser DevTools Network tab
2. Laravel logs: `storage/logs/laravel.log`
3. React Query DevTools (already included)

## Production Checklist
- [ ] Complete all CRUD pages
- [ ] Add form validation
- [ ] Implement proper error handling
- [ ] Add loading states
- [ ] Test file uploads
- [ ] Test on mobile devices
- [ ] Add confirmation dialogs for destructive actions
- [ ] Implement toast notifications
- [ ] Add pagination to all lists
- [ ] Test authentication flow
- [ ] Optimize images and assets
- [ ] Run `npm run build` for production

## Notes
- The old Blade-based admin routes are commented out in `routes/web.php`
- The public job application form still uses Blade + Bootstrap
- All admin API endpoints are protected by Sanctum authentication
- File uploads go to DigitalOcean Spaces (configured in existing code)

## Support
If you encounter issues:
1. Check browser console for errors
2. Check Laravel logs
3. Verify API endpoints in `/routes/api.php`
4. Test API endpoints directly (use Postman or similar)
