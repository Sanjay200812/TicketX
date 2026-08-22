const env = {
  ticketXApiKey: process.env.TICKETX_API_KEY || process.env.TMDB_ACCESS_TOKEN,
};

export function validateServerEnv() {
  return {
    apiConfigured: Boolean(env.ticketXApiKey),
  };
}
