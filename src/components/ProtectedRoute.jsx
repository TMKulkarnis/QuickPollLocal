import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePolls } from '../context/PollContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
    const { user, loading } = usePolls(); // loading handles both auth and initial data

    if (loading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-foreground gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading QuickPoll...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
