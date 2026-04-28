import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userName, userEmail, format, locationName, mode } = req.body ?? {};
  const time = new Date().toLocaleString('en-AU', { timeZone: 'Asia/Dili' });
  const to   = process.env.NOTIFY_EMAIL;

  if (!process.env.RESEND_API_KEY) {
    console.error('[log-download] RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email service not configured' });
  }
  if (!to) {
    console.error('[log-download] NOTIFY_EMAIL is not set');
    return res.status(500).json({ error: 'Notify email not configured' });
  }

  const { data, error } = await resend.emails.send({
    from:    'Open-Meteo Explorer <onboarding@resend.dev>',
    to,
    subject: `Download: ${userEmail} exported ${format} — ${locationName ?? 'unknown location'}`,
    html: `
      <h2>Data export on Open-Meteo Explorer</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">User</td><td><strong>${userName ?? '—'}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${userEmail ?? '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Format</td><td>${format ?? '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Location</td><td>${locationName ?? '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Mode</td><td>${mode ?? '—'}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Time</td><td>${time}</td></tr>
      </table>
    `,
  });

  if (error) {
    console.error('[log-download] Resend error:', error);
    return res.status(500).json({ error });
  }

  console.log('[log-download] Email sent, id:', data?.id);
  return res.status(200).json({ ok: true });
}
