# RunMate - Advanced Running Social Platform

En komplett löpsocial plattform med GPS-spårning, utmaningar och AI-baserad matchning.

## 🚀 Nyhet: GPS-spårning

### Funktioner
- **Realtids GPS-spårning** med hög noggrannhet
- **Live-statistik** som visar distans, tempo och kalorier under löpningen  
- **Automatiska mellantider** varje kilometer med notifikationer
- **Rutt-visualisering** på interaktiv karta
- **Paus/fortsätt-funktion** för raster
- **Måltempo-inställningar** med realtids-feedback
- **Interaktiv tutorial** för förstagångsanvändare
- **Offline-kompatibilitet** - fungerar utan internetanslutning

### Tekniska detaljer
- Använder Geolocation API för exakt positionering
- Haversine-formel för distansberäkningar
- Canvas-baserad kartvisualisering
- Optimerad för mobila enheter
- Automatisk datavalidering för GPS-noggrannhet

## 🎯 Projektöversikt

RunMate löser problemet med motivation och ensamhet inom träning genom att skapa en community där användare kan:
- **Matcha** med träningspartners genom Tinder-liknande swipe-funktionalitet
- **Träna tillsammans** med likasinnade i sin närhet
- **Delta i utmaningar** och tävlingar för extra motivation
- **Spåra aktiviteter** och följa sina framsteg
- **Bygga relationer** genom sport och träning

## ✨ Huvudfunktioner

### 🎯 Utmaningar (Challenges)
- Skapa och delta i grupputmaningar
- Flexibla mål: distans, tid, aktiviteter, höjdmeter
- Individuella eller kollektiva målsättningar
- Real-time leaderboards och framstegsspårning
- Achievement-system med milstolpar

### 📊 Aktivitetsloggning
- Manuell aktivitetsloggning med detaljerad data
- GPS-baserad automatisk spårning
- Foto-uppladdning för aktiviteter
- Komplett statistik: tempo, kalorier, höjdmeter
- Aktivitetshistorik med sök- och filterfunktioner

### 🤝 Social Matchning
- AI-baserad kompatibilitets-matchning
- Swipe-gränssnitt för att hitta löppartners
- Geografisk närhet och prestationsnivå
- Chat-funktionalitet mellan matches

### 🏆 Gamification
- Poängsystem baserat på aktiviteter
- Badges och achievements
- Personliga rekord (PR) spårning
- Utmanings-contributions automatiskt

### 💬 Social Funktionalitet
- Realtidschatt mellan matchade användare
- Kommentarer och kudos på aktiviteter
- Gruppfunktioner för utmaningar
- Event-planering för gemensamma träningspass

### 💎 Premium-funktioner
- Obegränsat antal swipes per dag
- Avancerade filter och sökfunktioner
- Se vem som har gillat dig
- Detaljerad träningsanalys och coaching
- Reklamfri upplevelse

## 🛠️ Teknisk Stack

### Backend
- **Node.js** med Express.js
- **MongoDB** med Mongoose ODM
- **Socket.IO** för realtidskommunikation
- **Multer** för filuppladdning
- **JWT** för autentisering

### Frontend  
- **React 18** med hooks och context
- **React Router v6** för navigation
- **Tailwind CSS** för styling
- **Lucide React** för ikoner
- **React Hot Toast** för notifikationer
- **Date-fns** för datumhantering

### GPS & Kartfunktioner
- **Geolocation API** för positionering
- **Canvas 2D** för rutt-rendering
- **Local Storage** för offline-data
- **Progressive Web App** features

## 📦 Installation

```bash
# Klona repository
git clone <repository-url>
cd RUN

# Installera dependencies
npm install

# Starta utvecklingsserver (backend + frontend)
npm start

# Eller starta separat:
# Backend (port 8000)
cd backend && npm start

# Frontend (port 3003)  
cd frontend && npm start
```

## 🔧 Miljövariabler

Skapa `.env` filer:

