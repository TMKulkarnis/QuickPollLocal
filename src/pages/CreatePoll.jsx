import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { categorizePoll } from '../services/ai';
import { getUserLocation } from '../services/location';
import { ArrowLeft, Sparkles, Loader2, Plus, X, MapPin, LocateFixed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePolls } from '../context/PollContext';

export const CreatePoll = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [category, setCategory] = useState('');
    const [postType, setPostType] = useState('poll'); // 'poll' or 'question'
    const [locationName, setLocationName] = useState('San Francisco, CA');
    const [coords, setCoords] = useState({ lat: 37.7749, lng: -122.4194 });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const navigate = useNavigate();
    const { addPoll } = usePolls();

    const handleOptionChange = (idx, val) => {
        const newOptions = [...options];
        newOptions[idx] = val;
        setOptions(newOptions);
    };

    const addOption = () => setOptions([...options, '']);
    const removeOption = (idx) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== idx));
    };

    const handleAI = async () => {
        if (!question) return;
        setIsAnalyzing(true);
        const result = await categorizePoll(question);
        if (result) {
            setCategory(result.category);
            if (result.options && result.options.length > 0) {
                setOptions(result.options);
            }
        }
        setIsAnalyzing(false);
    };

    const handleLocationClick = async () => {
        try {
            const pos = await getUserLocation();
            setCoords({ lat: pos.lat, lng: pos.lng });
            setLocationName("Current Location"); // Or leave it as is if they want to name it
        } catch (error) {
            console.error("Error fetching location:", error);
            // Optional: alert user
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting:", { question, options, category });

        addPoll({
            question,
            category: category || "General",
            type: postType,
            options: postType === 'poll' ? options.map((opt, i) => ({ id: `opt-${i}`, text: opt, count: 0 })) : [],
            location: {
                lat: parseFloat(coords.lat),
                lng: parseFloat(coords.lng),
                name: locationName
            }
        });

        navigate('/');
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 md:px-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Create a Poll</h1>
                    <p className="text-muted-foreground text-sm">Ask your community anything.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                {/* Left Panel: Tips or Info */}
                <Card className="glass-card bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/20 dark:to-black border-none h-fit">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-blue-500" />
                            Smart Tips
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <p>1. Keep your question clear and concise.</p>
                        <p>2. Use our AI tool to automatically suggest relevant options.</p>
                        <p>3. Add visual emojis to make your poll stand out.</p>
                    </CardContent>
                </Card>

                {/* Main Form */}
                <Card className="lg:col-span-2 glass-card shadow-xl border-none">
                    <CardContent className="p-8 space-y-8">
                        {/* Post Type Toggle */}
                        <div className="flex p-1 bg-secondary/50 rounded-lg w-full md:w-fit">
                            <button
                                onClick={() => setPostType('poll')}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${postType === 'poll' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Poll
                            </button>
                            <button
                                onClick={() => setPostType('question')}
                                className={`flex-1 md:flex-none px-6 py-2 rounded-md text-sm font-medium transition-all ${postType === 'question' ? 'bg-primary text-white shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                Question
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">
                                {postType === 'poll' ? 'Question' : 'What would you like to ask?'}
                            </label>
                            <Input
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Type your question..."
                                className="text-lg p-6 bg-secondary/50 dark:bg-secondary/20 border-transparent focus:border-primary focus:bg-background transition-all"
                            />
                            <div className="flex justify-between items-center">
                                {category && isAnalyzing ? (
                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full animate-pulse">
                                        Detecting...
                                    </span>
                                ) : <span />}
                                <Button
                                    onClick={handleAI}
                                    disabled={!question || isAnalyzing}
                                    variant="ghost"
                                    size="sm"
                                    className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
                                >
                                    {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                    Auto-generate with AI
                                </Button>
                            </div>
                            <div className="pt-2">
                                <label className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">Category</label>
                                <div className="flex gap-2 mt-2">
                                    <Input
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        placeholder="E.g. Food, Sports, social..."
                                        className="bg-secondary/50 dark:bg-secondary/20 border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold tracking-wide text-foreground/80 uppercase flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary" /> Poll Location
                                </label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLocationClick}
                                    className="h-7 text-xs gap-1 text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors"
                                >
                                    <LocateFixed size={14} /> Use Current Location
                                </Button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                                <Input
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    placeholder="Enter city or place..."
                                    className="pl-9 bg-secondary/50 dark:bg-secondary/20 border-transparent focus:bg-background focus:border-primary transition-all duration-300"
                                />
                                {/* Hidden inputs for coords, but state is used on submit */}
                                <div className="flex gap-2 hidden">
                                    <Input
                                        type="number"
                                        value={coords.lat}
                                        onChange={(e) => setCoords({ ...coords, lat: e.target.value })}
                                        placeholder="Lat"
                                    />
                                    <Input
                                        type="number"
                                        value={coords.lng}
                                        onChange={(e) => setCoords({ ...coords, lng: e.target.value })}
                                        placeholder="Lng"
                                    />
                                </div>
                            </div>
                            {coords.lat !== 37.7749 && (
                                <div className="text-xs text-emerald-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Location locked: <span className="font-mono">{parseFloat(coords.lat).toFixed(4)}, {parseFloat(coords.lng).toFixed(4)}</span>
                                </div>
                            )}
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold pl-1">
                                {coords.lat !== 37.7749 ? "Tracking Active" : "Default Location"}
                            </p>
                        </div>

                        {postType === 'poll' && (
                            <div className="space-y-4">
                                <label className="text-sm font-semibold tracking-wide text-foreground/80 uppercase">Options</label>
                                <div className="space-y-3">
                                    {options.map((opt, idx) => (
                                        <div key={idx} className="flex gap-2 items-center group">
                                            <div className="h-8 w-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground text-xs font-bold">
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <Input
                                                value={opt}
                                                onChange={(e) => handleOptionChange(idx, e.target.value)}
                                                placeholder={`Option ${idx + 1}`}
                                                className="bg-secondary/50 dark:bg-secondary/20 border-transparent focus:bg-background transition-all"
                                            />
                                            {options.length > 2 && (
                                                <Button variant="ghost" size="icon" onClick={() => removeOption(idx)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={addOption} variant="outline" className="w-full border-dashed border-2 hover:border-primary hover:text-primary transition-colors">
                                    <Plus className="w-4 h-4 mr-2" /> Add Option
                                </Button>
                            </div>
                        )}

                        <div className="pt-6 border-t border-border/50">
                            <Button onClick={handleSubmit} className="w-full h-12 text-lg shadow-lg hover:shadow-xl bg-gradient-to-r from-primary to-purple-600 border-0">
                                {postType === 'poll' ? 'Launch Poll' : 'Ask Question'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
