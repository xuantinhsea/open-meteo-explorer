// Area-of-interest helpers: file parsing, geometry, grid sampling and API-quota estimates.
// Geometry follows GeoJSON conventions: coordinates are [lon, lat] in WGS84.
import shp from 'shpjs';

export const MAX_SAMPLE_POINTS = 1000;

// Open-Meteo free tier (non-commercial) limits, in weighted API calls
export const QUOTA = { perMinute: 600, perHour: 5000, perDay: 10000 };

// Modes where an area average makes sense
export const AREA_MODES = new Set(['forecast', 'historical', 'climate', 'marine']);

const NAME_KEYS = [
  'name', 'NAME', 'Name', 'NAME_EN', 'name_en', 'NAME_2', 'NAME_1', 'NAME_0',
  'ADM2_EN', 'ADM1_EN', 'ADM0_EN', 'shapeName', 'BASIN_NAME', 'RIVER_BASIN', 'HYBAS_ID', 'id', 'ID',
];

// ─── File import ──────────────────────────────────────────────────────────────

// Accepts a FileList/array: a .zip shapefile, loose .shp (+ .dbf/.prj/.cpg), .geojson/.json or .kml.
// Returns { name, features } where each feature has { name, properties, polygons }.
export async function parseAOIFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) throw new Error('No file selected.');
  const byExt = {};
  files.forEach((f) => { byExt[f.name.split('.').pop().toLowerCase()] = f; });
  const baseName = files[0].name.replace(/\.[^.]+$/, '');

  let geojson;
  if (byExt.zip) {
    geojson = await shp(await byExt.zip.arrayBuffer());
  } else if (byExt.shp) {
    const obj = { shp: await byExt.shp.arrayBuffer() };
    if (byExt.dbf) obj.dbf = await byExt.dbf.arrayBuffer();
    if (byExt.prj) obj.prj = await byExt.prj.text();
    if (byExt.cpg) obj.cpg = await byExt.cpg.text();
    geojson = await shp(obj);
  } else if (byExt.geojson || byExt.json) {
    geojson = JSON.parse(await (byExt.geojson || byExt.json).text());
  } else if (byExt.kml) {
    geojson = parseKML(await byExt.kml.text());
  } else if (byExt.kmz) {
    throw new Error('KMZ is not supported — unzip it and upload the .kml inside.');
  } else {
    throw new Error('Unsupported file. Use a zipped shapefile (.zip), .shp + .dbf + .prj, .geojson or .kml.');
  }

  const features = normalizeFeatures(geojson);
  if (!features.length) throw new Error('No polygon features found in the file (points and lines cannot define an area).');
  assertGeographic(features, !!(byExt.shp && !byExt.prj));
  return { name: baseName, features };
}

function normalizeFeatures(input) {
  const collections = Array.isArray(input) ? input : [input];
  const out = [];
  collections.forEach((gj) => {
    let feats = [];
    if (gj?.type === 'FeatureCollection') feats = gj.features || [];
    else if (gj?.type === 'Feature') feats = [gj];
    else if (gj?.type) feats = [{ type: 'Feature', properties: {}, geometry: gj }];
    feats.forEach((f) => {
      const polygons = geometryToPolygons(f.geometry);
      if (!polygons.length) return;
      out.push({ name: featureName(f.properties, out.length), properties: f.properties || {}, polygons });
    });
  });
  return out;
}

function geometryToPolygons(g) {
  if (!g) return [];
  if (g.type === 'Polygon') return [g.coordinates];
  if (g.type === 'MultiPolygon') return g.coordinates;
  if (g.type === 'GeometryCollection') return (g.geometries || []).flatMap(geometryToPolygons);
  return [];
}

function featureName(props, idx) {
  if (props) {
    for (const k of NAME_KEYS) {
      if (props[k] !== undefined && props[k] !== null && String(props[k]).trim()) return String(props[k]);
    }
    const firstString = Object.values(props).find((v) => typeof v === 'string' && v.trim());
    if (firstString) return firstString;
  }
  return `Feature ${idx + 1}`;
}

function assertGeographic(features, missingPrj) {
  // Small tolerance: dateline-crossing datasets often go a little past ±180°
  const bad = features.some((f) => f.polygons.some((poly) => poly[0].some(([x, y]) => Math.abs(x) > 190 || Math.abs(y) > 91)));
  if (bad) {
    throw new Error(missingPrj
      ? 'Coordinates are projected (not lat/lon) and no .prj file was given. Upload the .prj too, or a .zip with all shapefile parts.'
      : 'Coordinates are not in WGS84 lat/lon. Reproject to EPSG:4326, or upload a zipped shapefile including its .prj.');
  }
}

