// Vercel serverless function — receives Clerk "user.created" webhooks
// and emails the site owner a registration alert.
//
// Setup in Clerk Dashboard:
//   Webhooks → Add Endpoint → URL: https://your-app.vercel.app/api/webhook-clerk
//   Events: user.created
//   Copy the "Signing Secret" → add to Vercel env as CLERK_WEBHOOK_SECRET

import { Webhook } from 'svix';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify the webhook signature (prevents spoofed requests)
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) return res.status(500).json({ error: 'CLERK_WEBHOOK_SECRET not set' });

  const wh = new Webhook(secret);
  let event;
  try {
    const body = await getRawBody(req);
    event = wh.verify(body, {
      'svix-id':        req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });
  } catch {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  if (event.type !== 'user.created') {
    return res.status(200).json({ received: true });
  }

  const { id, email_addresses, first_name, last_name, created_at } = event.data;
  const email = email_addresses?.[0]?.email_address ?? '(no email)';
  const name  = [first_name, last_name].filter(Boolean).join(' ') || '(no name)';
  const time  = new Date(created_at).toLocaleString('en-AU', { timeZone: 'Asia/Dili' });

  await resend.emails.send({
    from: 'Open-Meteo Explorer <onboarding@resend.dev>',
    to:   process.env.NOTIFY_EMAIL,
    subject: `New registration: ${name} (${email})`,
    html: `
      <h2>New user registered on Open-Meteo Explorer</h2>
      <table style="border-collapse:collapse;font-size:14px">
        <tr><td style="padding:4px 12px 4px 0;color:#666">Name</td><td><strong>${name}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Email</td><td>${email}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Clerk ID</td><td style="font-family:monospace;font-size:12px">${id}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#666">Registered at</td><td>${time}</td></tr>
      </table>
      <p style="margin-top:16px;font-size:12px;color:#999">
        Manage users: <a href="https://dashboard.clerk.com">Clerk Dashboard</a>
      </p>
    `,
  });

  return res.status(200).json({ received: true });
}

// Vercel streams the body — read it as text for svix signature check
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
