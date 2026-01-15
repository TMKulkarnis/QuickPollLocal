import React, { useState, useEffect } from 'react';
import { Map, MapMarker, MarkerContent } from '../components/ui/map';
import { usePolls } from '../context/PollContext';
import { getUserLocation } from '../services/location';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, MapPin } from 'lucide-react';

export const MapView = () => {
    const { polls } = usePolls();
    const navigate = useNavigate();
    const [location, setLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [locationError, setLocationError] = useState(null);

    const fetchLocation = () => {
        setLoadingLocation(true);
        setLocationError(null);
        getUserLocation()
            .then(pos => {
                setLocation(pos);
                setLoadingLocation(false);
            })
            .catch(err => {
                console.error("Location error", err);
                setLocationError("Location access denied or unavailable.");
                setLocation({ lat: 37.7749, lng: -122.4194 }); // Fallback to SF so map still renders behind popup
                setLoadingLocation(false);
            });
    };

    useEffect(() => {
        fetchLocation();
    }, []);

    if (loadingLocation) {
        return (
            <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center rounded-2xl border border-border/50 glass-card">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Locating you...</p>
                </div>
            </div>
        );
    }

    if (locationError) {
        return (
            <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center rounded-2xl border border-border/50 glass-card">
                <div className="flex flex-col items-center gap-4 text-center p-6 bg-background/50 backdrop-blur-sm rounded-xl border border-red-500/20 shadow-xl max-w-sm">
                    <div className="bg-red-500/10 p-3 rounded-full text-red-500">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Location Required</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            We couldn't find you. Please enable location permissions in your browser to see local polls.
                        </p>
                    </div>
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={fetchLocation}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            Retry
                        </button>
                        <button
                            onClick={() => setLocationError(null)}
                            className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                        >
                            View Global
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 relative">
            <Map
                initialViewState={{
                    longitude: location.lng,
                    latitude: location.lat,
                    zoom: 14
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

            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border/50 shadow-lg">
                <h2 className="font-bold text-sm">Full Map View</h2>
                <p className="text-xs text-muted-foreground">{polls.length} active polls nearby</p>
            </div>
        </div>
    );
};
