"use client";
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }: any) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

function MapUpdater({ searchedLocation, setPosition }: any) {
  const map = useMap();
  useEffect(() => {
    if (searchedLocation) {
      map.flyTo([searchedLocation.lat, searchedLocation.lng], 16);
      setPosition(searchedLocation);
    }
  }, [searchedLocation, map, setPosition]);
  return null;
}

export default function MapPicker({ onLocationSelect, searchedLocation }: { onLocationSelect: (lat: number, lng: number) => void, searchedLocation?: {lat: number, lng: number} | null }) {
  // Default to a central campus location
  const [position, setPosition] = useState<any>({ lat: 31.4746, lng: 74.4375 });

  useEffect(() => {
    if (position) {
      onLocationSelect(position.lat, position.lng);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', marginTop: '8px' }}>
      <MapContainer center={[31.4746, 74.4375]} zoom={17} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} />
        <MapUpdater searchedLocation={searchedLocation} setPosition={setPosition} />
      </MapContainer>
    </div>
  );
}
