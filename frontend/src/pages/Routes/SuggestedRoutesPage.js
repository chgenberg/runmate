import React, { useState, useEffect } from 'react';
import { MapPinIcon, ClockIcon, FireIcon, ChartBarIcon, SparklesIcon, PlayIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const SuggestedRoutesPage = () => {
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [filters, setFilters] = useState({
    distance: 'all',
    difficulty: 'all',
    terrain: 'all'
  });

  useEffect(() => {
    generateRoutes();
  }, []);

  const generateRoutes = async () => {
    setLoading(true);
    try {
      // Simulate AI-generated routes based on user profile
      const generatedRoutes = [
        {
          id: 1,
          name: 'Morgonrunda vid Långholmen',
          distance: 5.2,
          duration: 25,
          difficulty: 'Lätt',
          terrain: 'Park',
          elevation: 45,
          calories: 320,
          description: 'Perfekt morgonrunda genom Långholmens naturområde. Mjuka stigar och vacker utsikt över vattnet.',
          highlights: ['Naturområde', 'Vattenvy', 'Mjuka stigar'],
          aiReason: 'Baserat på din träningsnivå och preferenser för naturmiljöer',
          coordinates: [
            [59.3165, 18.0351],
            [59.3180, 18.0365],
            [59.3195, 18.0380],
            [59.3210, 18.0365],
            [59.3225, 18.0350]
          ],
          image: '/lopning1.png'
        },
        {
          id: 2,
          name: 'Intensiv stadslöpning',
          distance: 8.5,
          duration: 40,
          difficulty: 'Medel',
          terrain: 'Stad',
          elevation: 120,
          calories: 580,
          description: 'Utmanande runda genom Stockholms city med varierad terräng och flera backar.',
          highlights: ['Stadsvy', 'Backtträning', 'Varierad terräng'],
          aiReason: 'Rekommenderad för att förbättra din kondition och hastighet',
          coordinates: [
            [59.3293, 18.0686],
            [59.3308, 18.0701],
            [59.3323, 18.0716],
            [59.3338, 18.0701],
            [59.3353, 18.0686]
          ],
          image: '/lopning2.png'
        },
        {
          id: 3,
          name: 'Lugn återhämtningsrunda',
          distance: 3.8,
          duration: 22,
          difficulty: 'Lätt',
          terrain: 'Park',
          elevation: 25,
          calories: 240,
          description: 'Avslappnad runda i Humlegården, perfekt för återhämtningsdagar.',
          highlights: ['Platt terräng', 'Skugga', 'Centralt läge'],
          aiReason: 'Optimal för aktiv återhämtning efter dina intensiva pass',
          coordinates: [
            [59.3425, 18.0758],
            [59.3440, 18.0773],
            [59.3455, 18.0788],
            [59.3470, 18.0773],
            [59.3485, 18.0758]
          ],
          image: '/lopning3.png'
        },
        {
          id: 4,
          name: 'Långdistans utmaning',
          distance: 15.0,
          duration: 75,
          difficulty: 'Svår',
          terrain: 'Blandat',
          elevation: 280,
          calories: 980,
          description: 'Omfattande runda från Södermalm till Djurgården och tillbaka. För erfarna löpare.',
          highlights: ['Lång distans', 'Varierad miljö', 'Teknisk utmaning'],
          aiReason: 'Förbereder dig för ditt halvmaratonmål',
          coordinates: [
            [59.3165, 18.0686],
            [59.3180, 18.0701],
            [59.3195, 18.0716],
            [59.3210, 18.0731],
            [59.3225, 18.0746]
          ],
          image: '/lopning4.png'
        },
        {
          id: 5,
          name: 'Intervallträning Gröna Lund',
          distance: 6.2,
          duration: 32,
          difficulty: 'Medel',
          terrain: 'Blandat',
          elevation: 95,
          calories: 420,
          description: 'Strukturerad intervallrunda med definierade sektioner för tempowechsel.',
          highlights: ['Intervallmarkeringar', 'Tidtagning', 'Strukturerad'],
          aiReason: 'Perfekt för att utveckla din hastighet och lactattröskel',
          coordinates: [
            [59.3238, 18.0968],
            [59.3253, 18.0983],
            [59.3268, 18.0998],
            [59.3283, 18.0983],
            [59.3298, 18.0968]
          ],
          image: '/lopning5.png'
        },
        {
          id: 6,
          name: 'Solnedgångsrunda Riddarholmen',
          distance: 4.5,
          duration: 28,
          difficulty: 'Lätt',
          terrain: 'Stad',
          elevation: 35,
          calories: 285,
          description: 'Romantisk kvällsrunda med fantastisk utsikt över Gamla Stan och vattnet.',
          highlights: ['Solnedgång', 'Historisk miljö', 'Fotovänlig'],
          aiReason: 'Baserat på dina kvällsträningar och kärleken för vackra vyer',
          coordinates: [
            [59.3245, 18.0635],
            [59.3260, 18.0650],
            [59.3275, 18.0665],
            [59.3290, 18.0650],
            [59.3305, 18.0635]
          ],
          image: '/lopning6.png'
        }
      ];

      setRoutes(generatedRoutes);
    } catch (error) {
      console.error('Error generating routes:', error);
      toast.error('Kunde inte ladda föreslagna rutter');
    } finally {
      setLoading(false);
    }
  };

  const filteredRoutes = routes.filter(route => {
    if (filters.distance !== 'all') {
      const distance = parseFloat(filters.distance);
      if (filters.distance === '5' && route.distance > 5) return false;
      if (filters.distance === '10' && (route.distance <= 5 || route.distance > 10)) return false;
      if (filters.distance === '15' && route.distance <= 10) return false;
    }
    if (filters.difficulty !== 'all' && route.difficulty !== filters.difficulty) return false;
    if (filters.terrain !== 'all' && route.terrain !== filters.terrain) return false;
    return true;
  });

  const startRoute = (route) => {
    toast.success(`Startar rutt: ${route.name}`, {
      icon: '🏃‍♂️',
      duration: 3000
    });
    // Here you would integrate with a GPS tracking service
  };

  const saveRoute = (route) => {
    toast.success('Rutt sparad till favoriter!', {
      icon: '❤️'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Genererar personliga rutter...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <SparklesIcon className="w-8 h-8 text-orange-600 mr-3" />
                Föreslagna rutter
              </h1>
              <p className="mt-2 text-gray-600">
                AI-genererade träningsrutter anpassade efter din profil och mål
              </p>
            </div>
            <button
              onClick={generateRoutes}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center"
            >
              <SparklesIcon className="w-4 h-4 mr-2" />
              Generera nya rutter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtrera rutter</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Distans</label>
              <select
                value={filters.distance}
                onChange={(e) => setFilters({...filters, distance: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Alla distanser</option>
                <option value="5">Under 5 km</option>
                <option value="10">5-10 km</option>
                <option value="15">Över 10 km</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Svårighetsgrad</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Alla nivåer</option>
                <option value="Lätt">Lätt</option>
                <option value="Medel">Medel</option>
                <option value="Svår">Svår</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Terräng</label>
              <select
                value={filters.terrain}
                onChange={(e) => setFilters({...filters, terrain: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All terräng</option>
                <option value="Park">Park</option>
                <option value="Stad">Stad</option>
                <option value="Blandat">Blandat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Routes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRoutes.map((route) => (
            <div key={route.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative">
                <img
                  src={route.image}
                  alt={route.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    route.difficulty === 'Lätt' 
                      ? 'bg-green-100 text-green-800'
                      : route.difficulty === 'Medel'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {route.difficulty}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{route.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{route.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPinIcon className="w-4 h-4 mr-1 text-orange-600" />
                    {route.distance} km
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ClockIcon className="w-4 h-4 mr-1 text-orange-600" />
                    {route.duration} min
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ChartBarIcon className="w-4 h-4 mr-1 text-orange-600" />
                    {route.elevation}m höjd
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FireIcon className="w-4 h-4 mr-1 text-orange-600" />
                    {route.calories} kcal
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {route.highlights.map((highlight, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>

                {/* AI Reason */}
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-xs text-blue-800 flex items-start">
                    <SparklesIcon className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                    {route.aiReason}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => startRoute(route)}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center text-sm font-medium"
                  >
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Starta rutt
                  </button>
                  <button
                    onClick={() => saveRoute(route)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Spara
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredRoutes.length === 0 && (
          <div className="text-center py-12">
            <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Inga rutter matchade dina filter</h3>
            <p className="text-gray-600">Prova att ändra dina filterinställningar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestedRoutesPage; 