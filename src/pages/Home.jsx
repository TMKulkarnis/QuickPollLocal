import React, { useState, useEffect } from 'react';
import { Map, MapMarker, MarkerContent } from '../components/ui/map';
import { PollCard } from '../components/PollCard';
import { Map as MapIcon, List, Activity, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserLocation, getDistanceFromLatLonInKm, getLocationName } from '../services/location';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePolls } from '../context/PollContext';

export const Home = () => {
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchRadius, setSearchRadius] = useState(50); // Default 50km

    const { polls } = usePolls();
    const navigate = useNavigate();

    useEffect(() => {
        let mounted = true;
        getUserLocation()
            .then(async (pos) => {
                if (!mounted) return;
                try {
                    const name = await getLocationName(pos.lat, pos.lng);
                    if (mounted) {
                        setLocation({ ...pos, name });
                        setLoadingLocation(false);
                    }
                } catch (e) {
                    if (mounted) {
                        setLocation({ ...pos, name: 'Unknown Location' });
                        setLoadingLocation(false);
                    }
                }
            })
            .catch(err => {
                console.log("Using default location", err);
                if (mounted) {
                    setLocation({ lat: 37.7749, lng: -122.4194, name: 'Silicon Valley' });
                    setLoadingLocation(false);
                }
            });
        return () => { mounted = false; };
    }, []);

    const categories = ['All', 'Food', 'Safety', 'Events', 'General'];

    // Sort by distance and Filter
    const filteredPolls = polls
        .map(p => {
            if (!location) return { ...p, distance: 0 };
            return {
                ...p,
                distance: getDistanceFromLatLonInKm(location.lat, location.lng, p.location.lat, p.location.lng)
            };
        })
        .filter(poll => {
            const matchesSearch = poll.question.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || (poll.category && poll.category.includes(selectedCategory));
            const matchesRadius = poll.distance <= searchRadius; // Filter by radius
            return matchesSearch && matchesCategory && matchesRadius;
        })
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // Calculate real stats
    const activePollCount = filteredPolls.length;
    const totalVotes = filteredPolls.reduce((acc, poll) => acc + (poll.votes || 0), 0);
    const closingSoon = 0;

    return (
        <div className="flex flex-col h-full gap-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 flex items-center gap-3">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {loadingLocation ? "Locating..." : `Exploring what's happening around ${location?.name || 'Local Area'}.`}
                    </p>
                </div>

                <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl self-start md:self-auto">
                    <Button
                        variant={viewMode === 'list' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className="gap-2 rounded-lg"
                    >
                        <List size={18} /> List
                    </Button>
                    <Button
                        variant={viewMode === 'map' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('map')}
                        className="gap-2 rounded-lg"
                    >
                        <MapIcon size={18} /> Map
                    </Button>
                </div>
            </header>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card border-none bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-black">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Polls</p>
                            <h3 className="text-2xl font-bold">{activePollCount}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-black">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-purple-500/10 text-purple-500">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                            <h3 className="text-2xl font-bold">{totalVotes}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="glass-card border-none bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-black">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Closing Soon</p>
                            <h3 className="text-2xl font-bold">{closingSoon}</h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Search polls..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-background border border-border/50 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-primary text-white'
                                : 'bg-secondary/50 hover:bg-secondary text-foreground'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-1 py-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Radius: {searchRadius} km</span>
                </div>
                <input
                    type="range"
                    min="1"
                    max="100"
                    value={searchRadius}
                    onChange={(e) => setSearchRadius(Number(e.target.value))}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
            </div>


            <Card className="flex-1 overflow-hidden glass-card border shadow-lg flex flex-col min-h-[500px]">
                <CardHeader className="px-6 py-4 border-b border-border/40">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {viewMode === 'map' ? 'Geographic View' : 'Trending Polls'}
                    </CardTitle>
                </CardHeader>
                {viewMode === 'map' ? (
                    loadingLocation ? (
                        <div className="h-full w-full flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <p>Locating...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full w-full">
                            <Map
                                initialViewState={{
                                    longitude: location?.lng || -122.4194,
                                    latitude: location?.lat || 37.7749,
                                    zoom: 13
                                }}
                                mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                                theme="dark"
                            >
                                {/* User Location Marker */}
                                {location && (
                                    <MapMarker
                                        longitude={location.lng}
                                        latitude={location.lat}
                                        draggable={false}
                                    >
                                        <MarkerContent>
                                            <div className="relative flex items-center justify-center">
                                                <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse z-20 relative"></div>
                                                <div className="absolute w-12 h-12 bg-blue-500/20 rounded-full animate-ping z-10"></div>
                                            </div>
                                        </MarkerContent>
                                    </MapMarker>
                                )}

                                {filteredPolls.map((poll) => (
                                    <MapMarker
                                        key={poll.id}
                                        latitude={poll.location.lat}
                                        longitude={poll.location.lng}
                                        onClick={() => navigate(`/poll/${poll.id}`)}
                                    >
                                        <MarkerContent>
                                            <div className="relative group cursor-pointer">
                                                <div className="absolute -inset-2 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <div className="relative h-8 w-8 rounded-full border-2 border-white bg-primary shadow-lg flex items-center justify-center text-white font-bold text-xs ring-2 ring-primary/30">
                                                    {poll.category ? poll.category[0] : 'P'}
                                                </div>
                                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                    {poll.question}
                                                </div>
                                            </div>
                                        </MarkerContent>
                                    </MapMarker>
                                ))}
                            </Map>
                        </div>
                    )) : (
                    <div className="h-full overflow-y-auto p-6 space-y-4 scroll-area">
                        {filteredPolls.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>No polls found matching your filters.</p>
                            </div>
                        ) : (
                            filteredPolls.map(poll => (
                                <PollCard key={poll.id} poll={poll} distance={poll.distance} onClick={() => navigate(`/poll/${poll.id}`)} />
                            ))
                        )}
                    </div>
                )}
            </Card>
        </div >
    );
};
