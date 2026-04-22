export const MODES = [
  { id: 'forecast', label: 'Forecast' },
  { id: 'historical', label: 'Historical' },
  { id: 'ensemble', label: 'Ensemble' },
  { id: 'climate', label: 'Climate Change' },
];

export const VARIABLES = {
  forecast: {
    hourly: [
      { id: 'temperature_2m', label: 'Temperature 2m', group: 'Temperature' },
      { id: 'apparent_temperature', label: 'Apparent Temperature', group: 'Temperature' },
      { id: 'dew_point_2m', label: 'Dew Point 2m', group: 'Temperature' },
      { id: 'precipitation', label: 'Precipitation', group: 'Precipitation' },
      { id: 'rain', label: 'Rain', group: 'Precipitation' },
      { id: 'snowfall', label: 'Snowfall', group: 'Precipitation' },
      { id: 'precipitation_probability', label: 'Precipitation Probability', group: 'Precipitation' },
      { id: 'wind_speed_10m', label: 'Wind Speed 10m', group: 'Wind' },
      { id: 'wind_direction_10m', label: 'Wind Direction 10m', group: 'Wind' },
      { id: 'wind_gusts_10m', label: 'Wind Gusts 10m', group: 'Wind' },
      { id: 'relative_humidity_2m', label: 'Relative Humidity 2m', group: 'Humidity' },
      { id: 'cloud_cover', label: 'Cloud Cover', group: 'Other' },
      { id: 'pressure_msl', label: 'Sea Level Pressure', group: 'Other' },
      { id: 'weather_code', label: 'Weather Code', group: 'Other' },
      { id: 'uv_index', label: 'UV Index', group: 'Other' },
    ],
    daily: [
      { id: 'temperature_2m_max', label: 'Temperature Max', group: 'Temperature' },
      { id: 'temperature_2m_min', label: 'Temperature Min', group: 'Temperature' },
      { id: 'apparent_temperature_max', label: 'Apparent Temp Max', group: 'Temperature' },
      { id: 'apparent_temperature_min', label: 'Apparent Temp Min', group: 'Temperature' },
      { id: 'precipitation_sum', label: 'Precipitation Sum', group: 'Precipitation' },
      { id: 'rain_sum', label: 'Rain Sum', group: 'Precipitation' },
      { id: 'snowfall_sum', label: 'Snowfall Sum', group: 'Precipitation' },
      { id: 'precipitation_probability_max', label: 'Precip Probability Max', group: 'Precipitation' },
      { id: 'wind_speed_10m_max', label: 'Wind Speed Max', group: 'Wind' },
      { id: 'wind_gusts_10m_max', label: 'Wind Gusts Max', group: 'Wind' },
      { id: 'shortwave_radiation_sum', label: 'Solar Radiation Sum', group: 'Other' },
      { id: 'uv_index', label: 'UV Index Max', group: 'Other' },
      { id: 'sunrise', label: 'Sunrise', group: 'Other' },
      { id: 'sunset', label: 'Sunset', group: 'Other' },
    ],
  },
  historical: {
    hourly: [
      { id: 'temperature_2m', label: 'Temperature 2m', group: 'Temperature' },
      { id: 'apparent_temperature', label: 'Apparent Temperature', group: 'Temperature' },
      { id: 'dew_point_2m', label: 'Dew Point 2m', group: 'Temperature' },
      { id: 'precipitation', label: 'Precipitation', group: 'Precipitation' },
      { id: 'rain', label: 'Rain', group: 'Precipitation' },
      { id: 'snowfall', label: 'Snowfall', group: 'Precipitation' },
      { id: 'wind_speed_10m', label: 'Wind Speed 10m', group: 'Wind' },
      { id: 'wind_direction_10m', label: 'Wind Direction 10m', group: 'Wind' },
      { id: 'wind_gusts_10m', label: 'Wind Gusts 10m', group: 'Wind' },
      { id: 'relative_humidity_2m', label: 'Relative Humidity 2m', group: 'Humidity' },
      { id: 'cloud_cover', label: 'Cloud Cover', group: 'Other' },
      { id: 'pressure_msl', label: 'Sea Level Pressure', group: 'Other' },
      { id: 'shortwave_radiation', label: 'Solar Radiation', group: 'Other' },
      { id: 'et0_fao_evapotranspiration', label: 'Evapotranspiration', group: 'Other' },
    ],
    daily: [
      { id: 'temperature_2m_max', label: 'Temperature Max', group: 'Temperature' },
      { id: 'temperature_2m_min', label: 'Temperature Min', group: 'Temperature' },
      { id: 'temperature_2m_mean', label: 'Temperature Mean', group: 'Temperature' },
      { id: 'apparent_temperature_max', label: 'Apparent Temp Max', group: 'Temperature' },
      { id: 'apparent_temperature_min', label: 'Apparent Temp Min', group: 'Temperature' },
      { id: 'precipitation_sum', label: 'Precipitation Sum', group: 'Precipitation' },
      { id: 'rain_sum', label: 'Rain Sum', group: 'Precipitation' },
      { id: 'snowfall_sum', label: 'Snowfall Sum', group: 'Precipitation' },
      { id: 'wind_speed_10m_max', label: 'Wind Speed Max', group: 'Wind' },
      { id: 'wind_gusts_10m_max', label: 'Wind Gusts Max', group: 'Wind' },
      { id: 'shortwave_radiation_sum', label: 'Solar Radiation Sum', group: 'Other' },
      { id: 'et0_fao_evapotranspiration', label: 'Evapotranspiration', group: 'Other' },
    ],
  },
  ensemble: {
    hourly: [
      { id: 'temperature_2m', label: 'Temperature 2m', group: 'Temperature' },
      { id: 'apparent_temperature', label: 'Apparent Temperature', group: 'Temperature' },
      { id: 'precipitation', label: 'Precipitation', group: 'Precipitation' },
      { id: 'rain', label: 'Rain', group: 'Precipitation' },
      { id: 'snowfall', label: 'Snowfall', group: 'Precipitation' },
      { id: 'wind_speed_10m', label: 'Wind Speed 10m', group: 'Wind' },
      { id: 'wind_gusts_10m', label: 'Wind Gusts 10m', group: 'Wind' },
      { id: 'relative_humidity_2m', label: 'Relative Humidity 2m', group: 'Humidity' },
      { id: 'cloud_cover', label: 'Cloud Cover', group: 'Other' },
      { id: 'pressure_msl', label: 'Sea Level Pressure', group: 'Other' },
    ],
    daily: [
      { id: 'temperature_2m_max', label: 'Temperature Max', group: 'Temperature' },
      { id: 'temperature_2m_min', label: 'Temperature Min', group: 'Temperature' },
      { id: 'temperature_2m_mean', label: 'Temperature Mean', group: 'Temperature' },
      { id: 'precipitation_sum', label: 'Precipitation Sum', group: 'Precipitation' },
      { id: 'rain_sum', label: 'Rain Sum', group: 'Precipitation' },
      { id: 'snowfall_sum', label: 'Snowfall Sum', group: 'Precipitation' },
      { id: 'wind_speed_10m_max', label: 'Wind Speed Max', group: 'Wind' },
      { id: 'wind_gusts_10m_max', label: 'Wind Gusts Max', group: 'Wind' },
    ],
  },
  climate: {
    daily: [
      { id: 'temperature_2m_max', label: 'Temperature Max', group: 'Temperature' },
      { id: 'temperature_2m_min', label: 'Temperature Min', group: 'Temperature' },
      { id: 'temperature_2m_mean', label: 'Temperature Mean', group: 'Temperature' },
      { id: 'precipitation_sum', label: 'Precipitation Sum', group: 'Precipitation' },
      { id: 'rain_sum', label: 'Rain Sum', group: 'Precipitation' },
      { id: 'snowfall_sum', label: 'Snowfall Sum', group: 'Precipitation' },
      { id: 'wind_speed_10m_mean', label: 'Wind Speed Mean', group: 'Wind' },
      { id: 'wind_speed_10m_max', label: 'Wind Speed Max', group: 'Wind' },
      { id: 'relative_humidity_2m_mean', label: 'Relative Humidity Mean', group: 'Humidity' },
      { id: 'cloud_cover_mean', label: 'Cloud Cover Mean', group: 'Other' },
      { id: 'shortwave_radiation_sum', label: 'Solar Radiation Sum', group: 'Other' },
      { id: 'et0_fao_evapotranspiration', label: 'Evapotranspiration', group: 'Other' },
    ],
  },
};

