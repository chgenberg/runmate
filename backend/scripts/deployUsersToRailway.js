#!/usr/bin/env node

// Deployment script för Railway - Skapa 30 realistiska användare
// Kör detta på Railway för att populera databasen med testdata

require('dotenv').config();
const create30RealUsers = require('./create30RealUsers');

console.log('🚀 === RAILWAY DEPLOYMENT: Skapar testanvändare ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('Database:', process.env.MONGODB_URI ? 'Railway Cloud MongoDB' : 'Local MongoDB');

// Vänta lite för att låta Railway-miljön stabilisera sig
setTimeout(async () => {
  try {
    console.log('\n🔄 Startar skapande av testanvändare...');
    await create30RealUsers();
    console.log('\n✅ Railway deployment av testanvändare klar!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Railway deployment misslyckades:', error);
    process.exit(1);
  }
}, 2000); 