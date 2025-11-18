import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('admin_token');
        const savedUser = localStorage.getItem('admin_user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
            setLoading(false);
        } else {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await api.post('/admin/login', { email, password });

            if (response.data.success) {
                const { user, token } = response.data.data;
                localStorage.setItem('admin_token', token);
                localStorage.setItem('admin_user', JSON.stringify(user));
                setUser(user);
                return { success: true };
            }

            return { success: false, message: response.data.message };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/admin/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
            setUser(null);
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/admin/user');
            if (response.data.success) {
                const userData = response.data.data;
                localStorage.setItem('admin_user', JSON.stringify(userData));
                setUser(userData);
            }
        } catch (error) {
            console.error('Refresh user error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, refreshUser, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
