import React, { createContext, useContext, useState, useEffect } from 'react';



import { db } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, runTransaction } from 'firebase/firestore';

const PollContext = createContext();

export const PollProvider = ({ children }) => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState({
        name: "Guest User",
        email: "guest@quickpoll.local",
        avatar: ""
    });

    // Real-time listener for polls
    useEffect(() => {
        const q = query(collection(db, "polls"), orderBy("created_at", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const pollsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPolls(pollsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching polls:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const updateProfile = (updates) => {
        setUserProfile(prev => ({ ...prev, ...updates }));
    };

    const addPoll = async (pollData) => {
        try {
            await addDoc(collection(db, "polls"), {
                ...pollData,
                votes: 0,
                created_at: Date.now(), // or serverTimestamp()
                author: userProfile.name,
                isMine: true // In a real app, check auth API UID
            });
        } catch (e) {
            console.error("Error adding poll: ", e);
        }
    };

    const deletePoll = async (pollId) => {
        try {
            await deleteDoc(doc(db, "polls", pollId));
        } catch (e) {
            console.error("Error deleting poll: ", e);
        }
    };

    const voteOption = async (pollId, optionId) => {
        const pollRef = doc(db, "polls", pollId);
        try {
            await runTransaction(db, async (transaction) => {
                const sfDoc = await transaction.get(pollRef);
                if (!sfDoc.exists()) {
                    throw "Document does not exist!";
                }

                const pollData = sfDoc.data();
                const newOptions = pollData.options.map(opt => {
                    if (opt.id === optionId) {
                        return { ...opt, count: (opt.count || 0) + 1 };
                    }
                    return opt;
                });

                const newTotalVotes = (pollData.votes || 0) + 1;

                transaction.update(pollRef, {
                    options: newOptions,
                    votes: newTotalVotes
                });
            });
        } catch (e) {
            console.error("Vote failed: ", e);
        }
    };

    return (
        <PollContext.Provider value={{ polls, loading, addPoll, deletePoll, voteOption, userProfile, updateProfile }}>
            {children}
        </PollContext.Provider>
    );
};

export const usePolls = () => {
    const context = useContext(PollContext);
    if (!context) {
        throw new Error('usePolls must be used within a PollProvider');
    }
    return context;
};
