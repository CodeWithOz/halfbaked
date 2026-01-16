import type { NextApiRequest, NextApiResponse } from 'next';
import {
  validatePassword,
  generateAuthToken,
  generateAuthCookie,
} from '@/lib/auth';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Normalize id to string (req.query.id can be string | string[] | undefined)
  const rawId = req.query.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const adminPath = process.env.ADMIN_PATH;

  if (!adminPath) {
    console.error('ADMIN_PATH environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!process.env.ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  if (!process.env.AUTH_SECRET) {
    console.error('AUTH_SECRET environment variable is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // Validate the path matches
  if (id !== adminPath) {
    return res.status(404).json({ error: 'Not found' });
  }

  const { password } = req.body;

  // Use timing-safe comparison to prevent timing attacks
  if (validatePassword(password || '')) {
    // Generate a signed token
    const token = generateAuthToken();

    // Set HTTP-only cookie with signed token
    res.setHeader('Set-Cookie', generateAuthCookie(token));
    return res.status(200).json({ success: true, redirectTo: `/p/${adminPath}` });
  }

  return res.status(401).json({ error: 'Invalid password' });
}
