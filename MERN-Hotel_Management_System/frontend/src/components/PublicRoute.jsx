import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (user) {
        // Redirect guests to rooms page, others to dashboard
        if (user.role === 'guest') {
            return <Navigate to="/rooms" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children ? children : <Outlet />;
};

export default PublicRoute;
