import { useState, useCallback, useMemo } from 'react';
import { parseAOIFiles, areaKm2 } from '../utils/aoi';

// Holds the loaded/drawn AOI features, which one is selected, and the drawing tool state.
export function useAreaOfInterest() {
  const [source, setSource] = useState(null);       // file name or 'Drawn area'
  const [features, setFeatures] = useState([]);     // [{ name, properties, polygons }]
  const [selected, setSelected] = useState('all');  // 'all' | feature index
  const [drawMode, setDrawMode] = useState(null);   // null | 'rectangle' | 'polygon'
  const [error, setError] = useState(null);
  const [parsing, setParsing] = useState(false);

  const importFiles = useCallback(async (fileList) => {
    setParsing(true);
    setError(null);
    try {
      const { name, features: feats } = await parseAOIFiles(fileList);
      setSource(name);
      setFeatures(feats);
      setSelected(feats.length === 1 ? 0 : 'all');
      setDrawMode(null);
    } catch (e) {
      setError(e.message || 'Could not read the file.');
    } finally {
      setParsing(false);
    }
  }, []);

  // ring: [[lon, lat], …] closed or open
  const setDrawnPolygon = useCallback((ring, kind) => {
    const closed = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1]
      ? ring : [...ring, ring[0]];
    setSource('Drawn area');
    setFeatures([{ name: kind === 'rectangle' ? 'Drawn rectangle' : 'Drawn polygon', properties: {}, polygons: [[closed]] }]);
    setSelected(0);
    setDrawMode(null);
    setError(null);
  }, []);

  const clear = useCallback(() => {
    setSource(null);
    setFeatures([]);
    setSelected('all');
    setDrawMode(null);
    setError(null);
  }, []);

  const selectedPolygons = useMemo(() => {
    if (!features.length) return [];
    if (selected === 'all') return features.flatMap((f) => f.polygons);
    return features[selected]?.polygons || [];
  }, [features, selected]);

  const areaName = useMemo(() => {
    if (!features.length) return null;
    if (selected === 'all') return features.length === 1 ? features[0].name : `${source} (all ${features.length} features)`;
    return features[selected]?.name;
  }, [features, selected, source]);

  const area = useMemo(() => (selectedPolygons.length ? areaKm2(selectedPolygons) : 0), [selectedPolygons]);

  return {
    source, features, selected, setSelected,
    drawMode, setDrawMode,
    error, parsing,
    importFiles, setDrawnPolygon, clear,
    selectedPolygons, areaName, areaKm2: area,
  };
}
