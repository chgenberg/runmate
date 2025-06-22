import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, PlusCircle, Search, Compass, Sparkles, TrendingUp } from 'lucide-react';
import api from '../../services/api';
import RunEventCard from '../../components/RunEvents/RunEventCard';
import toast from 'react-hot-toast';
import FilterPanel from '../../components/Discover/FilterPanel';

const Header = ({ eventCount }) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative overflow-hidden bg-gradient-to-br from-red-500 via-pink-500 to-purple-600 rounded-3xl p-8 mb-8 shadow-2xl"
  >
    <div className="absolute inset-0 bg-black opacity-10"></div>
    <div className="absolute -top-24 -right-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
    
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="text-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
            <Compass className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black">Upptäck löprundor</h1>
        </div>
        <p className="text-xl text-white/90 max-w-2xl">
          Hitta din nästa löpupplevelse och träffa likasinnade löpare i ditt område.
        </p>
        <div className="flex items-center gap-6 mt-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <span className="font-semibold">{eventCount} aktiva event</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-300" />
            <span className="font-semibold">Växande community</span>
          </div>
        </div>
      </div>
      
      <Link to="/app/runevents/create">
        <motion.button 
          className="group flex items-center gap-3 bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transform transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="p-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl text-white group-hover:scale-110 transition-transform">
            <PlusCircle className="w-6 h-6" />
          </div>
          <span className="text-lg">Skapa ny runda</span>
        </motion.button>
      </Link>
    </div>
  </motion.div>
);

const FilterBar = ({ searchTerm, setSearchTerm, onFilterClick }) => (
  <motion.div 
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-3xl p-2 mb-8 shadow-lg border border-gray-100"
  >
    <div className="flex items-center gap-3">
      <div className="relative flex-grow">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text"
          placeholder="Sök på plats, titel eller värd..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-50 rounded-2xl pl-14 pr-6 py-4 text-lg font-medium placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-transparent transition-all"
        />
      </div>
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onFilterClick}
        className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-900 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
      >
        <Filter className="w-5 h-5" />
        <span>Filtrera</span>
      </motion.button>
    </div>
  </motion.div>
);

const DiscoverPage = () => {
  const [runEvents, setRunEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    distance: [0, 50], // km
    pace: [180, 600], // seconds per km (3:00/km to 10:00/km)
    search: '',
    // A more complete filter state
    maxDistance: 50,
    minCompatibility: 0.3,
    ageRange: '18-99',
    activityLevel: '',
    sportTypes: ''
  });

  const handleApplyFilters = (newFilters) => {
    setFilters(prev => ({...prev, ...newFilters}));
    // TODO: Actually apply these filters to the runEvents list
    console.log('Applied new filters: ', newFilters);
    setShowFilterPanel(false);
  };

  const fetchRunEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/runevents');
      if (response.data.success) {
        setRunEvents(response.data.data);
      } else {
        setRunEvents([]);
        setError('Kunde inte hämta löpevent.');
      }
    } catch (err) {
      setError('Ett fel uppstod. Försök igen senare.');
      console.error(err);
      toast.error('Kunde inte ladda event. Se konsolen för mer info.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRunEvents();
  }, [fetchRunEvents]);

  const filteredEvents = runEvents.filter(event => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return event.title.toLowerCase().includes(search) || 
             event.location.name.toLowerCase().includes(search);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <Header eventCount={runEvents.length} />
        
        <FilterBar 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm}
          onFilterClick={() => setShowFilterPanel(!showFilterPanel)} 
        />
        
        <AnimatePresence>
          {showFilterPanel && (
            <FilterPanel
              initialFilters={filters}
              onApply={handleApplyFilters}
              onClose={() => setShowFilterPanel(false)}
            />
          )}
        </AnimatePresence>

        {renderContent()}

      </div>
    </div>
  );

  function renderContent() {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[...Array(4)].map((_, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl p-6 shadow-lg animate-pulse"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="h-4 bg-gray-200 rounded-xl w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded-xl w-48"></div>
                </div>
                <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded-xl w-full"></div>
                <div className="h-4 bg-gray-200 rounded-xl w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded-xl w-4/6"></div>
              </div>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <div className="h-4 bg-gray-200 rounded-xl w-24"></div>
                <div className="h-10 bg-gray-200 rounded-xl w-28"></div>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-12 bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl border border-red-200"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Compass className="w-10 h-10 text-red-500" />
          </div>
          <p className="text-xl font-bold text-red-600 mb-4">{error}</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchRunEvents} 
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold rounded-2xl hover:shadow-lg transition-all"
          >
            Försök igen
          </motion.button>
        </motion.div>
      );
    }
    
    if (filteredEvents.length === 0) {
      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 px-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <Compass className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          </motion.div>
          <h3 className="text-3xl font-black text-gray-800 mb-3">Inga löprundor hittades</h3>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm ? 'Prova att söka på något annat.' : 'Bli först med att skapa en löprunda i ditt område!'}
          </p>
          <Link to="/app/runevents/create">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all"
            >
              <PlusCircle className="w-6 h-6" />
              <span className="text-lg">Skapa första rundan</span>
            </motion.button>
          </Link>
        </motion.div>
      );
    }

    return (
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        <AnimatePresence>
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
            >
              <RunEventCard event={event} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    );
  }
};

export default DiscoverPage; 