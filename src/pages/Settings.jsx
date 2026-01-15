import React from 'react';
import { usePolls } from '../context/PollContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, User, Shield, Moon } from 'lucide-react';

export const Settings = () => {
    const { userProfile, updateProfile } = usePolls(); // We use the same hook
    const [name, setName] = React.useState(userProfile.name);
    const [email, setEmail] = React.useState(userProfile.email);

    // Notification State
    const [notifications, setNotifications] = React.useState({
        push: true,
        email: false
    });

    // Theme State
    const [theme, setTheme] = React.useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') || 'system';
        }
        return 'system';
    });

    // Apply Theme Effect
    React.useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleSave = () => {
        updateProfile({ name, email });
        // Optional: Show toast or feedback
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and app settings.</p>
            </div>

            <div className="grid gap-6">
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" /> Profile Settings
                        </CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Display Name</label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                            />
                        </div>
                        <Button onClick={handleSave}>Save Changes</Button>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5 text-orange-500" /> Notifications
                        </CardTitle>
                        <CardDescription>Configure how you want to be notified.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Push Notifications</label>
                                <p className="text-xs text-muted-foreground">Receive alerts for new polls nearby</p>
                            </div>
                            <Button
                                variant={notifications.push ? "default" : "outline"}
                                size="sm"
                                onClick={() => setNotifications(prev => ({ ...prev, push: !prev.push }))}
                            >
                                {notifications.push ? "Enabled" : "Disabled"}
                            </Button>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium">Email Digest</label>
                                <p className="text-xs text-muted-foreground">Weekly summary of top polls</p>
                            </div>
                            <Button
                                variant={notifications.email ? "default" : "outline"}
                                size="sm"
                                onClick={() => setNotifications(prev => ({ ...prev, email: !prev.email }))}
                            >
                                {notifications.email ? "Enabled" : "Disabled"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Moon className="w-5 h-5 text-purple-500" /> Appearance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Button
                                variant={theme === 'light' ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setTheme('light')}
                            >
                                Light
                            </Button>
                            <Button
                                variant={theme === 'dark' ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setTheme('dark')}
                            >
                                Dark
                            </Button>
                            <Button
                                variant={theme === 'system' ? "default" : "outline"}
                                className="flex-1"
                                onClick={() => setTheme('system')}
                            >
                                System
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
