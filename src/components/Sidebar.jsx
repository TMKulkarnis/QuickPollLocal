import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, PlusCircle, Map as MapIcon, Settings, BarChart2, Layers, LogIn, LogOut, User, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePolls } from '../context/PollContext';
import { useNotifications } from '../context/NotificationContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function Sidebar() {
    const { user, logout } = usePolls();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

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

            <div className="mt-auto p-4 border-t border-white/10 space-y-2">
                {user ? (
                    <div className="flex flex-col gap-2">
                        {/* Notifications */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <button className="flex items-center gap-3 px-3 py-2 w-full text-sm rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors relative">
                                    <div className="relative">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse border border-background" />
                                        )}
                                    </div>
                                    <span>Notifications</span>
                                    {unreadCount > 0 && (
                                        <span className="ml-auto text-xs font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                            {unreadCount}
                                        </span>
                                    )}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 mr-4 glass-card border-white/10" align="start" side="right">
                                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                                    <h4 className="font-semibold text-sm">Notifications</h4>
                                    {unreadCount > 0 && (
                                        <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                                            Mark all read
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map(notif => (
                                            <a
                                                key={notif.id}
                                                href={`/poll/${notif.pollId}`}
                                                onClick={() => markAsRead(notif.id)}
                                                className={cn(
                                                    "block p-4 border-b border-white/5 hover:bg-white/5 transition-colors",
                                                    !notif.read && "bg-primary/5"
                                                )}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm">
                                                            <span className="font-bold">{notif.senderName}</span> commented on
                                                            <span className="font-medium text-primary"> "{notif.pollQuestion}"</span>
                                                        </p>
                                                        <span className="text-[10px] text-muted-foreground mt-1 block">
                                                            {notif.type === 'comment' ? 'Replied recently' : 'Update'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </a>
                                        ))
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>

                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
                            {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-white/10" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate">{user.displayName}</span>
                                <span className="text-xs text-muted-foreground truncate opacity-70">
                                    {user.email}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-3 py-2 w-full text-sm rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <NavLink
                        to="/login"
                        className={({ isActive }) =>
                            cn(
                                "flex items-center gap-3 px-3 py-2 w-full text-sm rounded-lg transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-white/50 dark:hover:bg-white/5 hover:text-foreground"
                            )
                        }
                    >
                        <LogIn className="w-5 h-5" />
                        <span>Login</span>
                    </NavLink>
                )}

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
