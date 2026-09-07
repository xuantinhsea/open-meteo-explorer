import { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import LocationMarker from './LocationMarker';

// On mobile the map is hidden with display:none while the charts are shown.
// Leaflet measures its container on creation and has no idea it was resized
// while hidden, so it comes back with grey gaps and a wrong centre until it is
// told to re-measure.
function ResizeOnShow({ active }) {
  const map = useMap();
  useEffect(() => {
    if (!active) return;
    // One frame after the container is displayed again, so it has real
    // dimensions by the time Leaflet reads them.
    const id = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(id);
  }, [active, map]);
  return null;
}

export default function MapPanel({ activeLocation, csvLocations, onMapClick, onCSVPinClick, active = true }) {
  return (
    <div className="w-full h-full min-h-[240px]">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        // Clicks are wrapped back into range, so without this the map would pan
        // right across the world to reach the "real" copy of the point the user
        // just clicked. worldCopyJump keeps the view on the copy they're on.
        worldCopyJump
        minZoom={2}
        maxBoundsViscosity={1}
        className="h-full w-full"
        style={{ minHeight: 240 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeOnShow active={active} />
        <LocationMarker
          activeLocation={activeLocation}
          csvLocations={csvLocations}
          onMapClick={onMapClick}
          onCSVPinClick={onCSVPinClick}
        />
      </MapContainer>
    </div>
  );
}
