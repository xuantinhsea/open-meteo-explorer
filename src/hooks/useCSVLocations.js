import { useState, useCallback } from 'react';
import { parseCSV } from '../utils/csvParser';

export function useCSVLocations() {
  const [locations, setLocations] = useState([]);
  const [parseError, setParseError] = useState(null);
  const [skipped, setSkipped] = useState(0);

  const importCSV = useCallback(async (file) => {
    setParseError(null);
    try {
      const { locations: locs, skipped: sk } = await parseCSV(file);
      setLocations(locs);
      setSkipped(sk);
    } catch (e) {
      setParseError(e.message);
    }
  }, []);

  const clearLocations = useCallback(() => {
    setLocations([]);
    setSkipped(0);
    setParseError(null);
  }, []);

  return { locations, parseError, skipped, importCSV, clearLocations };
}
