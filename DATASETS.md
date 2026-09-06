# Datasets & Features

Complete reference for **Open-Meteo Explorer** — every data mode, model, variable and feature.

> Generated from the application configuration by `scripts/gen-datasets-doc.mjs`.
> Re-run it after editing `variableConfig.js` so this file cannot drift from the code.

## At a glance

|  |  |
|---|---|
| Data modes | 7 |
| Models / datasets | 56 |
| Weather variables | 120 |
| Upstream APIs | 7 |
| Earliest data | 1940-01-01 (ERA5) |
| Latest data | 2100 (CCKP projections) |
| API keys required | None |
| Export formats | CSV, Excel (.xlsx), TXT, PNG |

## Data modes

| Mode | Source | Summary |
|---|---|---|
| [Forecast](#forecast) | Open-Meteo Forecast | Short-range weather from 16 global and regional NWP models. |
| [Historical](#historical) | Open-Meteo Archive | Reanalysis records back to 1940 — a gap-free reconstruction of past weather. |
| [Ensemble](#ensemble) | Open-Meteo Ensemble | Probabilistic forecasts: many runs from perturbed starting conditions. |
| [Climate Change](#climate-change) | Open-Meteo Climate | Downscaled CMIP6 daily projections to 2050. |
| [Marine](#marine) | Open-Meteo Marine | Waves, swell, ocean currents, sea surface temperature and sea level. |
| [Flood](#flood) | Open-Meteo Flood | Simulated daily river discharge from GloFAS. |
| [WB Projection](#wb-projection) | World Bank CCKP | Country and watershed CMIP6 projections to 2100 under three SSP scenarios. |

---

## Forecast

Short-range weather from 16 global and regional numerical weather prediction models. Includes roughly 92 days of recent past, so a forecast can be compared against what actually happened.

**Endpoint** — `https://api.open-meteo.com/v1/forecast`

### Models

| Model | API id | Coverage | Grid | Step | Region |
|---|---|---|---|---|---|
| Best Match (auto) | `best_match` | past 92 days → +16 d ahead | Varies | Hourly | Global |
| ICON Seamless (DWD) | `icon_seamless` | past 92 days → +7.5 d ahead | 2–11 km | Hourly | Global |
| ICON Global (DWD) | `icon_global` | past 92 days → +7.5 d ahead | 11 km | Hourly | Global |
| GFS Seamless (NOAA) | `gfs_seamless` | past 92 days → +16 d ahead | 3–25 km | Hourly | Global |
| GFS Global (NOAA) | `gfs_global` | past 92 days → +16 d ahead | 25 km | Hourly | Global |
| IFS 0.4° (ECMWF) | `ecmwf_ifs04` | past 92 days → +15 d ahead | 44 km | Hourly | Global |
| AIFS 0.25° (ECMWF) | `ecmwf_aifs025` | past 92 days → +15 d ahead | 25 km | Hourly | Global |
| GEM (Canada) | `gem_seamless` | past 92 days → +10 d ahead | 2.5 km | Hourly | Global |
| ACCESS-G (BOM) | `access_global` | past 92 days → +10 d ahead | 15 km | Hourly | Global |
| ARPEGE World (Météo-France) | `arpege_world` | past 92 days → +4 d ahead | 25 km | Hourly | Global |
| JMA Seamless (Japan) | `jma_seamless` | past 92 days → +11 d ahead | 5–55 km | Hourly | Global |
| UKMO (UK Met Office) | `ukmo_seamless` | past 92 days → +7 d ahead | 2–10 km | Hourly | Global |
| KMA (South Korea) | `kma_seamless` | past 92 days → +12 d ahead | 1.5–13 km | Hourly | Global |
| MET Nordic (Norway) | `metno_seamless` | past 92 days → +2.5 d ahead | 1 km | Hourly | Northern Europe |
| HARMONIE (KNMI) | `knmi_seamless` | past 92 days → +2.5 d ahead | 2 km | Hourly | NW Europe |
| HARMONIE (DMI) | `dmi_seamless` | past 92 days → +2.5 d ahead | 2 km | Hourly | N Europe |

### Hourly variables

| Group | Variable | API id |
|---|---|---|
| **Temperature** | Temperature 2m | `temperature_2m` |
|  | Apparent Temperature | `apparent_temperature` |
|  | Dew Point 2m | `dew_point_2m` |
| **Precipitation** | Precipitation | `precipitation` |
|  | Rain | `rain` |
|  | Snowfall | `snowfall` |
|  | Precipitation Probability | `precipitation_probability` |
| **Wind** | Wind Speed 10m | `wind_speed_10m` |
|  | Wind Direction 10m | `wind_direction_10m` |
|  | Wind Gusts 10m | `wind_gusts_10m` |
| **Humidity** | Relative Humidity 2m | `relative_humidity_2m` |
| **Other** | Cloud Cover | `cloud_cover` |
|  | Sea Level Pressure | `pressure_msl` |
|  | Weather Code | `weather_code` |
|  | UV Index | `uv_index` |

### Daily variables

| Group | Variable | API id |
|---|---|---|
| **Temperature** | Temperature Max | `temperature_2m_max` |
|  | Temperature Min | `temperature_2m_min` |
|  | Apparent Temp Max | `apparent_temperature_max` |
|  | Apparent Temp Min | `apparent_temperature_min` |
| **Precipitation** | Precipitation Sum | `precipitation_sum` |
|  | Rain Sum | `rain_sum` |
|  | Snowfall Sum | `snowfall_sum` |
|  | Precip Probability Max | `precipitation_probability_max` |
| **Wind** | Wind Speed Max | `wind_speed_10m_max` |
|  | Wind Gusts Max | `wind_gusts_10m_max` |
| **Other** | Solar Radiation Sum | `shortwave_radiation_sum` |
|  | UV Index Max | `uv_index` |
|  | Sunrise | `sunrise` |
|  | Sunset | `sunset` |

**Selected by default:** `temperature_2m`, `precipitation`

---

## Historical

Reanalysis — a physically consistent reconstruction of past weather, produced by assimilating historical observations into a single fixed modern model. It is gap-free and global, but it is a model estimate rather than a station measurement, and it should not be quoted as observed data.

**Endpoint** — `https://archive-api.open-meteo.com/v1/archive`

### Models

| Model | API id | Coverage | Grid | Step | Region |
|---|---|---|---|---|---|
| ERA5 Seamless (recommended) | `era5_seamless` | 1940-01-01 → present − 6 d | 11–25 km | Hourly | Global |
| ERA5 (ECMWF) | `era5` | 1940-01-01 → present − 6 d | 25 km | Hourly | Global |
| ERA5-Land (ECMWF) | `era5_land` | 1950-01-01 → present − 6 d | 11 km | Hourly | Global |
| ECMWF IFS | `ecmwf_ifs` | 2017-01-01 → present | 9 km | Hourly | Global |
| ERA5 Ensemble | `era5_ensemble` | 1940-01-01 → present − 6 d | 55 km | 3-Hourly | Global |
| CERRA (Europe) | `cerra` | 1985-01-01 → 2021-06-30 | 5 km | Hourly | Europe only |

### ⚠️ Variable gaps

These models carry only a **subset** of the variables below. The sidebar greys out the rest, because the API answers an unsupported variable with `HTTP 200` and an array of nulls rather than an error — without the guard it would look like an empty chart and export as empty columns.

**`era5_land`** — ERA5-Land only carries temperature and humidity. Pick ERA5 Seamless for precipitation, wind, cloud or radiation at the same 11 km resolution.

| Resolution | Available |
|---|---|
| Hourly | `temperature_2m`, `dew_point_2m`, `relative_humidity_2m` |
| Daily | `temperature_2m_max`, `temperature_2m_min`, `temperature_2m_mean` |

### Hourly variables

| Group | Variable | API id |
|---|---|---|
| **Temperature** | Temperature 2m | `temperature_2m` |
|  | Apparent Temperature | `apparent_temperature` |
|  | Dew Point 2m | `dew_point_2m` |
| **Precipitation** | Precipitation | `precipitation` |
|  | Rain | `rain` |
|  | Snowfall | `snowfall` |
| **Wind** | Wind Speed 10m | `wind_speed_10m` |
|  | Wind Direction 10m | `wind_direction_10m` |
|  | Wind Gusts 10m | `wind_gusts_10m` |
| **Humidity** | Relative Humidity 2m | `relative_humidity_2m` |
| **Other** | Cloud Cover | `cloud_cover` |
|  | Sea Level Pressure | `pressure_msl` |
|  | Solar Radiation | `shortwave_radiation` |
|  | Evapotranspiration | `et0_fao_evapotranspiration` |

### Daily variables

| Group | Variable | API id |
|---|---|---|
| **Temperature** | Temperature Max | `temperature_2m_max` |
|  | Temperature Min | `temperature_2m_min` |
|  | Temperature Mean | `temperature_2m_mean` |
|  | Apparent Temp Max | `apparent_temperature_max` |
|  | Apparent Temp Min | `apparent_temperature_min` |
| **Precipitation** | Precipitation Sum | `precipitation_sum` |
|  | Rain Sum | `rain_sum` |
|  | Snowfall Sum | `snowfall_sum` |
| **Wind** | Wind Speed Max | `wind_speed_10m_max` |
|  | Wind Gusts Max | `wind_gusts_10m_max` |
| **Other** | Solar Radiation Sum | `shortwave_radiation_sum` |
|  | Evapotranspiration | `et0_fao_evapotranspiration` |

**Selected by default:** `temperature_2m`, `precipitation`

---

## Ensemble

The same forecast run many times from slightly different starting conditions. The spread between members is the forecast uncertainty: a wide spread means low confidence. The chart draws every member plus the computed ensemble mean.

**Endpoint** — `https://ensemble-api.open-meteo.com/v1/ensemble`

### Models

| Model | API id | Coverage | Grid | Step | Region |
|---|---|---|---|---|---|
| ICON Seamless (DWD) | `icon_seamless` | past 92 days → +7.5 d ahead | 2–26 km | Hourly | Global · 40 members |
| ICON Global (DWD) | `icon_global` | past 92 days → +7.5 d ahead | 26 km | Hourly | Global · 40 members |
| ICON EU (DWD) | `icon_eu` | past 92 days → +5 d ahead | 13 km | Hourly | Europe · 40 members |
| GFS 0.25° (NOAA) | `gfs025` | past 92 days → +10 d ahead | 25 km | Hourly | Global · 31 members |
| GFS 0.5° (NOAA) | `gfs05` | past 92 days → +35 d ahead | 50 km | Hourly | Global · 31 members |
| IFS 0.25° (ECMWF) | `ecmwf_ifs025` | past 92 days → +15 d ahead | 25 km | Hourly | Global · 51 members |
| AIFS 0.25° (ECMWF) | `ecmwf_aifs025` | past 92 days → +15 d ahead | 25 km | Hourly | Global · 51 members |
| GEM (Canada) | `gem_global` | past 92 days → +16 d ahead | 25 km | Hourly | Global · 21 members |
| ACCESS-GE (BOM) | `bom_access_global_ensemble` | past 92 days → +10 d ahead | 40 km | Hourly | Global · 18 members |
| MOGREPS-G (UKMO) | `ukmo_global_deterministic_10km` | past 92 days → +8 d ahead | 20 km | Hourly | Global · 18 members |

### Hourly variables

| Group | Variable | API id |
|---|---|---|
| **Temperature** | Temperature 2m | `temperature_2m` |
|  | Apparent Temperature | `apparent_temperature` |
| **Precipitation** | Precipitation | `precipitation` |
|  | Rain | `rain` |
|  | Snowfall | `snowfall` |
| **Wind** | Wind Speed 10m | `wind_speed_10m` |
|  | Wind Gusts 10m | `wind_gusts_10m` |
| **Humidity** | Relative Humidity 2m | `relative_humidity_2m` |
| **Other** | Cloud Cover | `cloud_cover` |
|  | Sea Level Pressure | `pressure_msl` |

### Daily variables

| Group | Variable | API id |
|---|---|---|
| **Temperature** | Temperature Max | `temperature_2m_max` |
|  | Temperature Min | `temperature_2m_min` |
|  | Temperature Mean | `temperature_2m_mean` |
| **Precipitation** | Precipitation Sum | `precipitation_sum` |
|  | Rain Sum | `rain_sum` |
|  | Snowfall Sum | `snowfall_sum` |
| **Wind** | Wind Speed Max | `wind_speed_10m_max` |
|  | Wind Gusts Max | `wind_gusts_10m_max` |

**Selected by default:** `temperature_2m`, `precipitation`

---

## Climate Change

Downscaled CMIP6 climate model output to 2050 at daily resolution. These are projections, not forecasts — they describe a plausible climate, never the weather on a particular future date. Use them for trends and distributions across years, not for individual days.

**Endpoint** — `https://climate-api.open-meteo.com/v1/climate`

### Models

| Model | API id | Coverage | Grid | Step | Region |
|---|---|---|---|---|---|
| CMCC-CM2-VHR4 (Italy) | `CMCC_CM2_VHR4` | 1950-01-01 → 2050-12-31 | 30 km | Daily | Global |
| FGOALS-f3-H (China) | `FGOALS_f3_H` | 1950-01-01 → 2050-12-31 | 28 km | Daily | Global |
| HiRAM-SIT-HR (Taiwan) | `HiRAM_SIT_HR` | 1950-01-01 → 2050-12-31 | 25 km | Daily | Global |
| MRI-AGCM3-2-S (Japan) | `MRI_AGCM3_2_S` | 1950-01-01 → 2050-12-31 | 20 km | Daily | Global |
| EC-Earth3P-HR (Europe) | `EC_Earth3P_HR` | 1950-01-01 → 2050-12-31 | 29 km | Daily | Global |
| MPI-ESM1-2-XR (Germany) | `MPI_ESM1_2_XR` | 1950-01-01 → 2050-12-31 | 51 km | Daily | Global |
| NICAM16-8S (Japan) | `NICAM16_8S` | 1950-01-01 → 2050-12-31 | 31 km | Daily | Global |

### Daily variables

| Group | Variable | API id |
|---|---|---|
| **Temperature** | Temperature Max | `temperature_2m_max` |
|  | Temperature Min | `temperature_2m_min` |
|  | Temperature Mean | `temperature_2m_mean` |
| **Precipitation** | Precipitation Sum | `precipitation_sum` |
|  | Rain Sum | `rain_sum` |
|  | Snowfall Sum | `snowfall_sum` |
| **Wind** | Wind Speed Mean | `wind_speed_10m_mean` |
|  | Wind Speed Max | `wind_speed_10m_max` |
| **Humidity** | Relative Humidity Mean | `relative_humidity_2m_mean` |
| **Other** | Cloud Cover Mean | `cloud_cover_mean` |
|  | Solar Radiation Sum | `shortwave_radiation_sum` |
|  | Evapotranspiration | `et0_fao_evapotranspiration` |

**Selected by default:** `temperature_2m_max`, `temperature_2m_min`, `precipitation_sum`

---

## Marine

Wave height, period and direction, plus ocean currents, sea surface temperature and sea level. Requires a sea or coastal point — an inland coordinate returns "No data is available for this location".

**Endpoint** — `https://marine-api.open-meteo.com/v1/marine`

### Models

| Model | API id | Coverage | Grid | Step | Region |
|---|---|---|---|---|---|
| Best Match (auto) | `best_match` | past 92 days → +16 d ahead | Varies | Hourly | Global |
| MFWAM (Météo-France) | `meteofrance_wave` | 2021-10-01 → +10 d ahead | 8 km | 3-Hourly | Global |
| SMOC Currents & SST (Météo-France) — Ocean vars only | `meteofrance_currents` | 2022-01-01 → +10 d ahead | 8 km | Hourly | Global |
| ECMWF WAM 0.25° | `ecmwf_wam025` | 2024-03-01 → +15 d ahead | 25 km | 3-Hourly | Global |
| GFS Wave 0.25° (NCEP) | `ncep_gfswave025` | 2024-06-01 → +16 d ahead | 25 km | Hourly | Global |
| GFS Wave 0.16° high-res (NCEP) | `ncep_gfswave016` | 2024-10-01 → +16 d ahead | 16 km | Hourly | 52.5°N–15°S |
| EWAM (DWD Europe) | `ewam` | 2022-08-01 → +8 d ahead | 5 km | Hourly | Europe |
| GWAM (DWD Global) | `gwam` | 2022-08-01 → +4 d ahead | 25 km | Hourly | Global |
| ERA5-Ocean (historical) | `era5_ocean` | 1940-01-01 → present − 6 d | 50 km | Hourly | Global |

### ⚠️ Variable gaps

These models carry only a **subset** of the variables below. The sidebar greys out the rest, because the API answers an unsupported variable with `HTTP 200` and an array of nulls rather than an error — without the guard it would look like an empty chart and export as empty columns.

**`meteofrance_currents`** — SMOC is an ocean-state model: it carries currents, sea surface temperature and sea level only — no wave variables.

| Resolution | Available |
|---|---|
| Hourly | `sea_surface_temperature`, `sea_level_height`, `ocean_current_velocity`, `ocean_current_direction`, `invert_barometer_height` |
| Daily | — none — |

### Hourly variables

| Group | Variable | API id |
|---|---|---|
| **Waves** | Wave Height | `wave_height` |
|  | Wave Direction | `wave_direction` |
|  | Wave Period | `wave_period` |
|  | Wave Peak Period | `wave_peak_period` |
| **Wind Waves** | Wind Wave Height | `wind_wave_height` |
|  | Wind Wave Direction | `wind_wave_direction` |
|  | Wind Wave Period | `wind_wave_period` |
|  | Wind Wave Peak Period | `wind_wave_peak_period` |
| **Swell** | Swell Height | `swell_wave_height` |
|  | Swell Direction | `swell_wave_direction` |
|  | Swell Period | `swell_wave_period` |
|  | Swell Peak Period | `swell_wave_peak_period` |
| **Ocean (SMOC only)** | Sea Surface Temperature | `sea_surface_temperature` |
|  | Sea Level Height | `sea_level_height` |
|  | Ocean Current Speed | `ocean_current_velocity` |
|  | Ocean Current Direction | `ocean_current_direction` |
|  | Inverted Barometer Height | `invert_barometer_height` |

### Daily variables

| Group | Variable | API id |
|---|---|---|
| **Waves** | Wave Height Max | `wave_height_max` |
|  | Wave Direction Dominant | `wave_direction_dominant` |
|  | Wave Period Max | `wave_period_max` |
| **Wind Waves** | Wind Wave Height Max | `wind_wave_height_max` |
|  | Wind Wave Dir Dominant | `wind_wave_direction_dominant` |
|  | Wind Wave Period Max | `wind_wave_period_max` |
|  | Wind Wave Peak Period Max | `wind_wave_peak_period_max` |
| **Swell** | Swell Height Max | `swell_wave_height_max` |
|  | Swell Direction Dominant | `swell_wave_direction_dominant` |
|  | Swell Period Max | `swell_wave_period_max` |
|  | Swell Peak Period Max | `swell_wave_peak_period_max` |

**Selected by default:** `wave_height`, `wave_direction`, `wave_period`, `swell_wave_height`

---

## Flood

Simulated river discharge from the Global Flood Awareness System. Requires a point on a modelled river reach. The value is discharge for the whole grid cell, not a specific gauge, so it is best read as a relative signal (this week vs the seasonal norm) rather than an absolute cubic-metre figure.

**Endpoint** — `https://flood-api.open-meteo.com/v1/flood`

### Models

| Model | API id | Coverage | Grid | Step | Region |
|---|---|---|---|---|---|
| GloFAS v4 Seamless (default) | `seamless_v4` | 1984-01-01 → +210 d ahead | 5 km | Daily | Global |
| GloFAS v4 Forecast | `forecast_v4` | 1984-01-01 → +30 d ahead | 5 km | Daily | Global |
| GloFAS v4 Reanalysis | `consolidated_v4` | 1984-01-01 → 2022-07-31 | 5 km | Daily | Global |
| GloFAS v4 Seasonal | `seasonal_v4` | 1984-01-01 → +210 d ahead | 5 km | Daily | Global |
| GloFAS v3 Seamless | `seamless_v3` | 1984-01-01 → +30 d ahead | 11 km | Daily | Global |
| GloFAS v3 Forecast | `forecast_v3` | 1984-01-01 → +30 d ahead | 11 km | Daily | Global |
| GloFAS v3 Reanalysis | `consolidated_v3` | 1984-01-01 → 2022-07-31 | 11 km | Daily | Global |
| GloFAS v3 Seasonal | `seasonal_v3` | 1984-01-01 → +210 d ahead | 11 km | Daily | Global |

### Daily variables

| Group | Variable | API id |
|---|---|---|
| **Discharge** | River Discharge | `river_discharge` |
| **Ensemble** | Discharge Mean | `river_discharge_mean` |
|  | Discharge Median | `river_discharge_median` |
|  | Discharge Max | `river_discharge_max` |
|  | Discharge Min | `river_discharge_min` |
|  | Discharge P25 | `river_discharge_p25` |
|  | Discharge P75 | `river_discharge_p75` |

**Selected by default:** `river_discharge`

---

## WB Projection

Country- and watershed-level CMIP6 projections to 2100 under three emissions scenarios, each with a p10 / median / p90 uncertainty band plotted against a 1995-2014 historical baseline.

**Endpoint** — `https://cckpapi.worldbank.org/cckp/v1`

### Emissions scenarios

| Scenario | Meaning | Warming by 2100 |
|---|---|---|
| **SSP1-2.6** | Low emissions, strong mitigation | ~1.8 °C |
| **SSP2-4.5** | Intermediate, current policies continued | ~2.7 °C |
| **SSP5-8.5** | High emissions, fossil-fuel intensive | ~4.4 °C |

Each scenario is served as a **p10 / median / p90** band across the CMIP6 multi-model ensemble.

### Variables

| Variable | Unit | API id |
|---|---|---|
| Mean Temperature | °C | `tas` |
| Max Temperature | °C | `tasmax` |
| Min Temperature | °C | `tasmin` |
| Precipitation | mm/day | `pr` |
| Rx1d (Max 1-day Precip) | mm | `rx1day` |
| Rx5d (Max 5-day Precip) | mm | `rx5day` |
| Relative Humidity | % | `hurs` |
| Wind Speed | m/s | `sfcWind` |

### Coverage

|  |  |
|---|---|
| Countries | 176 |
| Levels | National, and sub-national watershed |
| Watershed regions | EAP, ECA, ESA, LAC, OTH, SOA, WCA |
| Resolution | 0.25° (~25 km) downscaled CMIP6 |
| Projection period | 2015–2100 |
| Baseline | 1995–2014 |

> Not every sub-national watershed has CMIP6 data. A valid geocode with no coverage returns *"No data returned for this location"* — the geocode is correct, the dataset simply does not reach it.

---

# Features

## Choosing a location

| Method | Notes |
|---|---|
| Click the map | Leaflet map, click anywhere. Coordinates are wrapped into ±180 first, so panning past the antimeridian cannot produce a longitude the APIs reject. |
| Search by name | Open-Meteo geocoding with autocomplete; returns name, region, country, elevation and timezone. |
| Import a CSV | Auto-detects `lat`/`latitude` and `lon`/`longitude`/`lng` columns, plus an optional name column. Rows outside valid ranges or with unparseable numbers are skipped and counted. Imported points appear as green pins; click one to load it. |
| Share link | The link button copies a URL carrying mode, coordinates and date range. Opening it restores that state. |

## Charts

| Chart | Applies to |
|---|---|
| Line chart | Temperature and most scalar variables |
| Bar chart | Precipitation totals |
| Ensemble spread | Every member traced individually plus a computed mean |
| Projection bands | CCKP historical baseline with p10–p90 scenario ribbons |
| Choropleth map | Country shading in WB Projection mode |
| "Now" marker | Forecast and ensemble charts, at the nearest timestep to the current time |

Marine results are split into four charts — wave heights, periods, directions and ocean conditions — because those quantities share no sensible y-axis. Every chart exports to PNG individually.

## Export

| Format | Contents |
|---|---|
| **CSV** | Flat time series: one row per timestep, one column per selected variable. |
| **Excel (.xlsx)** | Two sheets — *Weather Data* with the values, *Metadata* with model, coordinates, elevation, timezone, row count and export timestamp. |
| **TXT** | Fixed-width table with a metadata header, for printing or pasting into reports. |
| **PNG** | Per-chart image export. |

SheetJS is loaded on demand when Excel is clicked, so the 429 kB library is not in the initial page load.

### Download contact capture

Before the first CSV, Excel or TXT export of a session, a form collects **name, email, organisation and intended use**. Details are remembered for the session and prefilled on later visits.

| Behaviour | Detail |
|---|---|
| Destination | A Google Apps Script web app appends a row to a Google Sheet and emails the site owner. |
| Why a sheet | It gives a queryable log — sortable by organisation, repeat users, which datasets get taken — rather than an inbox to scroll. |
| Never blocks | The file downloads first; the report is fire-and-forget. A logging outage costs a log row, never a user their data. |
| Email throttling | One email per address per 30 minutes, so exporting CSV + Excel + TXT in a row does not send three near-identical mails. Every download still writes a row. |
| Opt out | Build with `VITE_DOWNLOAD_LOG_ENDPOINT=off` to disable capture entirely. |

> Because a logging failure is deliberately invisible, the site looks completely normal if capture breaks. The sheet is the only place it shows — check it occasionally rather than trusting silence.

## Data-availability safeguards

Open-Meteo answers an out-of-coverage request with **`HTTP 200` and an array of nulls**, not an error. Only a date before the API-wide minimum returns a real `400`. Without guards, an unavailable dataset renders as a blank chart and exports as empty columns. Three layers prevent that:

| # | Guard | Example it catches |
|---|---|---|
| 1 | Variables a model does not carry are greyed out and struck through, with the reason shown. | ERA5-Land offers no precipitation, yet precipitation is a default selection. |
| 2 | Changing model clamps the dates into that dataset’s coverage and drops variables it cannot serve. | CERRA ends 2021-06-30 but the default window is the last 365 days. |
| 3 | A response that is still all-null is explained in the chart panel rather than drawn as empty axes. | A regional model queried outside its domain, or a marine point inland. |

## Performance

|  |  |
|---|---|
| Session cache | Identical requests are served from memory with no second API call, shown as a ⚡ cached badge. |
| Code splitting | Leaflet and Chart.js are separate chunks so an app change does not invalidate them in browser caches. |
| Deferred SheetJS | Excel support downloads only when used. |

Initial payload is **226 kB gzipped** across four cached chunks, down from a single 317 kB chunk before splitting. Figures from `npm run build`; re-check them after adding a dependency.

## Caveats worth knowing

| Topic | Detail |
|---|---|
| Reanalysis is not observation | ERA5 and friends are model reconstructions. Gap-free and global, but not station measurements — do not cite them as observed data. |
| ERA5-Land is temperature only | On Open-Meteo it serves 2 m temperature, dew point and relative humidity. Use **ERA5 Seamless** for precipitation, wind, cloud or radiation at the same 11 km resolution. |
| ERA5 lags ~6 days | Day −5 is still partially null; day −6 is the first complete day. |
| Projections are not forecasts | Climate and CCKP modes describe a plausible future climate, never the weather on a given date. Read them as trends across years. |
| Flood discharge is per grid cell | Not a gauge reading. Best used as a relative signal against the seasonal norm. |
| Marine needs water | An inland coordinate returns "No data is available for this location". |
| Rate limits | Open-Meteo applies a short-term limit, not a strict daily cap. Narrow the date range or wait a minute. |
