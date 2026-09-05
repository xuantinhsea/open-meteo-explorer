// ─── Download contact capture ─────────────────────────────────────────────────
// The app is a static site (GitHub Pages), so there is no server of our own to
// post to. Contact details are sent to a Google Apps Script web app, which
// appends a row to a Google Sheet and emails the site owner. See
// scripts/apps-script/README.md for the one-time setup.

const ENDPOINT = import.meta.env.VITE_DOWNLOAD_LOG_ENDPOINT ?? '';

// Values persist across visits so returning users get a prefilled form...
const PROFILE_KEY = 'ome_contact_profile';
// ...but consent is per session, so each new session is captured at least once.
const SESSION_KEY = 'ome_contact_session_ok';

function safeRead(store, key) {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // private mode, disabled storage, or corrupt JSON
  }
}

function safeWrite(store, key, value) {
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the gate simply prompts again next time */
  }
}

/** Last details this browser submitted, for prefilling the form. */
export function getSavedProfile() {
  return safeRead(window.localStorage, PROFILE_KEY);
}

/** Details already confirmed in this browser session, or null. */
export function getSessionProfile() {
  return safeRead(window.sessionStorage, SESSION_KEY);
}

export function saveProfile(profile) {
  safeWrite(window.localStorage, PROFILE_KEY, profile);
  safeWrite(window.sessionStorage, SESSION_KEY, profile);
}

/** Clears the session consent so the next export re-prompts. */
export function forgetSession() {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch { /* nothing to clear */ }
}

export function isTrackingConfigured() {
  return Boolean(ENDPOINT);
}

/**
 * Reports one download. Deliberately fire-and-forget: a failure here must never
 * stop a user getting their data, so the promise always resolves and the caller
 * does not await it before triggering the file.
 *
 * Sent as text/plain so the browser treats it as a simple request — Apps Script
 * web apps reject the CORS preflight that application/json would trigger.
 */
export async function reportDownload(payload) {
  if (!ENDPOINT) return { ok: false, reason: 'not-configured' };

  const body = JSON.stringify({
    ...payload,
    userAgent: navigator.userAgent,
    referrer: document.referrer || null,
    page: window.location.href,
    clientTime: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });
    return { ok: res.ok };
  } catch {
    // Retry opaquely: the request still reaches Apps Script, we just can't read
    // the reply. Better a logged row we can't confirm than a lost one.
    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
      });
      return { ok: true, opaque: true };
    } catch {
      return { ok: false, reason: 'network' };
    }
  }
}
