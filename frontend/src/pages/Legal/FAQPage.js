import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqCategories = [
    {
      category: 'Komma igång',
      questions: [
        {
          q: 'Hur skapar jag ett konto?',
          a: 'Du kan skapa ett konto genom att klicka på "Registrera" på startsidan. Fyll i dina uppgifter och följ instruktionerna. Du kan också registrera dig med ditt Apple- eller Google-konto för snabbare inloggning.'
        },
        {
          q: 'Är RunMate gratis att använda?',
          a: 'Ja! RunMate har en gratis grundversion som innehåller alla kärnfunktioner. Vi erbjuder också RunMate Pro med avancerade funktioner som AI-coaching och detaljerad analys.'
        },
        {
          q: 'Hur synkar jag med Apple Health?',
          a: 'Gå till Inställningar och klicka på "Synka med Apple Health". Du kan också använda snabbknappen i toppen av appen. Godkänn behörigheterna i Apple Health för att aktivera synkronisering.'
        }
      ]
    },
    {
      category: 'Träningsfunktioner',
      questions: [
        {
          q: 'Hur loggar jag en löprunda?',
          a: 'Klicka på plus-knappen (+) i appen och välj "Logga aktivitet". Du kan antingen starta GPS-spårning för realtidsloggning eller manuellt lägga till en genomförd aktivitet.'
        },
        {
          q: 'Vad är AI Coach?',
          a: 'AI Coach är din personliga träningsassistent som använder artificiell intelligens för att skapa skräddarsydda träningsplaner baserat på dina mål, nuvarande kondition och tillgänglig tid.'
        },
        {
          q: 'Hur fungerar föreslagna rutter?',
          a: 'Föreslagna rutter använder AI för att rekommendera löprundor baserat på din träningshistorik, position och preferenser. Rutterna anpassas efter din konditionsnivå och önskad distans.'
        }
      ]
    },
    {
      category: 'Sociala funktioner',
      questions: [
        {
          q: 'Hur hittar jag träningspartners?',
          a: 'Använd "Ny träningskompis" för att hitta löpare i din närhet. Du kan filtrera på tempo, distans och träningstider för att hitta perfekta matchningar.'
        },
        {
          q: 'Kan jag skapa privata grupper?',
          a: 'Ja! Gå till Community och skapa en ny grupp. Du kan välja om gruppen ska vara öppen för alla eller privat med inbjudningskod.'
        },
        {
          q: 'Hur fungerar utmaningar?',
          a: 'Utmaningar låter dig tävla med andra användare. Du kan delta i befintliga utmaningar eller skapa egna. Poäng baseras på distans, tid eller antal aktiviteter.'
        }
      ]
    },
    {
      category: 'Säkerhet & Integritet',
      questions: [
        {
          q: 'Hur skyddar ni mina personuppgifter?',
          a: 'Vi använder industristandardkryptering för all data. Dina personuppgifter delas aldrig med tredje part utan ditt samtycke. Läs vår integritetspolicy för mer information.'
        },
        {
          q: 'Kan jag radera mitt konto?',
          a: 'Ja, du kan när som helst radera ditt konto från Inställningar. All din data raderas permanent inom 30 dagar.'
        },
        {
          q: 'Vem kan se mina aktiviteter?',
          a: 'Du kontrollerar din integritet. I inställningar kan du välja om dina aktiviteter ska vara offentliga, synliga för vänner eller helt privata.'
        }
      ]
    },
    {
      category: 'Teknisk support',
      questions: [
        {
          q: 'Varför fungerar inte GPS-spårningen?',
          a: 'Kontrollera att du har gett appen platsåtkomst i telefonens inställningar. GPS fungerar bäst utomhus med fri sikt mot himlen.'
        },
        {
          q: 'Hur exporterar jag mina träningsdata?',
          a: 'Gå till Inställningar > Exportera data. Du kan exportera till GPX, TCX eller CSV-format för användning i andra appar.'
        },
        {
          q: 'Vilka enheter stöds?',
          a: 'RunMate fungerar på iPhone (iOS 14+), Android (8.0+) och i alla moderna webbläsare. Apple Watch-appen finns tillgänglig på App Store.'
        }
      ]
    }
  ];

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Vanliga frågor</h1>
          <p className="text-lg text-gray-600">
            Hitta svar på de vanligaste frågorna om RunMate
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqCategories.map((category, categoryIndex) => (
            <motion.div
              key={categoryIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="bg-white rounded-xl shadow-sm overflow-hidden"
            >
              <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100">
                <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
              </div>
              
              <div className="divide-y divide-gray-100">
                {category.questions.map((item, index) => {
                  const globalIndex = categoryIndex * 100 + index;
                  const isOpen = openIndex === globalIndex;
                  
                  return (
                    <div key={index} className="relative">
                      <button
                        onClick={() => toggleQuestion(globalIndex)}
                        className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="text-base font-medium text-gray-900 pr-8">
                            {item.q}
                          </h3>
                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                          </motion.div>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4">
                              <p className="text-gray-600 leading-relaxed">
                                {item.a}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">
            Hittade du inte svaret du letade efter?
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            Kontakta support
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage; 