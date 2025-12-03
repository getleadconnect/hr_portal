import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings as SettingsIcon,
    LogOut,
    Menu,
    X,
    ChevronDown,
    ChevronRight,
    User,
    KeyRound,
    CalendarCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
        label: 'Jobs',
        icon: FileText,
        children: [
            { path: '/applications', label: 'Applications' },
            { path: '/openings', label: 'Openings' }
        ]
    },
    {
        label: 'Employees',
        icon: Users,
        children: [
            { path: '/employees', label: 'Employees' },
            { path: '/employees/list', label: 'Employee List' },
            { path: '/attendance', label: 'Attendance' },
            { path: '/leave-requests', label: 'Leave Requests' }
        ]
    },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

export default function AdminLayout({ children, pageTitle }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const handleChangePasswordClick = () => {
        navigate('/profile');
    };

    const isActive = (path) => {
        if (path === '/settings') {
            return location.pathname.startsWith('/settings');
        }
        // For /employees and /employees/list, use exact match
        if (path === '/employees') {
            return location.pathname === '/employees';
        }
        if (path === '/employees/list') {
            return location.pathname === '/employees/list';
        }
        // For other submenu items, check if current path starts with the menu path
        return location.pathname.startsWith(path);
    };

    const isDropdownActive = (children) => {
        return children?.some(child => {
            if (child.path === '/employees') {
                return location.pathname === '/employees';
            }
            if (child.path === '/employees/list') {
                return location.pathname === '/employees/list';
            }
            return location.pathname.startsWith(child.path);
        });
    };

    const toggleDropdown = (label) => {
        setOpenDropdown(openDropdown === label ? null : label);
    };

    // Auto-expand dropdown if current route matches any child
    useEffect(() => {
        menuItems.forEach((item) => {
            if (item.children) {
                const isChildActive = item.children.some(child => {
                    if (child.path === '/employees') {
                        return location.pathname === '/employees';
                    }
                    if (child.path === '/employees/list') {
                        return location.pathname === '/employees/list';
                    }
                    return location.pathname.startsWith(child.path);
                });
                if (isChildActive) {
                    setOpenDropdown(item.label);
                }
            }
        });
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } sm:translate-x-0 w-64 bg-card border-r`}
            >
                <div className="h-full px-3 py-4 overflow-y-auto">
                    <div className="flex items-center justify-between mb-5 px-3">
                        <h1 className="text-xl font-bold">HR Portal</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="sm:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;

                            // If item has children, render as dropdown
                            if (item.children) {
                                const isOpen = openDropdown === item.label;
                                const hasActiveChild = isDropdownActive(item.children);

                                return (
                                    <div key={item.label} className="space-y-1">
                                        <button
                                            onClick={() => toggleDropdown(item.label)}
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                                hasActiveChild
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-accent hover:text-accent-foreground'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="h-5 w-5" />
                                                <span>{item.label}</span>
                                            </div>
                                            {isOpen ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </button>

                                        {isOpen && (
                                            <div className="ml-4 space-y-1">
                                                {item.children.map((child) => (
                                                    <Link
                                                        key={child.path}
                                                        to={child.path}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                                                            isActive(child.path)
                                                                ? 'text-white'
                                                                : 'hover:bg-accent hover:text-accent-foreground'
                                                        }`}
                                                        style={isActive(child.path) ? { backgroundColor: '#82a3eb' } : {}}
                                                        onClick={() => setSidebarOpen(false)}
                                                    >
                                                        <span>{child.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            }

                            // Regular menu item without children
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                        isActive(item.path)
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <div className="sm:ml-64">
                {/* Header */}
                <header className="bg-card border-b sticky top-0 z-30">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="sm:hidden"
                                onClick={() => setSidebarOpen(true)}
                            >
                                <Menu className="h-5 w-5" />
                            </Button>

                            {/* Page Title */}
                            {pageTitle && (
                                <h2 className="font-semibold hidden sm:block" style={{ fontSize: '1.5rem' }}>
                                    {pageTitle}
                                </h2>
                            )}
                        </div>

                        <div className="ml-auto">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 h-auto px-2 py-1">
                                        <span className="text-sm font-medium hidden sm:inline-block">
                                            {user?.user_name}
                                        </span>
                                        <Avatar className="h-10 w-10">
                                            <AvatarFallback>
                                                {user?.user_name?.charAt(0).toUpperCase() || 'A'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user?.user_name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleProfileClick}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>My Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleChangePasswordClick}>
                                        <KeyRound className="mr-2 h-4 w-4" />
                                        <span>Change Password</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 sm:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}
        </div>
    );
}
