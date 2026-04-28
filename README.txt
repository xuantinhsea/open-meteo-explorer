================================================================================
  OPEN-METEO EXPLORER  v2.0
  Global Weather, Marine, Flood & Climate Data Visualization Tool
  Developed by Dr. Nguyen Xuan Tinh  ·  CTII
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

  Historical      Hourly/daily records from 1940 to present via ERA5 and
                  other reanalysis models (Open-Meteo Archive API)

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

  Data Export (requires sign-in)
    · CSV  — raw time-series data with header metadata
    · TXT  — fixed-width formatted table for printing/reports
    · Excel — two-sheet workbook: "Data" (values) + "Metadata" (model, dates,
              coordinates, variables, resolution)
    · File downloads are logged via email notification to the administrator

  Authentication
    · Powered by Clerk — modal sign-in with social/email providers
    · Export buttons are gated: unauthenticated users see "Sign in to download"
    · New user registrations trigger an email alert to the administrator

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
  Authentication    Clerk (@clerk/clerk-react)
  CSV parsing       PapaParse
  Excel export      SheetJS (xlsx)
  HTTP              Native fetch (no Axios)
  State             React useState / useCallback (no Redux)
  Serverless        Vercel Functions (Node.js) for webhook and download logging
  Email             Resend API (transactional email notifications)
  Webhook verify    Svix (Clerk webhook signature verification)

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
      npm run dev             → http://localhost:5173  (UI only)
      npx vercel dev          → http://localhost:3000  (UI + serverless /api/)

5.  Open your browser at the URL shown above.


ENVIRONMENT VARIABLES
---------------------
Create a file named .env.local in the project root. Never commit this file.
A template is provided in .env.example.

  VITE_CLERK_PUBLISHABLE_KEY   Your Clerk publishable key (pk_test_... or
                                pk_live_...). Required for auth to work.
                                Get it from clerk.com → API Keys.

  CLERK_WEBHOOK_SECRET          Signing secret from Clerk Dashboard →
                                Webhooks → your endpoint. Required for the
                                /api/webhook-clerk serverless function to
                                verify incoming webhook requests.

  RESEND_API_KEY                API key from resend.com. Required for the
                                admin notification emails (new registrations
                                and data downloads).

  NOTIFY_EMAIL                  Email address that receives admin alerts.
                                E.g.: xuantinhsea@gmail.com

Core weather data (Open-Meteo APIs and World Bank CCKP) requires NO API key.

For Vercel deployment, add these same four variables in the Vercel Dashboard
under Settings → Environment Variables.


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
4. Add the four environment variables listed above (Settings → Env Vars).
5. Deploy. Vercel handles CDN, HTTPS, preview URLs, and the /api/ functions.

To set up Clerk webhook on Vercel:
  · Clerk Dashboard → Webhooks → Add Endpoint
  · URL: https://your-app.vercel.app/api/webhook-clerk
  · Events: user.created
  · Copy the Signing Secret → paste as CLERK_WEBHOOK_SECRET in Vercel.

--- GitHub Pages (alternative) ---
A GitHub Actions workflow (.github/workflows/deploy.yml) is included.
It builds the app and deploys to the gh-pages branch automatically on every
push to main.

Required GitHub Secrets (Settings → Secrets → Actions):
  VITE_CLERK_PUBLISHABLE_KEY   (same as above)
  VITE_BASE_PATH               Set to /open-meteo-explorer/  (your repo name)

Note: GitHub Pages only serves static files. The /api/ serverless functions
(download logging, webhook) do NOT run on GitHub Pages. Vercel is required
for those features.


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

7. Serverless functions require Vercel (or npx vercel dev locally)
   The /api/webhook-clerk and /api/log-download endpoints only run on Vercel
   or via the Vercel CLI locally. They do not run in npm run dev (Vite only).


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
        ExportBar.jsx         CSV / TXT / Excel export buttons (auth-gated)

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

    hooks/
      useWeatherData.js     Fetcher + session-level cache for all weather modes
      useCSVLocations.js    CSV parsing and location management

    utils/
      variableConfig.js     Single source of truth: all variables, models,
                            data ranges, default selections per mode
      dateUtils.js          Date helpers + getDateConstraints() per mode
      csvParser.js          CSV row validation + column detection
      exportData.js         CSV / TXT / Excel export logic
      cckpConfig.js         CCKP scenario and variable configuration
      countryCentroids.js   Country centroid coordinates for projection map

  public/
    data/
      geonames.json         CCKP geocode → region name mapping

  api/  (Vercel serverless functions)
    webhook-clerk.js        Receives Clerk user.created webhook, sends
                            admin registration alert via Resend
    log-download.js         Receives download event from ExportBar,
                            sends admin download alert via Resend

  scripts/
    fix-leaflet.cjs         Postinstall: extracts Leaflet dist/ on Windows

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

Developed by Dr. Nguyen Xuan Tinh, Researcher at CTI-AAP / CTII.
Contact: xuantinhsea@gmail.com

Data is sourced from Open-Meteo (open-meteo.com, CC BY 4.0) and the World Bank
Climate Change Knowledge Portal (climateknowledgeportal.worldbank.org, CC BY 4.0).
Please refer to each provider's terms of service for redistribution or
commercial use restrictions.

This application is provided for research, analysis, and educational purposes.

================================================================================
