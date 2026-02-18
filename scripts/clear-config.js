// Runs on every Vercel deploy — clears the site config so admin must re-enter it
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

if (url && token) {
  fetch(`${url}/del/pantheism:config`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(() => console.log('Config cleared for fresh deploy.'))
    .catch((e) => console.log('Could not clear config:', e.message));
} else {
  console.log('No Redis credentials — skipping config clear.');
}
