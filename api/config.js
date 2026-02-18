const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin';
const REDIS_KEY = 'pantheism:config';

async function redisGet() {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return {};
  try {
    const res = await fetch(`${UPSTASH_URL}/get/${REDIS_KEY}`, {
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
    });
    const data = await res.json();
    if (data.result) {
      try { return JSON.parse(data.result); } catch { return {}; }
    }
    return {};
  } catch (e) {
    console.error('Redis GET error:', e.message);
    return {};
  }
}

async function redisSet(value) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    throw new Error('Redis credentials not configured');
  }
  const res = await fetch(`${UPSTASH_URL}/set/${REDIS_KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(value)),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Redis SET failed: ${res.status} ${text}`);
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const config = await redisGet();
      return res.status(200).json(config);
    }

    if (req.method === 'POST') {
      const { password, ca, xUrl, action } = req.body || {};

      // Password check
      if (password !== ADMIN_PASS) {
        return res.status(401).json({ error: 'Wrong password' });
      }

      // Just verifying password, don't touch Redis
      if (action === 'login') {
        return res.status(200).json({ ok: true });
      }

      // Save config
      const config = { ca: ca || '', xUrl: xUrl || '' };
      await redisSet(config);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('API error:', e.message);
    return res.status(500).json({ error: e.message });
  }
}
