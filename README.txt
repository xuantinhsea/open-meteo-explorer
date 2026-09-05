================================================================================
  OPEN-METEO EXPLORER  v2.0
  Global Weather, Marine, Flood & Climate Data Visualization Tool
  Developed by Dr. Nguyen Xuan Tinh  ·  Senior Hydrologist
  Nippon Koei Co., Ltd.  ·  Department of Water Resources and Energy
  Contact : xuantinhsea@gmail.com
================================================================================

OVERVIEW
--------
Open-Meteo Explorer is a React-based web application for exploring, visualizing,
and downloading global weather, marine, flood, and long-term climate projection
data from multiple open-data APIs.

Users can click an interactive map, search for any city, import CSV locations,
choose from multiple data modes and models, view Chart.js charts, and export
results as CSV, Excel, TXT, or PNG — all with no API keys required for the
core data.

DATA MODES
----------
  Forecast        7–16 day hourly/daily weather from 14+ global NWP models
                  (Open-Meteo Forecast API — api.open-meteo.com)

  Historical      Hourly/daily records from 1940 to present. Default model is
                  ERA5 Seamless (ERA5-Land 11 km where available, ERA5 25 km
                  elsewhere) — the only archive model carrying every variable.
                  Also ERA5, ERA5-Land, ERA5 Ensemble, ECMWF IFS and CERRA
                  (Open-Meteo Archive API — archive-api.open-meteo.com)

  Ensemble        Multi-model probabilistic forecasts with ensemble ribbons
                  and member spread (Open-Meteo Ensemble API)

  Climate Change  Daily CMIP6 projections to 2050 across 7 high-resolution
                  climate models (Open-Meteo Climate API)

  Marine          Wave heights, periods, directions, swell, ocean currents,
                  sea surface temperature — hourly and daily aggregates.
                  Models include MFWAM, ECMWF WAM, GFS Wave, DWD EWAM/GWAM,
                  SMOC (currents/SST), and ERA5-Ocean (back to 1940).
                  (Open-Meteo Marine API — marine-api.open-meteo.com)

  Flood           Simulated daily river discharge at 5 km resolution from
                  GloFAS v4 and v3 (reanalysis 1984–present, 30-day forecast,
                  7-month seasonal outlook, ensemble statistics).
                  (Open-Meteo Flood API — flood-api.open-meteo.com)

  WB Projection   Country, subnational, and watershed-level climate projections
                  from the World Bank Climate Change Knowledge Portal (CCKP).
                  Covers SSP1-2.6, SSP2-4.5, SSP5-8.5 scenarios with
                  CMIP6 ensemble median ± p10/p90 uncertainty bands.
                  Displayed on an interactive choropleth map.


KEY FEATURES
------------
  Map & Location
    · Interactive Leaflet map — click anywhere to select a location
    · City/place search with geocoding autocomplete
    · CSV multi-location import (auto-detects lat/lon/name columns,
      renders pins on the map, skips invalid rows with a report)
    · Current location coordinates shown on the map panel

  Charts
    · Chart.js line and bar charts
    · Ensemble charts with per-member traces and computed mean ribbon
    · "Now" marker on forecast/ensemble charts
    · CCKP projection chart: historical baseline + SSP scenario bands (p10–p90)
    · Per-chart PNG export button
    · Marine charts split by variable type: Wave Heights, Wave Periods,
      Wave Directions, and Ocean Conditions

  Data Export
    · CSV  — raw time-series data with header metadata
    · TXT  — fixed-width formatted table for printing/reports
    · Excel — two-sheet workbook: "Data" (values) + "Metadata" (model, dates,
              coordinates, variables, resolution)
    · No account or sign-in needed. Before the first export in a session the
      user supplies name, email, organisation and intended use; the details are
      remembered for the rest of the session and prefilled on later visits.
    · Each download is appended to a Google Sheet and emailed to the site owner
      via a Google Apps Script web app (see scripts/apps-script/README.md).
      With no endpoint configured the form is skipped and exports work as
      normal — a logging failure never blocks anyone getting data.

  Data-availability safeguards
    · Open-Meteo answers an out-of-coverage request with HTTP 200 and an array
      of nulls rather than an error, so an unavailable dataset would otherwise
      look like an empty chart. Three layers guard against that:
        1. Variables a model does not carry are greyed out and struck through
           in the sidebar, with the reason shown (MODEL_VARIABLE_SUPPORT in
           variableConfig.js). ERA5-Land, for example, carries only temperature
           and humidity — not precipitation, wind, cloud or radiation.
        2. Changing model clamps the date range into that dataset's coverage
           and drops any selected variable the new model cannot serve.
        3. If a response still comes back all-null, the chart panel explains
           why instead of rendering blank axes.

  Performance
    · Session-level in-memory cache — repeated identical requests are served
      from memory without a second API call (⚡ cached badge shown in UI)

  UI/UX
    · Responsive layout with collapsible sidebar (mobile-friendly)
    · Mode buttons highlighted with distinct colors per data type
    · Model-aware date picker — "Available" range updates to match the
      selected model's actual data availability
    · About dialog with developer info, feature list, and data source credits