function parseKML(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error('Could not read the KML file.');
  const parseRing = (el) => (el?.textContent || '').trim().split(/\s+/)
    .map((c) => c.split(',').map(Number)).filter((c) => c.length >= 2 && !isNaN(c[0]) && !isNaN(c[1]))
    .map(([x, y]) => [x, y]);
  const features = [];
  Array.from(doc.getElementsByTagName('Placemark')).forEach((pm, i) => {
    const polygons = Array.from(pm.getElementsByTagName('Polygon')).map((poly) => {
      const outer = poly.getElementsByTagName('outerBoundaryIs')[0];
      const rings = [parseRing(outer?.getElementsByTagName('coordinates')[0])];
      Array.from(poly.getElementsByTagName('innerBoundaryIs')).forEach((inner) => {
        rings.push(parseRing(inner.getElementsByTagName('coordinates')[0]));
      });
      return rings;
    }).filter((rings) => rings[0].length >= 3);
    if (!polygons.length) return;
    const name = pm.getElementsByTagName('name')[0]?.textContent?.trim() || `Feature ${i + 1}`;
    features.push({ type: 'Feature', properties: { name }, geometry: { type: 'MultiPolygon', coordinates: polygons } });
  });
  return { type: 'FeatureCollection', features };
}

// ─── Geometry ─────────────────────────────────────────────────────────────────

export function toGeoJSON(features) {
  return {
    type: 'FeatureCollection',
    features: features.map((f, i) => ({
      type: 'Feature',
      properties: { ...f.properties, _idx: i, _name: f.name },
      geometry: { type: 'MultiPolygon', coordinates: f.polygons },
    })),
  };
}

export function bboxOf(polygons) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  polygons.forEach((poly) => poly[0].forEach(([x, y]) => {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }));
  return { minX, minY, maxX, maxY };
}

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function pointInPolygons(x, y, polygons) {
  return polygons.some(([outer, ...holes]) => inRing(x, y, outer) && !holes.some((h) => inRing(x, y, h)));
}

// Approximate area in km² (equirectangular projection per ring — fine for AOI sizing)
export function areaKm2(polygons) {
  const R = 6371.0088;
  const ringArea = (ring) => {
    let s = 0;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [x1, y1] = ring[j];
      const [x2, y2] = ring[i];
      s += (x1 * Math.PI / 180) * Math.sin(y2 * Math.PI / 180) - (x2 * Math.PI / 180) * Math.sin(y1 * Math.PI / 180);
    }
    return Math.abs(s) * R * R / 2;
  };
  return polygons.reduce((sum, [outer, ...holes]) => sum + ringArea(outer) - holes.reduce((h, r) => h + ringArea(r), 0), 0);
}

// Shapes crossing the dateline can yield longitudes past ±180, which the API rejects
function wrapLon(x) {
  return ((((x + 180) % 360) + 360) % 360) - 180;
}

// Regular lattice of sample points (~spacingKm apart) inside the polygons.
// Returns { points: [{lat, lon}], tooMany: bool }. Falls back to one interior point for tiny areas.
export function samplePoints(polygons, spacingKm) {
  if (!polygons?.length || !(spacingKm > 0)) return { points: [], tooMany: false };
  const { minX, minY, maxX, maxY } = bboxOf(polygons);
  const midLat = (minY + maxY) / 2;
  const dLat = spacingKm / 111.32;
  const dLon = spacingKm / (111.32 * Math.max(Math.cos(midLat * Math.PI / 180), 0.05));

  const estimate = ((maxY - minY) / dLat + 1) * ((maxX - minX) / dLon + 1);
  if (estimate > MAX_SAMPLE_POINTS * 20) return { points: [], tooMany: true };

  const points = [];
  // Lattice anchored on multiples of the spacing so it is stable when the polygon moves slightly
  for (let y = Math.floor(minY / dLat) * dLat + dLat / 2; y <= maxY; y += dLat) {
    for (let x = Math.floor(minX / dLon) * dLon + dLon / 2; x <= maxX; x += dLon) {
      if (pointInPolygons(x, y, polygons)) {
        points.push({ lat: +y.toFixed(4), lon: +wrapLon(x).toFixed(4) });
        if (points.length > MAX_SAMPLE_POINTS) return { points: [], tooMany: true };
      }
    }
  }

  if (!points.length) {
    // Area smaller than one grid cell: use the outer-ring vertex centroid of the largest polygon
    const ring = polygons.reduce((a, p) => (p[0].length > a.length ? p[0] : a), polygons[0][0]);
    const cx = ring.reduce((s, c) => s + c[0], 0) / ring.length;
    const cy = ring.reduce((s, c) => s + c[1], 0) / ring.length;
    points.push({ lat: +cy.toFixed(4), lon: +wrapLon(cx).toFixed(4) });
  }
  return { points, tooMany: false };
}

// Default sampling spacing = the model's finest grid spacing (e.g. '11–25 km' → 11)
export function defaultSpacingKm(modelMeta) {
  const m = String(modelMeta?.dataRange?.resolutionKm || '').match(/(\d+(?:\.\d+)?)/);
  return m ? Math.max(parseFloat(m[1]), 1) : 10;
}

// Open-Meteo weights calls: >10 variables or >2 weeks per location count as multiple calls
export function callWeightPerLocation(nVars, startDate, endDate) {
  const days = startDate && endDate
    ? Math.max(1, Math.round((new Date(endDate) - new Date(startDate)) / 86400000) + 1)
    : 7;
  return Math.max(1, nVars / 10) * Math.max(1, days / 14);
}
