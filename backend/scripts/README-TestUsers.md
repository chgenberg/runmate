# 🏃‍♂️ RunMate Test Users Generator

Detta script skapar 30 realistiska svenska testanvändare med aktiviteter för att testa RunMate-appen.

## 🎯 Vad skapas

### 👥 Användare (30 st)
- **Realistiska svenska namn** (Erik Andersson, Anna Johansson, etc.)
- **Olika åldrar** (18-65 år)
- **Fördelade över Sverige** (Stockholm, Göteborg, Malmö, Uppsala, etc.)
- **Unsplash-bilder** för löpare (fungerar överallt)
- **Autentiska löparbeskrivningar** på svenska
- **Olika aktivitetsnivåer** (recreational, serious, competitive)

### 🏃‍♀️ Aktiviteter (5-25 per användare)
- **Realistiska träningspass** (easy, tempo, long, interval, recovery)
- **Varierande distanser** (2-25km)
- **Realistiska tider** (3:30-8:00 min/km)
- **Kalorier, puls, höjdmeter** beräknat automatiskt
- **Aktiviteter spridda över senaste året**

## 🚀 Användning

### Lokalt (Development)
```bash
# Från backend-mappen
npm run create-users
```

### Railway (Production)
```bash
# Från backend-mappen
npm run deploy-users
```

### Manuellt
```bash
# Lokalt
node scripts/create30RealUsers.js

# Railway med miljövariabler
MONGODB_URI=your_railway_db_url node scripts/create30RealUsers.js
```

## 📊 Exempel på vad som skapas

### Användare
- **Erik Andersson** från Stockholm - Maratonlöpare, 28 år
- **Anna Johansson** från Göteborg - Trail runner, 34 år  
- **Lars Karlsson** från Malmö - Nybörjare, 45 år

### Aktiviteter
- **Easy löpning**: 5.2km på 32 min (6:10 min/km)
- **Tempo löpning**: 8.7km på 37 min (4:15 min/km)
- **Long löpning**: 18.3km på 1h 52min (6:05 min/km)

## 🔧 Funktioner

### ✅ Säker
- **Behåller test@runmate.se** - tar inte bort huvudkontot
- **Rensar bara genererad data** - påverkar inte riktiga användare
- **Validerar data** innan sparning

### ✅ Realistisk
- **Svenska namn och platser**
- **Realistiska löpartider och distanser**
- **Varierande aktivitetsnivåer**
- **Autentiska beskrivningar**

### ✅ Flexibel
- **Fungerar lokalt och på Railway**
- **Automatisk databasdetektering**
- **Konfigurerbar antal användare**

## 🌍 Railway Deployment

När du kör `npm run deploy-users` på Railway:

1. **Ansluter till Railway MongoDB**
2. **Skapar 30 användare med Unsplash-bilder**
3. **Genererar hundratals aktiviteter**
4. **Beräknar realistisk statistik**
5. **Redo för produktion!**

## 📱 Resultat

Efter körning får du:
- **30 olika profiler** att testa matching med
- **Hundratals aktiviteter** för statistik-testing
- **Realistisk data** för demo-syfte
- **Svenska användare** för lokal relevans

## 🔍 Debugging

Om något går fel:
```bash
# Kolla logs
npm run create-users 2>&1 | tee user-creation.log

# Testa databasanslutning
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://localhost:27017/runmate').then(() => console.log('OK')).catch(console.error)"
```

## 🎨 Anpassning

Vill du ändra något? Editera `create30RealUsers.js`:
- **Antal användare**: Ändra loopen från 30 till annat nummer
- **Aktiviteter per användare**: Ändra `Math.floor(Math.random() * 20) + 5`
- **Städer**: Lägg till fler i `swedishLocations`
- **Namn**: Lägg till fler i `swedishNames`
- **Beskrivningar**: Lägg till fler i `runnerBios`

---

**🎉 Lycka till med testningen av RunMate!** 