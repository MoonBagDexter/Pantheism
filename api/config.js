const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin';

// In-memory config — persists across warm invocations, resets on redeploy or cold start
let config = {};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    const { password, ca, xUrl, action } = req.body || {};

    if (password !== ADMIN_PASS) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    if (action === 'login') {
      return res.status(200).json({ ok: true });
    }

    config = { ca: ca || '', xUrl: xUrl || '' };
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
