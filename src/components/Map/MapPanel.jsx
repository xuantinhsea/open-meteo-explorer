import { MapContainer, TileLayer } from 'react-leaflet';
import LocationMarker from './LocationMarker';

export default function MapPanel({ activeLocation, csvLocations, onMapClick, onCSVPinClick }) {
  return (
    <div className="w-full h-full min-h-[300px]">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        className="h-full w-full"
        style={{ minHeight: 300 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
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
