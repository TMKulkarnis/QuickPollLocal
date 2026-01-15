import React from 'react';
import { usePolls } from '../context/PollContext';
import { PollCard } from '../components/PollCard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const MyPolls = () => {
    const { polls, deletePoll } = usePolls(); // Destructure deletePoll
    const navigate = useNavigate();

    // Filter for polls created by the user (simulated)
    const myPolls = polls.filter(p => p.isMine);

    return (
        <div className="flex flex-col h-full gap-8">
            <header className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full md:hidden">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                        My Polls
                    </h1>
                    <p className="text-muted-foreground mt-1">Manage the polls you've created.</p>
                </div>
            </header>

            {myPolls.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 overflow-y-auto pb-6">
                    {myPolls.map(poll => (
                        <PollCard
                            key={poll.id}
                            poll={poll}
                            onClick={() => navigate(`/poll/${poll.id}`)}
                            onDelete={deletePoll} // Pass deletion handler
                        />
                    ))}
                </div>
            ) : (
                <Card className="flex-1 flex items-center justify-center glass-card border-dashed">
                    <CardContent className="flex flex-col items-center text-center p-8 space-y-4">
                        <div className="bg-secondary p-4 rounded-full">
                            <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold">No polls yet</h3>
                            <p className="text-muted-foreground max-w-sm">You haven't created any polls yet. Start a conversation with your community!</p>
                        </div>
                        <Button onClick={() => navigate('/create')} className="mt-4">
                            Create your first Poll
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
