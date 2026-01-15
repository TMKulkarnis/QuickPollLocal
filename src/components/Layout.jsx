import React from 'react';
import { Sidebar } from './Sidebar';

export function Layout({ children }) {
    return (
        <div className="min-h-screen bg-bg font-sans text-foreground relative overflow-hidden">
            {/* Background Gradients/Blobs */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/30 dark:bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 dark:bg-blue-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            <Sidebar />
            <main className="ml-64 p-8 h-screen relative z-0 transition-all duration-300 overflow-y-auto">
                <div className="max-w-7xl mx-auto h-full animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
                    {children}
                </div>
            </main>
        </div>
    );
}
