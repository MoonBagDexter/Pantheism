export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.json({
    ca: process.env.SITE_CA || '',
    xUrl: process.env.SITE_X_URL || '',
  });
}
