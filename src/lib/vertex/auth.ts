// Credentials: base64-encoded JSON in env var (Vercel secrets friendly)
function getCredentials(): { client_email: string; private_key: string } {
  const b64 = process.env.GCP_JSON_BASE64;
  if (!b64) {
    throw new Error(
      '[vertex] GCP_JSON_BASE64 env var not set. Base64-encode your gcp.json and add it.'
    );
  }
  try {
    const json = Buffer.from(b64, 'base64').toString('utf-8');
    const creds = JSON.parse(json);
    if (!creds.client_email || !creds.private_key) {
      throw new Error('Missing client_email or private_key');
    }
    return creds;
  } catch (e) {
    throw new Error(
      '[vertex] Failed to decode GCP_JSON_BASE64: ' +
        (e instanceof Error ? e.message : String(e)),
      { cause: e }
    );
  }
}

export async function getAccessToken(): Promise<string> {
  const creds = getCredentials();
  const jwt = (await import('jsonwebtoken')).default;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };

  const signed = jwt.sign(payload, creds.private_key, { algorithm: 'RS256' });

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signed,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error('Failed to get token');
  return data.access_token;
}
