const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || '165013';
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || '8c9eb85c96a23cf9a0ed8bc8771905601893c800';
const STRAVA_REDIRECT_URI = process.env.STRAVA_REDIRECT_URI || 'http://localhost:5000/api/auth/strava/callback';

module.exports = {
  STRAVA_CLIENT_ID,
  STRAVA_CLIENT_SECRET,
  STRAVA_REDIRECT_URI
}; 