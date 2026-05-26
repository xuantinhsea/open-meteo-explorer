export function buildShareUrl(params) {
  const { mode, lat, lon, startDate, endDate } = params;
  const baseUrl = window.location.origin + window.location.pathname;
  const queryParams = new URLSearchParams({
    ...(mode && { mode }),
    ...(lat && { lat: lat.toString() }),
    ...(lon && { lon: lon.toString() }),
    ...(startDate && { start: startDate }),
    ...(endDate && { end: endDate }),
  });
  return `${baseUrl}?${queryParams.toString()}`;
}

export function readShareParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    mode: params.get('mode'),
    lat: params.get('lat') ? parseFloat(params.get('lat')) : null,
    lon: params.get('lon') ? parseFloat(params.get('lon')) : null,
    startDate: params.get('start'),
    endDate: params.get('end'),
  };
}
