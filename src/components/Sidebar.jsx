import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, Map as MapIcon, Settings, BarChart2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar() {
    const navItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: Layers, label: 'My Polls', path: '/polls' },
        { icon: PlusCircle, label: 'Create Poll', path: '/create' },
        { icon: MapIcon, label: 'Map View', path: '/map' },
    ];

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 glass-sidebar flex flex-col z-50 transition-all duration-300">
            <div className="flex items-center gap-3 p-6 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    QP
                </div>
                <span className="font-bold text-xl tracking-tight">QuickPoll</span>
            </div>

            <div className="px-4 mb-2">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Menu</h3>
                <nav className="space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                                )
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                    <span className="relative z-10">{item.label}</span>
                                    {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-white/10">
                <NavLink
                    to="/settings"
                    className={({ isActive }) =>
                        cn(
                            "flex items-center gap-3 px-3 py-2 w-full text-sm rounded-lg transition-colors",
                            isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                        )
                    }
                >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                </NavLink>
            </div>
        </aside>
    );
}
