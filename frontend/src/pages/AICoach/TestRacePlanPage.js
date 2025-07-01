import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Play, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';

const TestRacePlanPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleGenerateTestPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/aicoach/test-race-plan');
      const data = await response.json();
      
      if (data.success) {
        toast.success('Test-plan genererad! Navigerar till kalender...');
        // Navigate to calendar page with the dummy plan data
        navigate('/app/race-coach-calendar', { 
          state: { plan: data.plan } 
        });
      } else {
        toast.error('Kunde inte generera test-plan');
      }
    } catch (error) {
      console.error('Error generating test plan:', error);
      toast.error('Något gick fel vid generering av test-plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <div className="mb-6">
          <Calendar className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Test Race Coach Calendar
          </h1>
          <p className="text-gray-600">
            Generera dummy-data för att testa kalenderfunktionaliteten
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Test-data inkluderar:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Stockholm Marathon (90 dagar framåt)</li>
              <li>• Komplett träningsschema</li>
              <li>• Nutritionsplan</li>
              <li>• Utrustningsguide</li>
              <li>• Race-strategi</li>
              <li>• Återhämtningsprotokoll</li>
              <li>• Apple Health integration</li>
            </ul>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateTestPlan}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold 
                     hover:bg-purple-700 transition-colors disabled:opacity-50 
                     disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Genererar...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Generera Test-plan
              </>
            )}
          </motion.button>

          <p className="text-xs text-gray-500 mt-4">
            Detta är endast för test och utveckling
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TestRacePlanPage; 