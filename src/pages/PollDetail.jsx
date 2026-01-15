import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { usePolls } from '../context/PollContext';

export const PollDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { polls, voteOption } = usePolls();

    // Find poll by ID (handling number/string mismatch)
    const poll = polls.find(p => p.id == id);
    const [votedOption, setVotedOption] = useState(null);

    if (!poll) {
        return <div className="p-8 text-center">Poll not found</div>;
    }

    const totalVotes = poll.options.reduce((acc, curr) => acc + curr.count, 0);

    const handleVote = async (optionId) => {
        if (votedOption) return;
        setVotedOption(optionId);
        await voteOption(poll.id, optionId);
    };

    return (
        <div className="flex flex-col h-full gap-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-white/20">
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Poll Analysis</h1>
                </div>
                <Button variant="outline" size="icon" className="rounded-full glass-card hover:bg-white/80">
                    <Share2 className="w-5 h-5 text-primary" />
                </Button>
            </div>

            <Card className="glass-card border-none shadow-2xl flex-1 flex flex-col">
                <CardHeader className="pb-4 border-b border-border/30">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                            {poll.category}
                        </span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        {poll.question}
                    </h2>
                    <div className="flex gap-6 text-muted-foreground text-sm mt-4 font-medium">
                        <span className="flex items-center gap-2">
                            <MapPin size={18} className="text-primary" />
                            0.2km away
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock size={18} className="text-orange-500" />
                            Expires in 22h
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-8 overflow-y-auto flex-1">
                    {poll.options.map(option => {
                        const count = option.count + (votedOption === option.id ? 1 : 0);
                        const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                        const isSelected = votedOption === option.id;

                        return (
                            <div
                                key={option.id}
                                onClick={() => handleVote(option.id)}
                                className={cn(
                                    "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 overflow-hidden group select-none",
                                    isSelected
                                        ? "border-primary bg-primary/5 shadow-inner"
                                        : "border-transparent bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30"
                                )}
                            >
                                {/* Progress Bar */}
                                <div
                                    className={cn(
                                        "absolute top-0 left-0 bottom-0 transition-all duration-1000 ease-out z-0 opacity-20",
                                        isSelected ? "bg-primary" : "bg-muted-foreground"
                                    )}
                                    style={{ width: `${percent}%` }}
                                />

                                <div className="relative z-10 flex justify-between items-center">
                                    <span className={cn("font-semibold text-lg", isSelected && "text-primary")}>
                                        {option.text}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {votedOption && (
                                            <span className="text-sm font-bold opacity-0 animate-in fade-in slide-in-from-right-4 fill-mode-forwards">
                                                {percent}%
                                            </span>
                                        )}
                                        <div className={cn(
                                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                            isSelected ? "border-primary bg-primary text-white" : "border-muted-foreground/30 group-hover:border-primary/50"
                                        )}>
                                            {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-8 text-center text-muted-foreground text-sm font-medium">
                        Based on {totalVotes} total votes
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
