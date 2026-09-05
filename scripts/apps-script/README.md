# Download logger — one-time setup

The site is static (GitHub Pages), so it has no backend of its own. Download
contact details are posted to a Google Apps Script web app that appends a row to
a Google Sheet and emails you. It costs nothing and needs no API keys in the
front-end bundle.

Takes about five minutes.

## 1. Create the sheet

1. Go to <https://sheets.new> and name it e.g. `Open-Meteo Explorer — Downloads`.
2. **Extensions → Apps Script**. A script editor opens, bound to this sheet.

## 2. Add the script

1. Delete the contents of `Code.gs` in the editor.
2. Paste the whole of [`Code.gs`](./Code.gs) from this folder.
3. Confirm `NOTIFY_EMAIL` at the top is the address you want notifications at.
4. Save (Ctrl+S).

## 3. Deploy it

1. **Deploy → New deployment**.
2. Click the gear next to "Select type" and choose **Web app**.
3. Set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`  ← must be *Anyone*, not "Anyone with Google account"
4. **Deploy**, then **Authorize access** and approve the permissions
   (Google shows an "unverified app" warning for your own scripts — click
   *Advanced → Go to … (unsafe)*; it is your own code).
5. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

Open that URL in a browser — you should see `{"ok":true,...}`.

## 4. Point the app at it

Local development, in `.env.local` at the repo root:

```
VITE_DOWNLOAD_LOG_ENDPOINT=https://script.google.com/macros/s/AKfycb.../exec
```

For the GitHub Pages deploy, add it as a repository secret named
`VITE_DOWNLOAD_LOG_ENDPOINT` (**Settings → Secrets and variables → Actions →
New repository secret**). The workflow already passes it through to the build.

## 5. Check it

Run the app, fetch some data, click **CSV**. You should get the contact form,
then a new row in the sheet and an email.

## Notes

- **If the endpoint is not set, the gate is skipped entirely** and downloads
  work exactly as before. That is deliberate — a misconfigured deployment must
  never stop people getting data.
- **A logging failure never blocks a download.** The file is written first and
  the report is fire-and-forget.
- **Emails are rate-limited** to one per address per 30 minutes
  (`EMAIL_COOLDOWN_MINUTES`) so someone exporting CSV, Excel and TXT in a row
  doesn't send three near-identical mails. Every download is still written to
  the sheet.
- **Quota**: consumer Gmail accounts allow 100 MailApp emails/day. The sheet has
  no such limit, so if you ever exceed it you still lose nothing — set
  `EMAIL_COOLDOWN_MINUTES` higher and read the sheet.
- **After editing `Code.gs`**, you must **Deploy → Manage deployments → edit →
  Version: New version → Deploy**. Saving alone does not update the live URL.
- The endpoint URL ships in the public JS bundle. That is unavoidable for a
  static site and is fine — the worst case is junk rows, which you can filter or
  delete in the sheet.
