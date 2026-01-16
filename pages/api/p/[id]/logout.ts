import type { NextApiRequest, NextApiResponse } from 'next';
import { generateClearAuthCookie } from '@/lib/auth';

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

  // Validate the path matches
  if (id !== adminPath) {
    return res.status(404).json({ error: 'Not found' });
  }

  // Clear the auth cookie
  res.setHeader('Set-Cookie', generateClearAuthCookie());

  return res.status(200).json({ success: true, redirectTo: `/p/${adminPath}/login` });
}
