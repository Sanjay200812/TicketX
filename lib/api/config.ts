export function getTicketXApiKey(): string | null {
  const apiKey = process.env.TICKETX_API_KEY || process.env.TMDB_ACCESS_TOKEN;
  if (!apiKey) {
    return null;
  }
  return apiKey;
}

export function getAuthHeaders(): Record<string, string> {
  const key = getTicketXApiKey();
  if (!key) return { 'Content-Type': 'application/json' };
  
  // TMDB support both v4 Bearer tokens and v3 API Keys
  if (key.length > 50) {
    return {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'x-api-key': key,
    'Content-Type': 'application/json',
  };
}
