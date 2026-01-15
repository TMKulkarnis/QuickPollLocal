import React, { createContext, useContext, useState, useEffect } from 'react';



import { db, auth } from '../lib/firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, runTransaction } from 'firebase/firestore';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const PollContext = createContext();

export const PollProvider = ({ children }) => {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth);
    };

    // Real-time listener for polls
    // Real-time listener for polls
    useEffect(() => {
        // If not logged in, we might not have permission to read (depending on rules), 
        // or we just want to clear data. Since we enforce login, we can wait for user.
        if (!user) {
            setPolls([]);
            return;
        }

        setLoading(true);
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
    }, [user]);

    const addPoll = async (pollData) => {
        try {
            await addDoc(collection(db, "polls"), {
                ...pollData,
                votes: 0,
                created_at: Date.now(),
                authorId: user ? user.uid : 'guest',
                authorName: user ? user.displayName : 'Guest',
                authorPhoto: user ? user.photoURL : null,
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
        <PollContext.Provider value={{ polls, loading: loading || authLoading, addPoll, deletePoll, voteOption, user, login, logout }}>
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
