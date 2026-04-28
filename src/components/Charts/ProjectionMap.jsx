import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';
import { getCentroid } from '../../utils/countryCentroids';

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const ZOOM_BY_LEVEL = { country: 4, subnational: 6, watershed: 5 };
const DEFAULT_CENTER = [20, 0];
const DEFAULT_ZOOM = 2;

function FlyTo({ lat, lon, zoom }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lon], zoom); }, [lat, lon, zoom, map]);
  return null;
}

export default function ProjectionMap({ countryISO3, locationName, locationLevel }) {
  const centroid = getCentroid(countryISO3);
  const zoom = ZOOM_BY_LEVEL[locationLevel] ?? 4;

  const center = centroid ? [centroid.lat, centroid.lon] : DEFAULT_CENTER;
  const initZoom = centroid ? zoom : DEFAULT_ZOOM;

  return (
    <MapContainer
      center={center}
      zoom={initZoom}
      scrollWheelZoom
      zoomControl
      attributionControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {centroid && (
        <>
          <FlyTo lat={centroid.lat} lon={centroid.lon} zoom={zoom} />
          <Marker position={[centroid.lat, centroid.lon]} icon={redIcon}>
            <Popup>{locationName || countryISO3}</Popup>
          </Marker>
        </>
      )}
    </MapContainer>
  );
}