TECH STACK
----------
  Framework         React 18 + Vite 5
  Styling           Tailwind CSS v4 (via @tailwindcss/vite plugin)
  Charts            Chart.js 4 + react-chartjs-2 + chartjs-plugin-annotation
  Map               Leaflet 1.9.4 + react-leaflet
  Authentication    None — the app is fully open, no account required
  CSV parsing       PapaParse
  Excel export      SheetJS (xlsx)
  HTTP              Native fetch (no Axios)
  State             React useState / useCallback (no Redux)
  Backend           None. Download logging is a Google Apps Script web app
                    that writes to a Google Sheet and emails the owner.

IMPORTANT: Stay on Vite 5. Vite 8+ uses Rolldown which cannot resolve Leaflet
from node_modules. Do not upgrade Vite past v5.


PREREQUISITES
-------------
  · Node.js  >= 18
  · npm      >= 8  (tested on npm 11 — see Known Issues)
  · Vercel CLI (optional, for running serverless functions locally):
      npm install -g vercel


LOCAL SETUP
-----------
1.  Clone or download the repository:
      git clone https://github.com/xuantinhsea/open-meteo-explorer.git
      cd open-meteo-explorer

2.  Install dependencies:
      npm install

    This also runs the postinstall script (scripts/fix-leaflet.cjs) which
    patches a known npm 11 / Windows issue with Leaflet's dist/ folder.

3.  Copy the example environment file and fill in your keys:
      copy .env.example .env.local

    Required variables (see ENVIRONMENT VARIABLES section below).

4.  Start the development server:
      npm run dev             → http://localhost:5173

5.  Open your browser at the URL shown above.


ENVIRONMENT VARIABLES
---------------------
Create a file named .env.local in the project root. Never commit this file.
A template is provided in .env.example.

  VITE_DOWNLOAD_LOG_ENDPOINT   Optional. Google Apps Script web-app URL that
                                logs each data download to a Google Sheet and
                                emails the site owner. Setup instructions:
                                scripts/apps-script/README.md
                                Leave it unset and the contact form is skipped
                                — exports still work exactly as before.

All weather data (Open-Meteo APIs and World Bank CCKP) requires NO API key.

For the GitHub Pages deploy, add VITE_DOWNLOAD_LOG_ENDPOINT as a repository
secret under Settings → Secrets and variables → Actions. The workflow already
passes it through to the build.


AVAILABLE SCRIPTS
-----------------
  npm run dev       Start Vite dev server at http://localhost:5173
  npm run build     Build for production → dist/
  npm run preview   Serve the production build locally
  npm run lint      Run ESLint


BUILD & DEPLOY
--------------

--- Vercel (recommended) ---
1. Push the repository to GitHub.
2. Import the repo at vercel.com/new.
3. Vercel auto-detects Vite. Confirm these build settings:
     Framework Preset  : Vite
     Build Command     : npm run build
     Output Directory  : dist
     Install Command   : npm install
4. Add VITE_DOWNLOAD_LOG_ENDPOINT if you want download logging (Settings →
   Env Vars). Everything else runs with no configuration.
5. Deploy. Vercel handles CDN, HTTPS and preview URLs.

--- GitHub Pages (alternative) ---
A GitHub Actions workflow (.github/workflows/deploy.yml) is included.
It builds the app and deploys to the gh-pages branch automatically on every
push to main.

