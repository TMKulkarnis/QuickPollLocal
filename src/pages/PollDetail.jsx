import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { usePolls } from '../context/PollContext';
import { Comments } from '../components/Comments';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { analyzePoll } from '../services/gemini';
import { Sparkles, Loader2 } from 'lucide-react';

export const PollDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { polls, voteOption } = usePolls();

    // Analysis State
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    // We need comments to analyze them. 
    // Ideally we lift state up or fetch them here too. 
    // For now, let's just fetch them on-demand when clicking analyze to save reads?
    // Actually, to make it simple without refactoring Comments component completely,
    // let's do a quick fetch only when user asks for analysis.

    // Find poll by ID (handling number/string mismatch)
    const poll = polls.find(p => p.id == id);
    const [votedOption, setVotedOption] = useState(null);

    if (!poll) {
        return <div className="p-8 text-center">Poll not found</div>;
    }

    const totalVotes = poll.options ? poll.options.reduce((acc, curr) => acc + curr.count, 0) : 0;

    // Analysis Logic
    const handleAnalyze = async () => {
        if (analyzing) return;
        setAnalyzing(true);
        setAnalysis(null);

        try {
            // Fetch recent comments for context
            const q = query(
                collection(db, `polls/${id}/comments`),
                orderBy("createdAt", "desc")
            );
            const snapshot = await getDocs(q);
            const comments = snapshot.docs.map(doc => doc.data());

            const result = await analyzePoll(poll, comments);
            setAnalysis(result);
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setAnalyzing(false);
        }
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full pb-6">
                <Card className="glass-card border-none shadow-2xl flex flex-col col-span-1 lg:col-span-2 overflow-hidden h-full">
                    <CardHeader className="pb-4 border-b border-border/30 shrink-0">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                                {poll.category}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-3xl font-extrabold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70 line-clamp-2">
                            {poll.question}
                        </h2>
                        <div className="flex gap-6 text-muted-foreground text-sm mt-4 font-medium items-center">
                            {poll.authorName && (
                                <div className="flex items-center gap-2 text-foreground/80">
                                    {poll.authorPhoto ? (
                                        <img src={poll.authorPhoto} alt={poll.authorName} className="w-5 h-5 rounded-full" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                                            {poll.authorName[0]}
                                        </div>
                                    )}
                                    <span>Posted by {poll.authorName}</span>
                                </div>
                            )}
                            <span className="flex items-center gap-2">
                                <MapPin size={18} className="text-primary" />
                                0.2km away
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={18} className="text-orange-500" />
                                Expires in 22h
                            </span>
                        </div>

                        {/* Gemini Analysis Button */}
                        <div className="mt-6 mb-2">
                            {!analysis ? (
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={analyzing}
                                    variant="outline"
                                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200/20 hover:border-blue-400/50 text-blue-600 dark:text-blue-300 gap-2"
                                >
                                    {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                    {analyzing ? "Analyzing Discussion..." : "Analyze with Gemini"}
                                </Button>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-top-4 duration-500 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/30 rounded-xl p-4 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500" />
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg shrink-0">
                                            <Sparkles className="w-5 h-5 text-indigo-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-indigo-700 dark:text-indigo-300 mb-1">AI Summary</h4>
                                            <div className="text-sm text-muted-foreground prose dark:prose-invert max-w-none leading-relaxed">
                                                {analysis.split('\n').map((line, i) => <p key={i} className="mb-1 last:mb-0">{line}</p>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-8 overflow-y-auto custom-scrollbar">
                        {poll.type === 'question' ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg font-medium">This is an open discussion.</p>
                                <p className="text-sm">Share your thoughts in the comments below!</p>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </CardContent>
                </Card >

                <div className="lg:col-span-1 h-full min-h-[400px]">
                    <Card className="glass-card border-none shadow-xl h-full p-0 overflow-hidden">
                        <Comments pollId={poll.id} pollAuthorId={poll.authorId} pollQuestion={poll.question} />
                    </Card>
                </div>
            </div >
        </div >
    );
};
