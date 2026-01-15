import React, { useState, useEffect } from 'react';
import { Map, MapMarker, MarkerContent } from '../components/ui/map';
import { usePolls } from '../context/PollContext';
import { getUserLocation } from '../services/location';
import { useNavigate } from 'react-router-dom';

export const MapView = () => {
    const { polls } = usePolls();
    const navigate = useNavigate();
    const [location, setLocation] = useState({ lat: 37.7749, lng: -122.4194 });

    useEffect(() => {
        getUserLocation()
            .then(pos => setLocation(pos))
            .catch(err => console.log("Using default location", err));
    }, []);

    return (
        <div className="h-[calc(100vh-4rem)] w-full rounded-2xl overflow-hidden shadow-2xl border border-border/50 relative">
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

            <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border/50 shadow-lg">
                <h2 className="font-bold text-sm">Full Map View</h2>
                <p className="text-xs text-muted-foreground">{polls.length} active polls nearby</p>
            </div>
        </div>
    );
};
