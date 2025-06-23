// Determine environment and set appropriate frontend URL
const getEnvironment = () => {
  if (process.env.NODE_ENV === 'production') return 'production';
  if (process.env.RAILWAY_ENVIRONMENT_NAME === 'staging') return 'staging';
  return 'development';
};

const environment = getEnvironment();
const BASE_URL = process.env.FRONTEND_URL || {
  development: 'http://localhost:3000',
  staging: 'https://staging-runmate-frontend-production.up.railway.app',
  production: 'https://runmate-frontend-production.up.railway.app'
}[environment];

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '165013';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '8c9eb85c96a23cf9a0ed8bc8771905601893c800';
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || `${BASE_URL}/strava/callback`;

console.log('Strava Config:', {
  clientId: STRAVA_CLIENT_ID,
  redirectUri: STRAVA_REDIRECT_URI,
  environment: environment,
  baseUrl: BASE_URL,
  railwayEnv: process.env.RAILWAY_ENVIRONMENT_NAME
});

module.exports = {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI
}; 