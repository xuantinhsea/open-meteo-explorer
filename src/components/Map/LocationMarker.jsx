import { useMapEvents, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix default Leaflet icon paths broken by Vite bundling
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const csvIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const activeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function ClickHandler({ onMapClick }) {
  // latlng.wrap() folds a click on a repeated world copy back onto the real
  // one, so panning past the antimeridian can't produce a longitude like
  // -220.05615 that the weather APIs reject.
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng.wrap();
      onMapClick(lat, lng);
    },
  });
  return null;
}

function FlyTo({ location }) {
  const map = useMap();
  useEffect(() => {
    if (location) map.flyTo([location.lat, location.lon], Math.max(map.getZoom(), 8), { duration: 1 });
  }, [location, map]);
  return null;
}

export default function LocationMarker({ activeLocation, csvLocations, onMapClick, onCSVPinClick }) {
  return (
    <>
      <ClickHandler onMapClick={onMapClick} />
      <FlyTo location={activeLocation} />

      {activeLocation && (
        <Marker position={[activeLocation.lat, activeLocation.lon]} icon={activeIcon}>
          <Popup>
            <strong>{activeLocation.name || 'Selected Location'}</strong><br />
            {activeLocation.lat.toFixed(4)}, {activeLocation.lon.toFixed(4)}
          </Popup>
        </Marker>
      )}

      {csvLocations.map((loc) => (
        <Marker
          key={loc.id}
          position={[loc.lat, loc.lon]}
          icon={csvIcon}
          eventHandlers={{ click: () => onCSVPinClick(loc) }}
        >
          <Popup>
            <strong>{loc.name}</strong><br />
            {loc.lat.toFixed(4)}, {loc.lon.toFixed(4)}<br />
            <button
              className="mt-1 text-blue-500 underline text-xs"
              onClick={() => onCSVPinClick(loc)}
            >
              Load weather data
            </button>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
