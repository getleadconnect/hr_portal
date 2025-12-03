import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { LayoutDashboard, Calendar, FileText, User, LogOut } from 'lucide-react';
import { toast } from 'react-toastify';

const navItems = [
    { path: '/user/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/user/attendance', label: 'Attendance', icon: Calendar },
    { path: '/user/leave', label: 'Leave Management', icon: FileText },
    { path: '/user/profile', label: 'Profile', icon: User },
];

export default function UserLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();

    const { data: userData } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            const response = await api.get('/admin/user');
            return response.data;
        },
    });

    const handleLogout = async () => {
        try {
            await api.post('/admin/logout');
            localStorage.removeItem('admin_token');
            toast.success('Logged out successfully');
            navigate('/login');
        } catch (error) {
            localStorage.removeItem('admin_token');
            navigate('/login');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/user/dashboard" className="text-xl font-bold text-gray-900">
                                HR Portal
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-8">
                            {navItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`text-sm font-medium transition-colors ${
                                        isActive(item.path)
                                            ? 'text-gray-900'
                                            : 'text-gray-500 hover:text-gray-900'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* User Menu */}
                        <div className="flex items-center">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-9 w-9 rounded-full bg-gray-200 p-0">
                                        <span className="text-sm font-medium text-gray-600">
                                            {getInitials(userData?.data?.user_name)}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuItem onClick={() => navigate('/user/profile')} className="cursor-pointer">
                                        <User className="mr-2 h-4 w-4" />
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                                        <LogOut className="mr-2 h-4 w-4" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="md:hidden border-t border-gray-200 px-2 py-2 flex space-x-1 overflow-x-auto scrollbar-hide">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                                    isActive(item.path)
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                {children}
            </main>
        </div>
    );
}
