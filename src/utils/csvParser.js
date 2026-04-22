import Papa from 'papaparse';

const LAT_RE = /^lat(itude)?$/i;
const LON_RE = /^lon(gitude)?$|^lng$/i;
const NAME_RE = /^(name|city|location|label|place)$/i;

function findCol(headers, re) {
  return headers.find((h) => re.test(h.trim()));
}

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const headers = meta.fields || [];
        const latCol = findCol(headers, LAT_RE);
        const lonCol = findCol(headers, LON_RE);
        const nameCol = findCol(headers, NAME_RE);

        if (!latCol || !lonCol) {
          reject(new Error('CSV must have latitude and longitude columns'));
          return;
        }

        const locations = [];
        let skipped = 0;

        data.forEach((row, i) => {
          const lat = parseFloat(row[latCol]);
          const lon = parseFloat(row[lonCol]);
          if (isNaN(lat) || isNaN(lon)) {
            skipped++;
            return;
          }
          if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            skipped++;
            return;
          }
          locations.push({
            id: `csv-${i}`,
            name: nameCol ? (row[nameCol] || `Location ${i + 1}`) : `Location ${i + 1}`,
            lat,
            lon,
          });
        });

        resolve({ locations, skipped });
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}
