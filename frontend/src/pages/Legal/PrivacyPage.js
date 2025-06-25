import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/app/dashboard"
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Tillbaka till appen
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Integritetspolicy</h1>
          <p className="text-lg text-gray-600">
            Senast uppdaterad: 25 juni 2024
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 prose prose-lg max-w-none">
          <h2>1. Inledning</h2>
          <p>
            Välkommen till RunMate! Vi värnar om din integritet och är transparenta med hur vi samlar in, 
            använder och skyddar din personliga information. Denna integritetspolicy förklarar våra 
            dataskyddsrutiner när du använder vår tjänst.
          </p>

          <h2>2. Information vi samlar in</h2>
          <h3>2.1 Information du ger oss</h3>
          <ul>
            <li>Kontouppgifter (namn, e-post, användarnamn)</li>
            <li>Profilinformation (ålder, kön, löpnivå)</li>
            <li>Träningsdata (löprundor, tider, distanser)</li>
            <li>Meddelanden och kommunikation</li>
          </ul>

          <h3>2.2 Information vi samlar in automatiskt</h3>
          <ul>
            <li>Enhets- och användardata</li>
            <li>Platsdata (med ditt tillstånd)</li>
            <li>Användningsstatistik</li>
          </ul>

          <h2>3. Hur vi använder din information</h2>
          <p>Vi använder din information för att:</p>
          <ul>
            <li>Tillhandahålla och förbättra våra tjänster</li>
            <li>Matcha dig med lämpliga träningspartners</li>
            <li>Ge personliga träningsrekommendationer</li>
            <li>Kommunicera med dig om tjänsten</li>
            <li>Säkerställa säkerhet och förhindra missbruk</li>
          </ul>

          <h2>4. Delning av information</h2>
          <p>
            Vi säljer aldrig din personliga information. Vi delar endast information i begränsade fall:
          </p>
          <ul>
            <li>Med andra användare enligt dina integritetsinställningar</li>
            <li>Med tjänsteleverantörer som hjälper oss driva tjänsten</li>
            <li>När det krävs enligt lag</li>
          </ul>

          <h2>5. Datasäkerhet</h2>
          <p>
            Vi implementerar branschstandarder för säkerhet för att skydda din information, 
            inklusive kryptering, säkra servrar och regelbundna säkerhetsgranskningar.
          </p>

          <h2>6. Dina rättigheter</h2>
          <p>Du har rätt att:</p>
          <ul>
            <li>Få tillgång till dina personuppgifter</li>
            <li>Korrigera felaktig information</li>
            <li>Begära radering av dina data</li>
            <li>Begränsa behandlingen av dina data</li>
            <li>Överföra dina data till annan tjänst</li>
          </ul>

          <h2>7. Cookies och spårning</h2>
          <p>
            Vi använder cookies och liknande tekniker för att förbättra din upplevelse, 
            analysera användning och tillhandahålla personaliserat innehåll.
          </p>

          <h2>8. Ändringar av policyn</h2>
          <p>
            Vi kan uppdatera denna policy från tid till annan. Vi kommer att meddela dig om 
            väsentliga ändringar via e-post eller genom appen.
          </p>

          <h2>9. Kontakta oss</h2>
          <p>
            Om du har frågor om denna integritetspolicy eller vill utöva dina rättigheter, 
            kontakta oss på:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="mb-2"><strong>E-post:</strong> privacy@runmate.se</p>
            <p className="mb-2"><strong>Adress:</strong> RunMate AB, Storgatan 1, 111 51 Stockholm</p>
            <p><strong>Telefon:</strong> 08-123 456 78</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage; 