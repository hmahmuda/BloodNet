import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import API from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial check for logged in user
    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await API.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error('Auth verification failed:', error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await API.post('/auth/login', { email, password });
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            toast.success('Login successful!');
            return response.data.user;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return null;
        }
    };

    const register = async (userData) => {
        try {
            const response = await API.post('/auth/register', userData);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            toast.success('Registration successful!');
            return response.data.user;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return null;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        toast.info('Logged out successfully');
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        setUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