Optional GitHub Secret (Settings → Secrets and variables → Actions):
  VITE_DOWNLOAD_LOG_ENDPOINT   Apps Script web-app URL for download logging.
                               Without it, exports work but are not logged.

VITE_BASE_PATH is set inside the workflow itself (/open-meteo-explorer/).

Note: GitHub Pages serves static files only, but nothing here needs a server
of its own — download logging runs on Google Apps Script, so the full feature
set works on GitHub Pages.


DATA SOURCES
------------
All data providers are free and publicly accessible.

  Open-Meteo Forecast API        api.open-meteo.com/v1/forecast
  Open-Meteo Archive API         archive-api.open-meteo.com/v1/archive
  Open-Meteo Ensemble API        ensemble-api.open-meteo.com/v1/ensemble
  Open-Meteo Climate API         climate-api.open-meteo.com/v1/climate
  Open-Meteo Marine API          marine-api.open-meteo.com/v1/marine
  Open-Meteo Flood API           flood-api.open-meteo.com/v1/flood
  Open-Meteo Geocoding API       geocoding-api.open-meteo.com/v1/search
  World Bank CCKP API            cckpapi.worldbank.org (projection data)
  World Bank CCKP Geonames       public/data/geonames.json (bundled locally)


DATA FILES
----------
  public/data/geonames.json
    Downloaded from the World Bank CCKP portal. Maps geocodes to country and
    subnational region names (e.g. "TLS.2422957" → "Aileu"). Used by the
    WB Projection tab to populate region dropdowns. Bundled with the app
    — no runtime fetch needed. (~238 KB)

  subnational_list.csv
    Human-readable reference table: Country Code, Country Name, Subnational
    Code, Subnational Name — generated from geonames.json. Not served by
    the app; for offline reference only. (gitignored)


KNOWN ISSUES
------------
1. Leaflet dist/ missing on Windows with npm 11
   npm 11 on Windows does not extract Leaflet's dist/ folder from its tarball.
   The postinstall script (scripts/fix-leaflet.cjs) fixes this automatically.
   If the map shows blank tiles after a fresh install, run manually:

     npm pack leaflet@1.9.4
     tar -xzf leaflet-1.9.4.tgz -C node_modules/leaflet --strip-components=1 package/dist
     del leaflet-1.9.4.tgz

2. Leaflet CSS must come from the CDN link in index.html, not a JS import.
   Vite cannot resolve Leaflet's CSS from node_modules at build time.

3. Open-Meteo rate limiting
   The "Daily API request limit exceeded" error is a short-term rate limit,
   not a strict daily cap. It resets within minutes. Narrowing the date range
   reduces response size. The session cache avoids repeat hits for identical
   requests within the same browser session.

4. Marine: SMOC model variable restriction
   The MeteoFrance SMOC model (meteofrance_currents) provides ocean currents,
   tides, sea level, and SST only. Selecting wave variables with SMOC will
   return an API error. Switch to Best Match or another wave model for wave data.

5. Flood: ensemble statistics availability
   Discharge ensemble statistics (mean, median, p25, p75, max, min) are
   available for GloFAS forecast models only. The reanalysis/consolidated
   models return single-member discharge only.

6. WB Projection — CCKP coverage gaps
   Not all subnational regions in the dropdown have CMIP6 data. If
   "No data returned for this location" appears, the geocode is valid but
   not covered by the CCKP dataset.

7. ERA5-Land carries only temperature and humidity
   On Open-Meteo, models=era5_land serves 2 m temperature, dew point and
   relative humidity. Every other variable comes back as an array of nulls
   with an HTTP 200. Use ERA5 Seamless for precipitation, wind, cloud or
   radiation at the same 11 km resolution. The sidebar greys out the
   unavailable variables automatically.

8. Out-of-coverage requests succeed but return nulls
   CERRA ends 2021-06-30 and ECMWF IFS starts 2017-01-01. Asking either for
   dates outside that window returns HTTP 200 with every value null rather
   than an error. Changing model now clamps the date range automatically, and
   an all-null response is explained in the chart panel instead of rendering
   a blank chart.


