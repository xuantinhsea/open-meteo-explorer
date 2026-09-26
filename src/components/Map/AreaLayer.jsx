import { useEffect, useMemo, useState } from 'react';
import { GeoJSON, CircleMarker, Polyline, Polygon, Rectangle, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { toGeoJSON } from '../../utils/aoi';

const SELECTED_STYLE = { color: '#2563eb', weight: 2, fillColor: '#3b82f6', fillOpacity: 0.12 };
const OTHER_STYLE    = { color: '#64748b', weight: 1, fillColor: '#94a3b8', fillOpacity: 0.05, dashArray: '3 3' };
const DRAFT_STYLE    = { color: '#f97316', weight: 2, dashArray: '5 5', fillOpacity: 0.08 };

// Stable id per features array, so the GeoJSON layer remounts when new data is loaded
const featureIds = new WeakMap();
let nextFeatureId = 1;
function idOf(features) {
  if (!featureIds.has(features)) featureIds.set(features, nextFeatureId++);
  return featureIds.get(features);
}

export default function AreaLayer({ features, selected, onSelectFeature, points, drawMode, onDrawComplete, onDrawCancel }) {
  const geojson = useMemo(() => toGeoJSON(features), [features]);
  // react-leaflet's GeoJSON doesn't react to data/style changes, so remount it via key
  const layerKey = `${idOf(features)}-${selected}-${drawMode || ''}`;

  return (
    <>
      {features.length > 0 && (
        <GeoJSON
          key={layerKey}
          data={geojson}
          style={(f) => (selected === 'all' || f.properties._idx === selected ? SELECTED_STYLE : OTHER_STYLE)}
          onEachFeature={(f, layer) => {
            layer.bindTooltip(f.properties._name, { sticky: true });
            layer.on('click', () => { if (!drawMode) onSelectFeature(f.properties._idx); });
          }}
        />
      )}
      <FitToFeatures features={features} />

      {points.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.lat, p.lon]}
          radius={2.5}
          pathOptions={{ color: '#1d4ed8', weight: 1, fillColor: '#60a5fa', fillOpacity: 0.9 }}
          interactive={false}
        />
      ))}

      {drawMode && <DrawTool mode={drawMode} onComplete={onDrawComplete} onCancel={onDrawCancel} />}
    </>
  );
}

function FitToFeatures({ features }) {
  const map = useMap();
  useEffect(() => {
    if (!features.length) return;
    const bounds = L.geoJSON(toGeoJSON(features)).getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 11 });
  }, [features, map]);
  return null;
}

function DrawTool({ mode, onComplete, onCancel }) {
  const map = useMap();
  const [vertices, setVertices] = useState([]); // [[lat, lng], …]
  const [cursor, setCursor] = useState(null);

  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = 'crosshair';
    map.doubleClickZoom.disable();
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => {
      container.style.cursor = '';
      map.doubleClickZoom.enable();
      window.removeEventListener('keydown', onKey);
    };
  }, [map, onCancel]);

  // The map uses worldCopyJump, so a shape drawn on a neighbouring world copy
  // has longitudes beyond ±180. Shift the whole ring back by whole turns
  // (rather than wrapping each vertex, which would tear shapes crossing 180°).
  function complete(ring, kind) {
    const shift = Math.round(ring[0][0] / 360) * 360;
    onComplete(ring.map(([lng, lat]) => [lng - shift, lat]), kind);
  }

  function finishPolygon(verts) {
    // Drop consecutive duplicates produced by the double-click's two click events
    const clean = verts.filter((v, i) => i === 0 || map.latLngToContainerPoint(v).distanceTo(map.latLngToContainerPoint(verts[i - 1])) > 3);
    if (clean.length < 3) return;
    complete(clean.map(([lat, lng]) => [lng, lat]), 'polygon');
  }

  useMapEvents({
    mousemove: (e) => setCursor([e.latlng.lat, e.latlng.lng]),
    click: (e) => {
      const pt = [e.latlng.lat, e.latlng.lng];
      if (mode === 'rectangle') {
        if (!vertices.length) { setVertices([pt]); return; }
        const [a] = vertices;
        const s = Math.min(a[0], pt[0]), n = Math.max(a[0], pt[0]);
        const w = Math.min(a[1], pt[1]), eLng = Math.max(a[1], pt[1]);
        if (n - s < 1e-4 || eLng - w < 1e-4) return;
        complete([[w, s], [eLng, s], [eLng, n], [w, n]], 'rectangle');
        return;
      }
      // Polygon: clicking near the first vertex closes it
      if (vertices.length >= 3 && map.latLngToContainerPoint(vertices[0]).distanceTo(e.containerPoint) < 10) {
        finishPolygon(vertices);
        return;
      }
      setVertices((v) => [...v, pt]);
    },
    dblclick: () => { if (mode === 'polygon') finishPolygon(vertices); },
  });

  if (mode === 'rectangle') {
    return vertices.length && cursor ? <Rectangle bounds={[vertices[0], cursor]} pathOptions={DRAFT_STYLE} /> : null;
  }
  return (
    <>
      {vertices.length > 0 && cursor && (
        <Polyline positions={[...vertices, cursor]} pathOptions={DRAFT_STYLE} />
      )}
      {vertices.length >= 3 && <Polygon positions={vertices} pathOptions={{ ...DRAFT_STYLE, weight: 0 }} />}
      {vertices.map((v, i) => (
        <CircleMarker key={i} center={v} radius={4} pathOptions={{ color: '#f97316', fillColor: '#fff', fillOpacity: 1, weight: 2 }}>
          {i === 0 && vertices.length >= 3 && <Tooltip direction="top">Click to close</Tooltip>}
        </CircleMarker>
      ))}
    </>
  );
}
