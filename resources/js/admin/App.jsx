import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AdminLayout from './components/layouts/AdminLayout';
import UserLayout from './components/layouts/UserLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ApplicationsList from './pages/applications/ApplicationsList';
import ApplicationDetails from './pages/applications/ApplicationDetails';
import OpeningsList from './pages/openings/OpeningsList';
import OpeningForm from './pages/openings/OpeningForm';
import OpeningDetails from './pages/openings/OpeningDetails';
import EmployeesList from './pages/employees/EmployeesList';
import EmployeeCards from './pages/employees/EmployeeCards';
import EmployeeForm from './pages/employees/EmployeeForm';
import EmployeeDetails from './pages/employees/EmployeeDetailsNew';
import UsersList from './pages/users/UsersList';
import UserForm from './pages/users/UserForm';
import UserDetails from './pages/users/UserDetails';
import JobCategoriesList from './pages/job-categories/JobCategoriesList';
import AttendanceList from './pages/attendance/AttendanceList';
import LeaveRequestList from './pages/leave-requests/LeaveRequestList';
import PayrollList from './pages/payroll/PayrollList';
import Settings from './pages/Settings';

// User Dashboard Pages
import UserDashboard from './pages/user-dashboard/UserDashboard';
import UserAttendance from './pages/user-dashboard/UserAttendance';
import UserLeave from './pages/user-dashboard/UserLeave';
import UserProfile from './pages/user-dashboard/UserProfile';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Protected route for admin only (role_id 1 or 2)
function AdminRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If staff user (role_id === 3), redirect to user dashboard
    if (user?.role_id === 3) {
        return <Navigate to="/user/dashboard" replace />;
    }

    return children;
}

// Protected route for staff only (role_id 3)
function StaffRoute({ children }) {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If admin user (role_id !== 3), redirect to admin dashboard
    if (user?.role_id !== 3) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

// Get page title based on route
function getPageTitle(pathname) {
    if (pathname === '/profile') return 'My Profile';
    if (pathname.startsWith('/applications')) return 'Applications';
    if (pathname.startsWith('/openings')) return 'Job Openings';
    if (pathname === '/employees') return 'Employees';
    if (pathname === '/employees/list') return 'Employees';
    if (pathname.startsWith('/employees/')) {
        // Check if it's a detail page (has an ID or /edit or /add)
        return 'Employee Details';
    }
    if (pathname.startsWith('/attendance')) return 'Attendance';
    if (pathname.startsWith('/leave-requests')) return 'Leave Requests';
    if (pathname.startsWith('/payroll')) return 'Payroll Management';
    if (pathname.startsWith('/users')) return 'Users';
    if (pathname.startsWith('/job-categories')) return 'Job Categories';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname === '/dashboard') return 'Dashboard';
    return '';
}

function AdminLayoutWrapper({ children }) {
    const location = useLocation();
    const pageTitle = getPageTitle(location.pathname);

    return <AdminLayout pageTitle={pageTitle}>{children}</AdminLayout>;
}

function UserLayoutWrapper({ children }) {
    return <UserLayout>{children}</UserLayout>;
}

function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />

                {/* User Dashboard Routes (for staff - role_id 3) */}
                <Route
                    path="/user/*"
                    element={
                        <StaffRoute>
                            <UserLayoutWrapper>
                                <Routes>
                                    <Route path="/dashboard" element={<UserDashboard />} />
                                    <Route path="/attendance" element={<UserAttendance />} />
                                    <Route path="/leave" element={<UserLeave />} />
                                    <Route path="/profile" element={<UserProfile />} />
                                    <Route path="/" element={<Navigate to="/user/dashboard" replace />} />
                                </Routes>
                            </UserLayoutWrapper>
                        </StaffRoute>
                    }
                />

                {/* Admin Dashboard Routes (for admin/user - role_id 1 or 2) */}
                <Route
                    path="/*"
                    element={
                        <AdminRoute>
                            <AdminLayoutWrapper>
                                <Routes>
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/profile" element={<Profile />} />

                                    <Route path="/applications" element={<ApplicationsList />} />
                                    <Route path="/applications/:id" element={<ApplicationDetails />} />

                                    <Route path="/openings" element={<OpeningsList />} />
                                    <Route path="/openings/create" element={<OpeningForm />} />
                                    <Route path="/openings/:id/edit" element={<OpeningForm />} />
                                    <Route path="/openings/:id" element={<OpeningDetails />} />

                                    <Route path="/employees" element={<EmployeeCards />} />
                                    <Route path="/employees/list" element={<EmployeesList />} />
                                    <Route path="/employees/create" element={<EmployeeForm />} />
                                    <Route path="/employees/:id" element={<EmployeeDetails />} />
                                    <Route path="/employees/:id/edit" element={<EmployeeForm />} />

                                    <Route path="/users" element={<UsersList />} />
                                    <Route path="/users/create" element={<UserForm />} />
                                    <Route path="/users/:id" element={<UserDetails />} />
                                    <Route path="/users/:id/edit" element={<UserForm />} />

                                    <Route path="/job-categories" element={<JobCategoriesList />} />

                                    <Route path="/attendance" element={<AttendanceList />} />

                                    <Route path="/leave-requests" element={<LeaveRequestList />} />

                                    <Route path="/payroll" element={<PayrollList />} />

                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </AdminLayoutWrapper>
                        </AdminRoute>
                    }
                />
            </Routes>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    );
}

export default App;
