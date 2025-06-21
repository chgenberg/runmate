import React, { useState } from 'react';
import { 
  Navigation, 
  Play, 
  X, 
  ChevronRight,
  Shield,
  Smartphone,
  Wifi
} from 'lucide-react';

const GPSTutorial = ({ isOpen, onClose, onStart }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Navigation,
      title: "Välkommen till GPS-spårning!",
      description: "Spåra dina löprundor i realtid med GPS-teknik. Se distans, tempo och rutt medan du springer.",
      tips: [
        "Få exakt distans och tempo",
        "Se din rutt på karta",
        "Automatisk tidtagning",
        "Spara alla detaljer"
      ]
    },
    {
      icon: Shield,
      title: "Tillåt platsåtkomst",
      description: "För att använda GPS-spårning behöver vi åtkomst till din plats. Dina positionsdata sparas endast lokalt på din enhet.",
      tips: [
        "Klicka 'Tillåt' när webbläsaren frågar",
        "Inga personliga data delas",
        "GPS fungerar offline",
        "Du kan stänga av när som helst"
      ]
    },
    {
      icon: Smartphone,
      title: "Håll telefonen aktiv",
      description: "För bästa GPS-prestanda, håll telefonen aktiv och webbläsaren öppen under löpningen.",
      tips: [
        "Låt inte skärmen stängas av",
        "Håll webbläsaren öppen",
        "Undvik att byta appar",
        "Håll telefonen stadigt"
      ]
    },
    {
      icon: Play,
      title: "Redo att börja!",
      description: "Du är nu redo att starta din första GPS-spårade löprunda. Tryck på 'Starta spårning' för att börja.",
      tips: [
        "Vänta på GPS-signal (grön lampa)",
        "Tryck på Pausa för rast",
        "Tryck på Spara när du är klar",
        "Din rutt visas automatiskt"
      ]
    }
  ];

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onStart();
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-4">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{currentStepData.title}</h2>
              <div className="flex items-center mt-1">
                <span className="text-sm opacity-90">Steg {currentStep + 1} av {steps.length}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/20 rounded-full h-1 mt-4">
            <div 
              className="bg-white h-1 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-lg mb-6">
            {currentStepData.description}
          </p>

          <div className="space-y-3 mb-8">
            {currentStepData.tips.map((tip, index) => (
              <div key={index} className="flex items-center text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                currentStep === 0 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              Tillbaka
            </button>

            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-xl flex items-center space-x-2 transition-colors"
            >
              <span>{currentStep === steps.length - 1 ? 'Börja spåra!' : 'Nästa'}</span>
              {currentStep === steps.length - 1 ? (
                <Play className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Quick tips footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex items-center text-sm text-gray-600">
            <Wifi className="w-4 h-4 mr-2 text-green-500" />
            <span>GPS fungerar offline och sparar din integritet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSTutorial; 