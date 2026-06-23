if (typeof window === 'undefined') {
  const required = ['GCP_PROJECT_ID', 'GCP_LOCATION', 'GCP_JSON_BASE64'];
  const missing: string[] = [];

  for (const name of required) {
    const val = process.env[name];
    if (!val) {
      missing.push(name);
    } else if (name === 'GCP_JSON_BASE64') {
      try {
        const decoded = Buffer.from(val, 'base64').toString('utf-8');
        const parsed = JSON.parse(decoded);
        if (!parsed.client_email || !parsed.private_key) {
          missing.push('GCP_JSON_BASE64 (missing client_email or private_key)');
        }
      } catch {
        console.error(
          '[env-validation] GCP_JSON_BASE64 is set but contains invalid or malformed base64/JSON'
        );
        missing.push('GCP_JSON_BASE64 (invalid/malformed format)');
      }
    }
  }

  if (missing.length > 0) {
    console.error(
      `[AI Data Lens] Environment variable validation failed. Missing or invalid variables: ${missing.join(', ')}`
    );
  }
}
