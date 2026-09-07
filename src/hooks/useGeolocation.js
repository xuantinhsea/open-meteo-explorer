import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeCoords } from '../utils/geo';

// Geolocation only works in a secure context. Both deployments are HTTPS and
// localhost counts as secure, so this is really a guard for someone serving the
// built site over plain http on a LAN address.
function isAvailable() {
  return typeof navigator !== 'undefined'
    && 'geolocation' in navigator
    && (window.isSecureContext ?? true);
}

function describeError(err) {
  switch (err?.code) {
    case 1: // PERMISSION_DENIED
      return 'Location access was blocked. Enable it for this site in your browser settings, then try again.';
    case 2: // POSITION_UNAVAILABLE
      return 'Your device could not determine a position. Try again outdoors or with Wi-Fi on.';
    case 3: // TIMEOUT
      return 'Timed out while locating you. Try again.';
    default:
      return err?.message || 'Could not get your location.';
  }
}

/**
 * Wraps the browser geolocation API.
 *
 * `locate()` is the explicit user-triggered request. `autoLocate()` only fires
 * when permission has already been granted in a previous visit — asking for a
 * location prompt the moment someone opens the page is hostile, and Safari and
 * Chrome both treat unprompted requests worse than gesture-driven ones.
 */
export function useGeolocation(onLocated) {
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const [supported] = useState(isAvailable);
  // onLocated is recreated each render by callers; keep a ref so locate()
  // stays stable and effects don't re-run on every parent render.
  const cb = useRef(onLocated);
  useEffect(() => { cb.current = onLocated; }, [onLocated]);

  const request = useCallback((opts = {}) => {
    if (!isAvailable()) {
      setError('Location is not available in this browser.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const c = normalizeCoords(pos.coords.latitude, pos.coords.longitude);
        if (!c) {
          setError('Your device reported an invalid position.');
          return;
        }
        cb.current?.({ ...c, accuracy: pos.coords.accuracy });
      },
      (err) => {
        setLocating(false);
        // A silent auto-locate must not surface an error banner the user never
        // asked for; only an explicit tap reports failure.
        if (!opts.silent) setError(describeError(err));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 300000 },
    );
  }, []);

  const locate = useCallback(() => request(), [request]);

  /** Locates without prompting, but only if permission is already granted. */
  const autoLocate = useCallback(async () => {
    if (!isAvailable() || !navigator.permissions?.query) return;
    try {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'granted') request({ silent: true });
    } catch {
      // Firefox has historically thrown for the geolocation permission name.
      // No auto-locate there; the button still works.
    }
  }, [request]);

  return { locate, autoLocate, locating, error, supported, clearError: () => setError(null) };
}
