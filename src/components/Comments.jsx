import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { usePolls } from '../context/PollContext';
import { Button } from '@/components/ui/button';
import { Send, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Comments = ({ pollId, pollAuthorId, pollQuestion }) => {
    const { user } = usePolls();
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!pollId) return;

        const q = query(
            collection(db, `polls/${pollId}/comments`),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setComments(commentsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [pollId]);

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        try {
            await addDoc(collection(db, `polls/${pollId}/comments`), {
                text: newComment,
                authorId: user.uid,
                authorName: user.displayName || "Anonymous",
                authorPhoto: user.photoURL,
                createdAt: serverTimestamp() // Use serverTimestamp for consistency
            });

            // Notification Logic
            // We probably need to pass 'poll' prop to Comments to know the authorId
            // Assuming pollId refers to a document that has an authorId. 
            // Since we don't have the poll object here in the current prop drilling, 
            // we should probably fetch the poll or pass the authorId as a prop.
            // For now, I'll update the component usage to pass authorId.


            // Trigger Notification
            if (pollAuthorId && user.uid !== pollAuthorId) {
                await addDoc(collection(db, "notifications"), {
                    recipientId: pollAuthorId,
                    senderId: user.uid,
                    senderName: user.displayName || "Someone",
                    senderPhoto: user.photoURL,
                    type: "comment",
                    pollId: pollId,
                    pollQuestion: pollQuestion || "your poll",
                    read: false,
                    createdAt: serverTimestamp()
                });
            }

            setNewComment("");
        } catch (error) {
            console.error("Error adding comment: ", error);
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return "Just now";
        return new Date(timestamp.seconds * 1000).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex flex-col h-full bg-secondary/10 rounded-xl p-4 overflow-hidden">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                Comments <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{comments.length}</span>
            </h3>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                {loading ? (
                    <div className="text-center text-muted-foreground py-4">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8 bg-black/5 dark:bg-white/5 rounded-lg border-2 border-dashed border-border/50">
                        No comments yet. Be the first to say something!
                    </div>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            {comment.authorPhoto ? (
                                <img src={comment.authorPhoto} alt={comment.authorName} className="w-8 h-8 rounded-full border border-white/10 shrink-0" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <User className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className="flex flex-col gap-1 max-w-[85%]">
                                <div className="bg-white/50 dark:bg-white/5 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-primary">{comment.authorName}</span>
                                        <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="text-sm leading-relaxed">{comment.text}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input Area */}
            {user ? (
                <form onSubmit={handleAddComment} className="relative mt-auto">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full pl-4 pr-12 py-3 rounded-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!newComment.trim()}
                        className="absolute right-1 top-1 h-8 w-8 rounded-full"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            ) : (
                <div className="p-3 bg-primary/5 rounded-xl text-center text-sm">
                    Please login to leave a comment.
                </div>
            )}
        </div>
    );
};
