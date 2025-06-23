// Determine environment and set appropriate backend URL for callback
const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.RAILWAY_ENVIRONMENT_NAME === 'staging') return 'staging';
  return 'development';
};

const environment = getEnvironment();
const BACKEND_URL = process.env.BACKEND_URL || {
  development: 'http://localhost:8000',
  staging: 'https://staging-runmate-backend-production.up.railway.app',
  production: 'https://runmate-backend-production.up.railway.app'
}[environment];

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '165013';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '8c9eb85c96a23cf9a0ed8bc8771905601893c800';
// Try multiple possible redirect URIs
const DEFAULT_REDIRECT_URI = `${BACKEND_URL}/api/strava/callback`;
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || DEFAULT_REDIRECT_URI;

console.log('Strava Config:', {
  clientId: STRAVA_CLIENT_ID,
  redirectUri: STRAVA_REDIRECT_URI,
  defaultRedirectUri: DEFAULT_REDIRECT_URI,
  environment: environment,
  backendUrl: BACKEND_URL,
  railwayEnv: process.env.RAILWAY_ENVIRONMENT_NAME,
  nodeEnv: process.env.NODE_ENV
});

module.exports = {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI
}; 