PROJECT STRUCTURE
-----------------
  src/
    api/
      forecast.js         Open-Meteo Forecast API
      historical.js       Open-Meteo Archive API
      ensemble.js         Open-Meteo Ensemble API
      climate.js          Open-Meteo Climate API
      marine.js           Open-Meteo Marine API
      flood.js            Open-Meteo Flood API (GloFAS)
      geocoding.js        Open-Meteo Geocoding API
      worldbank.js        World Bank CCKP API + geonames.json loader

    components/
      Charts/
        ChartPanel.jsx        Main chart container (all modes)
        TemperatureChart.jsx  Generic line chart (reused for marine, flood, etc.)
        PrecipitationChart.jsx Bar chart for precipitation variables
        EnsembleChart.jsx     Ensemble member traces + mean ribbon
        ProjectionChart.jsx   CCKP historical + scenario bands
        ProjectionMap.jsx     Choropleth map for WB Projection mode
        ExportBar.jsx         CSV / TXT / Excel buttons; opens the contact
                              form on the first export of a session

      Map/
        MapPanel.jsx          Leaflet map with location pin + CSV pins
        LocationMarker.jsx    Custom marker component

      Sidebar/
        Sidebar.jsx           Main sidebar shell
        ModeSelector.jsx      Data mode button grid
        LocationSearch.jsx    Geocoding search with autocomplete
        DateRangePicker.jsx   Date inputs with model-aware available range
        VariableSelector.jsx  Grouped variable checkboxes per mode
        ModelSelector.jsx     Weather model dropdown with data range tooltip
        CSVImport.jsx         CSV file importer + location list
        CCKPControls.jsx      Country/region/variable/scenario selector

      UI/
        LoadingSpinner.jsx
        ErrorBanner.jsx
        Badge.jsx
        AboutModal.jsx        About dialog with features, credits, copyright
        DownloadGateModal.jsx Name/email/organisation form shown before the
                              first data export of a session

    hooks/
      useWeatherData.js     Fetcher + session-level cache for all weather modes
      useCSVLocations.js    CSV parsing and location management

    utils/
      variableConfig.js     Single source of truth: all variables, models,
                            data ranges, default selections per mode
      dateUtils.js          Date helpers + getDateConstraints() per mode
      csvParser.js          CSV row validation + column detection
      exportData.js         CSV / TXT / Excel export logic
      downloadTracking.js   Contact capture: session memory + fire-and-forget
                            POST to the Apps Script logger
      shareUrl.js           Permalink build/parse for the share button
      cckpConfig.js         CCKP scenario and variable configuration
      countryCentroids.js   Country centroid coordinates for projection map

  public/
    data/
      geonames.json         CCKP geocode → region name mapping

  scripts/
    fix-leaflet.cjs         Postinstall: extracts Leaflet dist/ on Windows
    apps-script/
      Code.gs               Google Apps Script web app: logs each download to
                            a Google Sheet and emails the site owner
      README.md             One-time deployment steps for the above

  .github/
    workflows/
      deploy.yml            GitHub Actions: build + deploy to GitHub Pages


GITHUB REPOSITORY
-----------------
  https://github.com/xuantinhsea/open-meteo-explorer

  Files excluded from the repo (.gitignore):
    node_modules/           Runtime dependencies — reinstall with npm install
    dist/                   Build output — generated on deploy
    .env  /  .env.*         Local environment variables (never commit)
    CLAUDE.md               Claude Code AI assistant session instructions
    github.md               Internal working notes
    subnational_list.csv    Large reference file (generated from geonames.json)


LICENSE & COPYRIGHT
-------------------
© 2026 Dr. Nguyen Xuan Tinh. All rights reserved.

Developed by Dr. Nguyen Xuan Tinh, Senior Hydrologist,
Nippon Koei Co., Ltd. — Department of Water Resources and Energy.
Contact: xuantinhsea@gmail.com

Data is sourced from Open-Meteo (open-meteo.com, CC BY 4.0) and the World Bank
Climate Change Knowledge Portal (climateknowledgeportal.worldbank.org, CC BY 4.0).
Please refer to each provider's terms of service for redistribution or
commercial use restrictions.

This application is provided for research, analysis, and educational purposes.

================================================================================