// dataRange fields:
//   start: ISO date | 'past92d' (92 days ago, for forecast history window)
//   end: ISO date | 'present' | '+Nd' (N days from today)
//   delayDays: update lag in days (for 'present' end)
//   resolution: temporal resolution label
//   resolutionKm: spatial resolution label
//   region: coverage area
//   members: ensemble member count (ensemble mode only)
//   updateFreq: how often the model is updated

export const MODELS = {
  forecast: [
    {
      id: 'best_match', label: 'Best Match (auto)',
      dataRange: { start: 'past92d', end: '+16d', resolution: 'Hourly', resolutionKm: 'Varies', region: 'Global', updateFreq: 'Varies' },
    },
    {
      id: 'icon_seamless', label: 'ICON Seamless (DWD)',
      dataRange: { start: 'past92d', end: '+7.5d', resolution: 'Hourly', resolutionKm: '2–11 km', region: 'Global', updateFreq: 'Every 3 h' },
    },
    {
      id: 'icon_global', label: 'ICON Global (DWD)',
      dataRange: { start: 'past92d', end: '+7.5d', resolution: 'Hourly', resolutionKm: '11 km', region: 'Global', updateFreq: 'Every 3 h' },
    },
    {
      id: 'gfs_seamless', label: 'GFS Seamless (NOAA)',
      dataRange: { start: 'past92d', end: '+16d', resolution: 'Hourly', resolutionKm: '3–25 km', region: 'Global', updateFreq: 'Every 1 h' },
    },
    {
      id: 'gfs_global', label: 'GFS Global (NOAA)',
      dataRange: { start: 'past92d', end: '+16d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'ecmwf_ifs04', label: 'IFS 0.4° (ECMWF)',
      dataRange: { start: 'past92d', end: '+15d', resolution: 'Hourly', resolutionKm: '44 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'ecmwf_aifs025', label: 'AIFS 0.25° (ECMWF)',
      dataRange: { start: 'past92d', end: '+15d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'gem_seamless', label: 'GEM (Canada)',
      dataRange: { start: 'past92d', end: '+10d', resolution: 'Hourly', resolutionKm: '2.5 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'access_global', label: 'ACCESS-G (BOM)',
      dataRange: { start: 'past92d', end: '+10d', resolution: 'Hourly', resolutionKm: '15 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'arpege_world', label: 'ARPEGE World (Météo-France)',
      dataRange: { start: 'past92d', end: '+4d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'jma_seamless', label: 'JMA Seamless (Japan)',
      dataRange: { start: 'past92d', end: '+11d', resolution: 'Hourly', resolutionKm: '5–55 km', region: 'Global', updateFreq: 'Every 3 h' },
    },
    {
      id: 'ukmo_seamless', label: 'UKMO (UK Met Office)',
      dataRange: { start: 'past92d', end: '+7d', resolution: 'Hourly', resolutionKm: '2–10 km', region: 'Global', updateFreq: 'Every 1 h' },
    },
    {
      id: 'kma_seamless', label: 'KMA (South Korea)',
      dataRange: { start: 'past92d', end: '+12d', resolution: 'Hourly', resolutionKm: '1.5–13 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'metno_seamless', label: 'MET Nordic (Norway)',
      dataRange: { start: 'past92d', end: '+2.5d', resolution: 'Hourly', resolutionKm: '1 km', region: 'Northern Europe', updateFreq: 'Every 1 h' },
    },
    {
      id: 'knmi_seamless', label: 'HARMONIE (KNMI)',
      dataRange: { start: 'past92d', end: '+2.5d', resolution: 'Hourly', resolutionKm: '2 km', region: 'NW Europe', updateFreq: 'Every 1 h' },
    },
    {
      id: 'dmi_seamless', label: 'HARMONIE (DMI)',
      dataRange: { start: 'past92d', end: '+2.5d', resolution: 'Hourly', resolutionKm: '2 km', region: 'N Europe', updateFreq: 'Every 3 h' },
    },
  ],
  historical: [
    {
      id: 'era5', label: 'ERA5 (ECMWF)',
      dataRange: { start: '1940-01-01', end: 'present', delayDays: 5, resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', updateFreq: 'Daily' },
    },
    {
      id: 'era5_land', label: 'ERA5-Land (ECMWF)',
      dataRange: { start: '1950-01-01', end: 'present', delayDays: 5, resolution: 'Hourly', resolutionKm: '11 km', region: 'Global', updateFreq: 'Daily' },
    },
    {
      id: 'ecmwf_ifs', label: 'ECMWF IFS',
      dataRange: { start: '2017-01-01', end: 'present', delayDays: 0, resolution: 'Hourly', resolutionKm: '9 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'era5_ensemble', label: 'ERA5 Ensemble',
      dataRange: { start: '1940-01-01', end: 'present', delayDays: 5, resolution: '3-Hourly', resolutionKm: '55 km', region: 'Global', updateFreq: 'Daily' },
    },
    {
      id: 'cerra', label: 'CERRA (Europe)',
      dataRange: { start: '1985-01-01', end: '2021-06-30', resolution: 'Hourly', resolutionKm: '5 km', region: 'Europe only', updateFreq: 'Archived' },
    },
  ],
  ensemble: [
    {
      id: 'icon_seamless', label: 'ICON Seamless (DWD)',
      dataRange: { start: 'past92d', end: '+7.5d', resolution: 'Hourly', resolutionKm: '2–26 km', region: 'Global', members: 40, updateFreq: 'Every 6–12 h' },
    },
    {
      id: 'icon_global', label: 'ICON Global (DWD)',
      dataRange: { start: 'past92d', end: '+7.5d', resolution: 'Hourly', resolutionKm: '26 km', region: 'Global', members: 40, updateFreq: 'Every 12 h' },
    },
    {
      id: 'icon_eu', label: 'ICON EU (DWD)',
      dataRange: { start: 'past92d', end: '+5d', resolution: 'Hourly', resolutionKm: '13 km', region: 'Europe', members: 40, updateFreq: 'Every 6 h' },
    },
    {
      id: 'gfs025', label: 'GFS 0.25° (NOAA)',
      dataRange: { start: 'past92d', end: '+10d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', members: 31, updateFreq: 'Every 6 h' },
    },
    {
      id: 'gfs05', label: 'GFS 0.5° (NOAA)',
      dataRange: { start: 'past92d', end: '+35d', resolution: 'Hourly', resolutionKm: '50 km', region: 'Global', members: 31, updateFreq: 'Every 6 h' },
    },
    {
      id: 'ecmwf_ifs025', label: 'IFS 0.25° (ECMWF)',
      dataRange: { start: 'past92d', end: '+15d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', members: 51, updateFreq: 'Every 6 h' },
    },
    {
      id: 'ecmwf_aifs025', label: 'AIFS 0.25° (ECMWF)',
      dataRange: { start: 'past92d', end: '+15d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', members: 51, updateFreq: 'Every 6 h' },
    },
    {
      id: 'gem_global', label: 'GEM (Canada)',
      dataRange: { start: 'past92d', end: '+16d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', members: 21, updateFreq: 'Every 12 h' },
    },
    {
      id: 'bom_access_global_ensemble', label: 'ACCESS-GE (BOM)',
      dataRange: { start: 'past92d', end: '+10d', resolution: 'Hourly', resolutionKm: '40 km', region: 'Global', members: 18, updateFreq: 'Every 6 h' },
    },
    {
      id: 'ukmo_global_deterministic_10km', label: 'MOGREPS-G (UKMO)',
      dataRange: { start: 'past92d', end: '+8d', resolution: 'Hourly', resolutionKm: '20 km', region: 'Global', members: 18, updateFreq: 'Every 6 h' },
    },
  ],
  climate: [
    {
      id: 'CMCC_CM2_VHR4', label: 'CMCC-CM2-VHR4 (Italy)',
      dataRange: { start: '1950-01-01', end: '2050-12-31', resolution: 'Daily', resolutionKm: '30 km', region: 'Global' },
    },
    {
      id: 'FGOALS_f3_H', label: 'FGOALS-f3-H (China)',
      dataRange: { start: '1950-01-01', end: '2050-12-31', resolution: 'Daily', resolutionKm: '28 km', region: 'Global' },
    },
    {
      id: 'HiRAM_SIT_HR', label: 'HiRAM-SIT-HR (Taiwan)',
      dataRange: { start: '1950-01-01', end: '2050-12-31', resolution: 'Daily', resolutionKm: '25 km', region: 'Global' },
    },
    {
      id: 'MRI_AGCM3_2_S', label: 'MRI-AGCM3-2-S (Japan)',
      dataRange: { start: '1950-01-01', end: '2050-12-31', resolution: 'Daily', resolutionKm: '20 km', region: 'Global' },
    },
    {
      id: 'EC_Earth3P_HR', label: 'EC-Earth3P-HR (Europe)',
      dataRange: { start: '1950-01-01', end: '2050-12-31', resolution: 'Daily', resolutionKm: '29 km', region: 'Global' },
    },
    {
      id: 'MPI_ESM1_2_XR', label: 'MPI-ESM1-2-XR (Germany)',
      dataRange: { start: '1950-01-01', end: '2050-12-31', resolution: 'Daily', resolutionKm: '51 km', region: 'Global' },
    },
    {
      id: 'NICAM16_8S', label: 'NICAM16-8S (Japan)',
      dataRange: { start: '1950-01-01', end: '2050-12-31', resolution: 'Daily', resolutionKm: '31 km', region: 'Global' },
    },
  ],
};

// Resolves a model's dataRange spec into concrete { min, max } ISO date strings.
export function resolveModelDateRange(dataRange) {
  if (!dataRange) return null;

  function resolveEnd(end, delayDays = 0) {
    if (!end) return null;
    if (end === 'present') {
      const d = new Date();
      d.setDate(d.getDate() - (delayDays || 0));
      return d.toISOString().split('T')[0];
    }
    const m = end.match(/^\+(\d+(?:\.\d+)?)d$/);
    if (m) {
      const d = new Date();
      d.setDate(d.getDate() + Math.floor(parseFloat(m[1])));
      return d.toISOString().split('T')[0];
    }
    return end; // already an ISO date
  }

  function resolveStart(start) {
    if (!start) return null;
    if (start === 'past92d') {
      const d = new Date();
      d.setDate(d.getDate() - 92);
      return d.toISOString().split('T')[0];
    }
    return start;
  }

  return {
    min: resolveStart(dataRange.start),
    max: resolveEnd(dataRange.end, dataRange.delayDays),
  };
}

// Finds a model config by mode + model id.
export function findModel(mode, modelId) {
  return (MODELS[mode] || []).find((m) => m.id === modelId) || null;
}

export const DEFAULT_VARIABLES = {
  forecast: { hourly: ['temperature_2m', 'precipitation'], daily: [] },
  historical: { hourly: ['temperature_2m', 'precipitation'], daily: [] },
  ensemble: { hourly: ['temperature_2m', 'precipitation'], daily: [] },
  climate: { daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'] },
};

export const TEMP_VARIABLE_IDS = new Set([
  'temperature_2m', 'apparent_temperature', 'dew_point_2m',
  'temperature_2m_max', 'temperature_2m_min', 'temperature_2m_mean',
  'apparent_temperature_max', 'apparent_temperature_min',
]);

export const PRECIP_VARIABLE_IDS = new Set([
  'precipitation', 'rain', 'snowfall', 'precipitation_sum',
  'rain_sum', 'snowfall_sum', 'precipitation_probability', 'precipitation_probability_max',
]);
