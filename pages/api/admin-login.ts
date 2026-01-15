import type { NextApiRequest, NextApiResponse } from 'next';

const COOKIE_NAME = 'admin_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (password === adminPassword) {
    // Set HTTP-only cookie
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=authenticated; HttpOnly; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Strict${
        process.env.NODE_ENV === 'production' ? '; Secure' : ''
      }`
    );
    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ error: 'Invalid password' });
}
