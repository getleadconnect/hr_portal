import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import AdminLayout from './components/layouts/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ApplicationsList from './pages/applications/ApplicationsList';
import ApplicationDetails from './pages/applications/ApplicationDetails';
import OpeningsList from './pages/openings/OpeningsList';
import OpeningForm from './pages/openings/OpeningForm';
import OpeningDetails from './pages/openings/OpeningDetails';
import EmployeesList from './pages/employees/EmployeesList';
import EmployeeForm from './pages/employees/EmployeeForm';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import UsersList from './pages/users/UsersList';
import UserForm from './pages/users/UserForm';
import UserDetails from './pages/users/UserDetails';
import JobCategoriesList from './pages/job-categories/JobCategoriesList';
import AttendanceList from './pages/attendance/AttendanceList';
import LeaveRequestList from './pages/leave-requests/LeaveRequestList';
import Settings from './pages/Settings';
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

// Get page title based on route
function getPageTitle(pathname) {
    if (pathname === '/profile') return 'My Profile';
    if (pathname.startsWith('/applications')) return 'Applications';
    if (pathname.startsWith('/openings')) return 'Job Openings';
    if (pathname.startsWith('/employees') && pathname !== '/employees') {
        // Check if it's a detail page (has an ID or /edit or /add)
        return 'Employee Details';
    }
    if (pathname.startsWith('/employees')) return 'Employees';
    if (pathname.startsWith('/attendance')) return 'Attendance';
    if (pathname.startsWith('/leave-requests')) return 'Leave Requests';
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

function App() {
    return (
        <>
            <Routes>
                <Route path="/login" element={<Login />} />

                <Route
                    path="/*"
                    element={
                        <ProtectedRoute>
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

                                    <Route path="/employees" element={<EmployeesList />} />
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

                                    <Route path="/settings" element={<Settings />} />
                                </Routes>
                            </AdminLayoutWrapper>
                        </ProtectedRoute>
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
