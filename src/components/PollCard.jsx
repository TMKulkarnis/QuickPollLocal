import React from 'react';
import { MapPin, Clock, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const PollCard = ({ poll, onClick, distance, onDelete }) => {
    return (
        <Card
            onClick={() => onClick(poll)}
            className="cursor-pointer hover:translate-y-[-2px] transition-all duration-200 border-l-4 border-l-primary/50 hover:border-l-primary shadow-sm hover:shadow-md glass-card group relative"
        >
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-foreground pr-8">
                        {poll.question}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${poll.type === 'question' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' : 'bg-primary/10 text-primary'}`}>
                        {poll.category || (poll.type === 'question' ? 'Question' : 'Poll')}
                    </span>
                </div>

                <div className="flex gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {distance ? `${distance.toFixed(1)}km` : 'Nearby'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={14} />
                        2h ago
                    </span>
                    {poll.type !== 'question' && (
                        <span className="font-medium text-foreground/80">
                            {poll.votes} votes
                        </span>
                    )}
                </div>

                {onDelete && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(poll.id);
                        }}
                    >
                        <Trash2 size={16} />
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};
