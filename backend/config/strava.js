const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '165590';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '485a867db527a267f59ed24076d6ee513040abec';
// Use environment variable first, fallback to staging URL for this deployment
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'https://staging-runmate-backend-production.up.railway.app/api/auth/strava/callback';

console.log('Strava Config:', {
  clientId: STRAVA_CLIENT_ID,
  redirectUri: STRAVA_REDIRECT_URI,
  envRedirectUri: process.env.STRAVA_REDIRECT_URI,
  railwayEnv: process.env.RAILWAY_ENVIRONMENT_NAME,
  nodeEnv: process.env.NODE_ENV
});

module.exports = {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI
}; 