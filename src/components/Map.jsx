import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";

const MAP_STYLES = [
    {
        "elementType": "geometry",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#212121" }]
    },
    {
        "featureType": "administrative",
        "elementType": "geometry",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "administrative.country",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#9e9e9e" }]
    },
    {
        "featureType": "administrative.land_parcel",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "administrative.locality",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#bdbdbd" }]
    },
    {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [{ "color": "#181818" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels.text.stroke",
        "stylers": [{ "color": "#1b1b1b" }]
    },
    {
        "featureType": "road",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#2c2c2c" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#8a8a8a" }]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [{ "color": "#373737" }]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [{ "color": "#3c3c3c" }]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "geometry",
        "stylers": [{ "color": "#4e4e4e" }]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#616161" }]
    },
    {
        "featureType": "transit",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#757575" }]
    },
    {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#000000" }]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#3d3d3d" }]
    }
];

const MapComponent = ({ center, polls, onPollClick }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const markersRef = useRef([]);

    useEffect(() => {
        if (mapRef.current && !map) {
            const newMap = new window.google.maps.Map(mapRef.current, {
                center: center,
                zoom: 14,
                disableDefaultUI: true,
                styles: MAP_STYLES, // Apply premium styles
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
            });
            setMap(newMap);
        }
    }, [mapRef, map, center]);

    useEffect(() => {
        if (map) {
            map.setCenter(center);
        }
    }, [center, map]);

    useEffect(() => {
        if (map) {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            // Add new markers
            polls.forEach(poll => {
                const marker = new window.google.maps.Marker({
                    position: { lat: poll.location.lat, lng: poll.location.lng },
                    map: map,
                    title: poll.question,
                    animation: window.google.maps.Animation.DROP,
                    // Icon could be customized for premium look (SVG)
                });

                marker.addListener("click", () => {
                    onPollClick(poll);
                });

                markersRef.current.push(marker);
            });
        }
    }, [polls, map, onPollClick]);

    return <div ref={mapRef} style={{ width: "100%", height: "100%", borderRadius: "inherit" }} className="map-container" />;
};

export const Map = ({ apiKey, center, polls, onPollClick }) => {
    return (
        <Wrapper apiKey={apiKey}>
            <MapComponent center={center} polls={polls} onPollClick={onPollClick} />
        </Wrapper>
    );
};
