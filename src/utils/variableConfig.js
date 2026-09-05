export const MODES = [
  { id: 'forecast',   label: 'Forecast' },
  { id: 'historical', label: 'Historical' },
  { id: 'ensemble',   label: 'Ensemble' },
  { id: 'climate',    label: 'Climate Change' },
  { id: 'marine',     label: 'Marine' },
  { id: 'flood',      label: 'Flood' },
  { id: 'projection', label: 'WB Projection' },
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
  marine: {
    hourly: [
      { id: 'wave_height',               label: 'Wave Height',               group: 'Waves' },
      { id: 'wave_direction',            label: 'Wave Direction',            group: 'Waves' },
      { id: 'wave_period',               label: 'Wave Period',               group: 'Waves' },
      { id: 'wave_peak_period',          label: 'Wave Peak Period',          group: 'Waves' },
      { id: 'wind_wave_height',          label: 'Wind Wave Height',          group: 'Wind Waves' },
      { id: 'wind_wave_direction',       label: 'Wind Wave Direction',       group: 'Wind Waves' },
      { id: 'wind_wave_period',          label: 'Wind Wave Period',          group: 'Wind Waves' },
      { id: 'wind_wave_peak_period',     label: 'Wind Wave Peak Period',     group: 'Wind Waves' },
      { id: 'swell_wave_height',         label: 'Swell Height',              group: 'Swell' },
      { id: 'swell_wave_direction',      label: 'Swell Direction',           group: 'Swell' },
      { id: 'swell_wave_period',         label: 'Swell Period',              group: 'Swell' },
      { id: 'swell_wave_peak_period',    label: 'Swell Peak Period',         group: 'Swell' },
      { id: 'sea_surface_temperature',   label: 'Sea Surface Temperature',   group: 'Ocean (SMOC only)' },
      { id: 'sea_level_height',          label: 'Sea Level Height',          group: 'Ocean (SMOC only)' },
      { id: 'ocean_current_velocity',    label: 'Ocean Current Speed',       group: 'Ocean (SMOC only)' },
      { id: 'ocean_current_direction',   label: 'Ocean Current Direction',   group: 'Ocean (SMOC only)' },
      { id: 'invert_barometer_height',   label: 'Inverted Barometer Height', group: 'Ocean (SMOC only)' },
    ],
    daily: [
      { id: 'wave_height_max',                label: 'Wave Height Max',           group: 'Waves' },
      { id: 'wave_direction_dominant',        label: 'Wave Direction Dominant',   group: 'Waves' },
      { id: 'wave_period_max',                label: 'Wave Period Max',           group: 'Waves' },
      { id: 'wind_wave_height_max',           label: 'Wind Wave Height Max',      group: 'Wind Waves' },
      { id: 'wind_wave_direction_dominant',   label: 'Wind Wave Dir Dominant',    group: 'Wind Waves' },
      { id: 'wind_wave_period_max',           label: 'Wind Wave Period Max',      group: 'Wind Waves' },
      { id: 'wind_wave_peak_period_max',      label: 'Wind Wave Peak Period Max', group: 'Wind Waves' },
      { id: 'swell_wave_height_max',          label: 'Swell Height Max',          group: 'Swell' },
      { id: 'swell_wave_direction_dominant',  label: 'Swell Direction Dominant',  group: 'Swell' },
      { id: 'swell_wave_period_max',          label: 'Swell Period Max',          group: 'Swell' },
      { id: 'swell_wave_peak_period_max',     label: 'Swell Peak Period Max',     group: 'Swell' },
    ],
  },
  flood: {
    daily: [
      { id: 'river_discharge',        label: 'River Discharge',    group: 'Discharge' },
      { id: 'river_discharge_mean',   label: 'Discharge Mean',     group: 'Ensemble' },
      { id: 'river_discharge_median', label: 'Discharge Median',   group: 'Ensemble' },
      { id: 'river_discharge_max',    label: 'Discharge Max',      group: 'Ensemble' },
      { id: 'river_discharge_min',    label: 'Discharge Min',      group: 'Ensemble' },
      { id: 'river_discharge_p25',    label: 'Discharge P25',      group: 'Ensemble' },
      { id: 'river_discharge_p75',    label: 'Discharge P75',      group: 'Ensemble' },
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
      id: 'era5_seamless', label: 'ERA5 Seamless (recommended)',
      dataRange: { start: '1940-01-01', end: 'present', delayDays: 6, resolution: 'Hourly', resolutionKm: '11–25 km', region: 'Global', updateFreq: 'Daily' },
    },
    {
      id: 'era5', label: 'ERA5 (ECMWF)',
      dataRange: { start: '1940-01-01', end: 'present', delayDays: 6, resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', updateFreq: 'Daily' },
    },
    {
      id: 'era5_land', label: 'ERA5-Land (ECMWF)',
      dataRange: { start: '1950-01-01', end: 'present', delayDays: 6, resolution: 'Hourly', resolutionKm: '11 km', region: 'Global', updateFreq: 'Daily' },
    },
    {
      id: 'ecmwf_ifs', label: 'ECMWF IFS',
      dataRange: { start: '2017-01-01', end: 'present', delayDays: 0, resolution: 'Hourly', resolutionKm: '9 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'era5_ensemble', label: 'ERA5 Ensemble',
      dataRange: { start: '1940-01-01', end: 'present', delayDays: 6, resolution: '3-Hourly', resolutionKm: '55 km', region: 'Global', updateFreq: 'Daily' },
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
  marine: [
    {
      id: 'best_match', label: 'Best Match (auto)',
      dataRange: { start: 'past92d', end: '+16d', resolution: 'Hourly', resolutionKm: 'Varies', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'meteofrance_wave', label: 'MFWAM (Météo-France)',
      dataRange: { start: '2021-10-01', end: '+10d', resolution: '3-Hourly', resolutionKm: '8 km', region: 'Global', updateFreq: 'Every 12 h' },
    },
    {
      id: 'meteofrance_currents', label: 'SMOC Currents & SST (Météo-France) — Ocean vars only',
      dataRange: { start: '2022-01-01', end: '+10d', resolution: 'Hourly', resolutionKm: '8 km', region: 'Global', updateFreq: 'Every 24 h' },
    },
    {
      id: 'ecmwf_wam025', label: 'ECMWF WAM 0.25°',
      dataRange: { start: '2024-03-01', end: '+15d', resolution: '3-Hourly', resolutionKm: '25 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'ncep_gfswave025', label: 'GFS Wave 0.25° (NCEP)',
      dataRange: { start: '2024-06-01', end: '+16d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', updateFreq: 'Every 6 h' },
    },
    {
      id: 'ncep_gfswave016', label: 'GFS Wave 0.16° high-res (NCEP)',
      dataRange: { start: '2024-10-01', end: '+16d', resolution: 'Hourly', resolutionKm: '16 km', region: '52.5°N–15°S', updateFreq: 'Every 6 h' },
    },
    {
      id: 'ewam', label: 'EWAM (DWD Europe)',
      dataRange: { start: '2022-08-01', end: '+8d', resolution: 'Hourly', resolutionKm: '5 km', region: 'Europe', updateFreq: 'Every 12 h' },
    },
    {
      id: 'gwam', label: 'GWAM (DWD Global)',
      dataRange: { start: '2022-08-01', end: '+4d', resolution: 'Hourly', resolutionKm: '25 km', region: 'Global', updateFreq: 'Every 12 h' },
    },
    {
      id: 'era5_ocean', label: 'ERA5-Ocean (historical)',
      dataRange: { start: '1940-01-01', end: 'present', delayDays: 6, resolution: 'Hourly', resolutionKm: '50 km', region: 'Global', updateFreq: 'Daily' },
    },
  ],
  flood: [
    {
      id: 'seamless_v4', label: 'GloFAS v4 Seamless (default)',
      dataRange: { start: '1984-01-01', end: '+210d', resolution: 'Daily', resolutionKm: '5 km', region: 'Global', updateFreq: 'Daily/Monthly' },
    },
    {
      id: 'forecast_v4', label: 'GloFAS v4 Forecast',
      dataRange: { start: '1984-01-01', end: '+30d', resolution: 'Daily', resolutionKm: '5 km', region: 'Global', updateFreq: 'Daily' },
    },
    {
      id: 'consolidated_v4', label: 'GloFAS v4 Reanalysis',
      dataRange: { start: '1984-01-01', end: '2022-07-31', resolution: 'Daily', resolutionKm: '5 km', region: 'Global', updateFreq: 'Archived' },
    },
    {
      id: 'seasonal_v4', label: 'GloFAS v4 Seasonal',
      dataRange: { start: '1984-01-01', end: '+210d', resolution: 'Daily', resolutionKm: '5 km', region: 'Global', updateFreq: 'Monthly' },
    },
    {
      id: 'seamless_v3', label: 'GloFAS v3 Seamless',
      dataRange: { start: '1984-01-01', end: '+30d', resolution: 'Daily', resolutionKm: '11 km', region: 'Global', updateFreq: 'Daily/Monthly' },
    },
    {
      id: 'forecast_v3', label: 'GloFAS v3 Forecast',
      dataRange: { start: '1984-01-01', end: '+30d', resolution: 'Daily', resolutionKm: '11 km', region: 'Global', updateFreq: 'Daily' },
    },
    {
      id: 'consolidated_v3', label: 'GloFAS v3 Reanalysis',
      dataRange: { start: '1984-01-01', end: '2022-07-31', resolution: 'Daily', resolutionKm: '11 km', region: 'Global', updateFreq: 'Archived' },
    },
    {
      id: 'seasonal_v3', label: 'GloFAS v3 Seasonal',
      dataRange: { start: '1984-01-01', end: '+210d', resolution: 'Daily', resolutionKm: '11 km', region: 'Global', updateFreq: 'Monthly' },
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

// ─── Per-model variable availability ──────────────────────────────────────────
// Some datasets answer HTTP 200 for every variable but return an array of nulls
// for the ones they don't actually carry, so an unsupported variable looks like
// an empty chart rather than an error. Only models that carry a *subset* need an
// entry here; a model with no entry is treated as supporting everything its mode
// offers. Verified against the live archive API (Berlin, 2024-06-01).
export const MODEL_VARIABLE_SUPPORT = {
  historical: {
    // ERA5-Land on Open-Meteo only serves 2 m temperature, dew point and the
    // relative humidity derived from them. Use ERA5 Seamless for everything else.
    era5_land: {
      note: 'ERA5-Land only carries temperature and humidity. Pick ERA5 Seamless for precipitation, wind, cloud or radiation at the same 11 km resolution.',
      hourly: ['temperature_2m', 'dew_point_2m', 'relative_humidity_2m'],
      daily: ['temperature_2m_max', 'temperature_2m_min', 'temperature_2m_mean'],
    },
  },
  marine: {
    // SMOC is ocean-state only; the wave models carry no ocean variables.
    meteofrance_currents: {
      note: 'SMOC is an ocean-state model: it carries currents, sea surface temperature and sea level only — no wave variables.',
      hourly: ['sea_surface_temperature', 'sea_level_height', 'ocean_current_velocity', 'ocean_current_direction', 'invert_barometer_height'],
      daily: [],
    },
  },
};

// Returns the ids in varIds that the given model does not carry.
export function getUnsupportedVars(mode, modelId, resolution, varIds = []) {
  const spec = MODEL_VARIABLE_SUPPORT[mode]?.[modelId];
  if (!spec) return [];
  const supported = spec[resolution === 'daily' ? 'daily' : 'hourly'];
  if (!supported) return [];
  const set = new Set(supported);
  return varIds.filter((id) => !set.has(id));
}

// True when this model carries the variable at this resolution.
export function isVarSupported(mode, modelId, resolution, varId) {
  return getUnsupportedVars(mode, modelId, resolution, [varId]).length === 0;
}

// The human-readable caveat for a model, if it has one.
export function getModelSupportNote(mode, modelId) {
  return MODEL_VARIABLE_SUPPORT[mode]?.[modelId]?.note ?? null;
}

export const DEFAULT_VARIABLES = {
  forecast:   { hourly: ['temperature_2m', 'precipitation'], daily: [] },
  historical: { hourly: ['temperature_2m', 'precipitation'], daily: [] },
  ensemble:   { hourly: ['temperature_2m', 'precipitation'], daily: [] },
  climate:    { daily: ['temperature_2m_max', 'temperature_2m_min', 'precipitation_sum'] },
  marine:     { hourly: ['wave_height', 'wave_direction', 'wave_period', 'swell_wave_height'], daily: [] },
  flood:      { daily: ['river_discharge'] },
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

// Marine variable groupings for ChartPanel
export const MARINE_HEIGHT_IDS = new Set([
  'wave_height', 'wind_wave_height', 'swell_wave_height',
  'wave_height_max', 'wind_wave_height_max', 'swell_wave_height_max',
]);
export const MARINE_PERIOD_IDS = new Set([
  'wave_period', 'wave_peak_period', 'wind_wave_period', 'wind_wave_peak_period',
  'swell_wave_period', 'swell_wave_peak_period',
  'wave_period_max', 'wind_wave_period_max', 'wind_wave_peak_period_max',
  'swell_wave_period_max', 'swell_wave_peak_period_max',
]);
export const MARINE_DIRECTION_IDS = new Set([
  'wave_direction', 'wind_wave_direction', 'swell_wave_direction', 'ocean_current_direction',
  'wave_direction_dominant', 'wind_wave_direction_dominant', 'swell_wave_direction_dominant',
]);
export const MARINE_OCEAN_IDS = new Set([
  'sea_surface_temperature', 'sea_level_height', 'ocean_current_velocity', 'invert_barometer_height',
]);
