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
    const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194, name: 'Silicon Valley' }); // Default SF
    const { polls } = usePolls();
    const navigate = useNavigate();

    useEffect(() => {
        getUserLocation()
            .then(async (pos) => {
                const name = await getLocationName(pos.lat, pos.lng);
                setLocation({ ...pos, name });
            })
            .catch(err => console.log("Using default location", err));
    }, []);

    // Sort by distance (mock logic)
    const sortedPolls = [...polls].map(p => ({
        ...p,
        distance: getDistanceFromLatLonInKm(location.lat, location.lng, p.location.lat, p.location.lng)
    })).sort((a, b) => a.distance - b.distance);

    // Calculate real stats
    const activePollCount = polls.length;
    const totalVotes = polls.reduce((acc, poll) => acc + (poll.votes || 0), 0);
    const closingSoon = 0; // consistent with no expiration logic yet

    return (
        <div className="flex flex-col h-full gap-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-1">Exploring what's happening around {location.name}.</p>
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
                            <h3 className="text-2xl font-bold">{polls.length}</h3>
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

            <Card className="flex-1 overflow-hidden glass-card border shadow-lg flex flex-col min-h-[500px]">
                <CardHeader className="px-6 py-4 border-b border-border/40">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        {viewMode === 'map' ? 'Geographic View' : 'Trending Polls'}
                    </CardTitle>
                </CardHeader>
                {viewMode === 'map' ? (
                    <div className="h-full w-full">
                        <Map
                            initialViewState={{
                                longitude: location.lng,
                                latitude: location.lat,
                                zoom: 13
                            }}
                            mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
                            theme="dark"
                        >
                            {polls.map((poll) => (
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
                ) : (
                    <div className="h-full overflow-y-auto p-6 space-y-4 scroll-area">
                        {sortedPolls.map(poll => (
                            <PollCard key={poll.id} poll={poll} distance={poll.distance} onClick={() => navigate(`/poll/${poll.id}`)} />
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};
