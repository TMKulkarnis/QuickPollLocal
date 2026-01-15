import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { usePolls } from '../context/PollContext';
import { LogIn } from 'lucide-react';

export const Login = () => {
    const { login, user } = usePolls();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleLogin = async () => {
        try {
            await login();
            navigate('/');
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                    QuickPoll Local
                </h1>
                <p className="text-muted-foreground text-lg">
                    Join the community and start polling instantly.
                </p>
            </div>

            <div className="glass-card p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 border border-white/20 dark:border-white/10">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                    <LogIn className="w-10 h-10 text-primary" />
                </div>

                <div className="space-y-4 text-center max-w-sm">
                    <h2 className="text-2xl font-bold">Welcome Back</h2>
                    <p className="text-sm text-balance text-muted-foreground">
                        Sign in to create polls, vote, and engage with your local community.
                    </p>
                </div>

                <Button
                    size="lg"
                    className="w-full rounded-full gap-2 text-md font-semibold shadow-lg hover:shadow-primary/25 transition-all duration-300"
                    onClick={handleLogin}
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Continue with Google
                </Button>
            </div>

            <p className="px-8 text-center text-sm text-muted-foreground">
                By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
    );
};
