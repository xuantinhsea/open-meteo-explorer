/**
 * Open-Meteo Explorer — download logger
 *
 * Receives one POST per data export from the static site, appends a row to the
 * bound Google Sheet, and emails the owner. Deployed as a Google Apps Script
 * web app; see README.md in this folder for the one-time setup.
 */

// Where the notification email goes.
var NOTIFY_EMAIL = 'mizukun04@gmail.com';

// Send at most one email per this many minutes per person, so a user exporting
// CSV + Excel + TXT in a row doesn't produce three near-identical emails. Every
// download is still written to the sheet regardless.
var EMAIL_COOLDOWN_MINUTES = 30;

var HEADERS = [
  'Timestamp', 'Name', 'Email', 'Organisation', 'Purpose',
  'Format', 'Mode', 'Model', 'Location', 'Latitude', 'Longitude',
  'Start date', 'End date', 'Variables', 'Rows',
  'Timezone', 'Referrer', 'User agent',
];

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    var sheet = getSheet_();

    sheet.appendRow([
      new Date(),
      d.name || '', d.email || '', d.organization || '', d.purpose || '',
      d.format || '', d.mode || '', d.model || '',
      d.locationName || '', d.latitude || '', d.longitude || '',
      d.startDate || '', d.endDate || '',
      d.variables || '', d.rows || '',
      d.timezone || '', d.referrer || '', d.userAgent || '',
    ]);

    if (shouldEmail_(d.email)) sendNotification_(d, sheet.getLastRow() - 1);

    return json_({ ok: true });
  } catch (err) {
    // Log and swallow: the user's download has already started, and a 500 here
    // would only produce a console error they can do nothing about.
    console.error('doPost failed: ' + err);
    return json_({ ok: false, error: String(err) });
  }
}

// Lets you confirm the deployment is live by opening the URL in a browser.
function doGet() {
  return json_({ ok: true, service: 'open-meteo-explorer download logger' });
}

function getSheet_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Downloads');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('Downloads');
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function shouldEmail_(email) {
  if (!email) return true;
  var cache = CacheService.getScriptCache();
  var key = 'notified_' + email.toLowerCase();
  if (cache.get(key)) return false;
  cache.put(key, '1', EMAIL_COOLDOWN_MINUTES * 60);
  return true;
}

function sendNotification_(d, downloadNumber) {
  var subject = 'Open-Meteo download #' + downloadNumber + ' — ' +
    (d.organization || 'unknown org') + ' (' + (d.email || 'no email') + ')';

  var rows = [
    ['Name', d.name], ['Email', d.email], ['Organisation', d.organization],
    ['Purpose', d.purpose], ['Format', d.format], ['Dataset', d.mode],
    ['Model', d.model], ['Location', d.locationName],
    ['Coordinates', d.latitude + ', ' + d.longitude],
    ['Date range', d.startDate + ' → ' + d.endDate],
    ['Variables', d.variables], ['Rows', d.rows],
    ['User timezone', d.timezone], ['Referrer', d.referrer],
  ];

  var body = '<h2 style="font:600 16px system-ui;margin:0 0 12px">New data download</h2>' +
    '<table style="border-collapse:collapse;font:14px system-ui">';
  for (var i = 0; i < rows.length; i++) {
    body += '<tr><td style="padding:3px 14px 3px 0;color:#666;vertical-align:top">' +
      escapeHtml_(rows[i][0]) + '</td><td style="padding:3px 0">' +
      escapeHtml_(rows[i][1] == null || rows[i][1] === '' ? '—' : String(rows[i][1])) +
      '</td></tr>';
  }
  body += '</table><p style="font:13px system-ui;color:#888;margin-top:16px">' +
    'Full log: <a href="' + SpreadsheetApp.getActiveSpreadsheet().getUrl() + '">open the sheet</a>' +
    '</p>';

  MailApp.sendEmail({ to: NOTIFY_EMAIL, subject: subject, htmlBody: body });
}

// User-supplied strings land in an HTML email, so escape them.
function escapeHtml_(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
