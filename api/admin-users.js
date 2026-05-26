export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (token !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.CLERK_SECRET_KEY) {
    return res.status(500).json({ error: 'CLERK_SECRET_KEY not configured' });
  }

  try {
    const clerkRes = await fetch('https://api.clerk.com/v1/users?limit=100&order_by=-created_at', {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    });

    if (!clerkRes.ok) {
      throw new Error(`Clerk API error: ${clerkRes.status}`);
    }

    const users = await clerkRes.json();

    const sanitized = users.map((user) => ({
      id: user.id,
      email: user.email_addresses?.[0]?.email_address ?? '—',
      firstName: user.first_name ?? '—',
      lastName: user.last_name ?? '—',
      createdAt: user.created_at,
      lastSignIn: user.last_sign_in_at,
    }));

    return res.status(200).json({
      count: sanitized.length,
      users: sanitized,
    });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