### Backend (.env)
```
NODE_ENV=development
PORT=8000
MONGO_URI=mongodb://localhost:27017/runmate
JWT_SECRET=your-jwt-secret
STRAVA_CLIENT_ID=your-strava-client-id
STRAVA_CLIENT_SECRET=your-strava-client-secret
```

## 🎮 Användning

### GPS-spårning
1. Navigera till "Aktiviteter" → "GPS Spårning"
2. Tillåt platsåtkomst när webbläsaren frågar
3. Vänta på GPS-signal (grön indikator)
4. Tryck "Starta spårning" för att börja
5. Se live-statistik under löpningen
6. Använd paus/fortsätt för raster
7. Tryck "Spara" när aktiviteten är klar

### Skapa Utmaning
1. Gå till "Utmaningar" → "Skapa Utmaning"
2. Välj typ (distans, tid, aktiviteter)
3. Sätt mål och tidsram
4. Bjud in vänner via join-kod
5. Följ framsteg i realtid

### Hitta Löppartners
1. Besök "Upptäck"-sidan
2. Swipe höger för att gilla profiler
3. Chat när båda har gillat varandra
4. Planera gemensamma löprundor

## 📊 Datamodeller

### Activity Schema
```javascript
{
  userId: ObjectId,
  title: String,
  distance: Number, // km
  duration: Number, // seconds
  route: [{ // GPS-punkter
    timestamp: Date,
    coordinates: [Number], // [lng, lat]
    elevation: Number,
    accuracy: Number
  }],
  startLocation: {
    type: "Point",
    coordinates: [Number],
    name: String
  },
  source: String // 'app', 'strava', 'manual'
}
```

## 🔒 Säkerhet & Integritet

- GPS-data lagras säkert och krypterat
- Användare kontrollerar synlighet av aktiviteter
- Platsdata delas aldrig utan uttryckligt samtycke
- GDPR-kompatibel datahantering

## 🚀 Roadmap

### Version 2.0
- [ ] Mapbox/Leaflet integration för avancerade kartor
- [ ] Apple Watch & Garmin sync
- [ ] Offline-läge med sync när online
- [ ] Gruppaktiviteter med live-tracking
- [ ] Väder-integration
- [ ] Hjärtfrekvens-integration

### Version 2.1
- [ ] Machine Learning för träningsrekommendationer
- [ ] Säkerhetsläge för kvinnliga löpare
- [ ] Event-skapande och registrering
- [ ] Premium-prenumeration med avancerad analytik

## 🤝 Bidra

1. Fork projektet
2. Skapa feature branch (`git checkout -b feature/amazing-feature`)
3. Commit ändringar (`git commit -m 'Add amazing feature'`)
4. Push till branch (`git push origin feature/amazing-feature`)
5. Öppna Pull Request

## 📄 Licens

Detta projekt är licensierat under MIT License - se [LICENSE](LICENSE) filen för detaljer.

## 👨‍💻 Utvecklare

Skapat med ❤️ för löpningsgemeenskapen.

---

**GPS-spårning är nu live! 🎉** Prova den nya funktionen för att få exakt data om dina löprundor.

## 📞 Kontakt

- **Email**: info@runmate.se
- **Website**: [www.runmate.se](https://www.runmate.se)
- **LinkedIn**: [RunMate Sverige](https://linkedin.com/company/runmate-se)

## 🙏 Tack

Stort tack till:
- Strava för inspiration kring community-byggande
- Tinder för matchning-UX patterns
- Svenska löpar- och cykelcommunityt för feedback
- Open source-bidragsgivare

---

**Made with ❤️ in Sweden** 🇸🇪 # Railway deployment trigger Tue Jun 24 14:33:03 CEST 2025


## OpenAI Setup

To enable AI features, add your OpenAI API key to the backend .env file:

1. Copy the example file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit .env and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```

3. Get your API key from: https://platform.openai.com/api-keys

The app will work without OpenAI, but will use fallback responses instead of GPT-4o.
