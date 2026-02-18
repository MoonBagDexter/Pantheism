const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'admin';
const REDIS_KEY = 'pantheism:config';

async function redisGet() {
  const res = await fetch(`${UPSTASH_URL}/get/${REDIS_KEY}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
  });
  const data = await res.json();
  if (data.result) {
    try { return JSON.parse(data.result); } catch { return {}; }
  }
  return {};
}

async function redisSet(value) {
  await fetch(`${UPSTASH_URL}/set/${REDIS_KEY}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${UPSTASH_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(JSON.stringify(value)),
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const config = await redisGet();
    return res.status(200).json(config);
  }

  if (req.method === 'POST') {
    const { password, ca, xUrl } = req.body;
    if (password !== ADMIN_PASS) {
      return res.status(401).json({ error: 'Wrong password' });
    }
    const config = { ca: ca || '', xUrl: xUrl || '' };
    await redisSet(config);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
