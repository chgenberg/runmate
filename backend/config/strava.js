const isDevelopment = process.env.NODE_ENV !== 'production';
const BASE_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://runmate-frontend-production.up.railway.app';

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '165013';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '8c9eb85c96a23cf9a0ed8bc8771905601893c800';
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || `${BASE_URL}/strava/callback`;

console.log('Strava Config:', {
  clientId: STRAVA_CLIENT_ID,
  redirectUri: STRAVA_REDIRECT_URI,
  environment: process.env.NODE_ENV || 'development'
});

module.exports = {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI
}; 