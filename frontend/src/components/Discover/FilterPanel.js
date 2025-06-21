import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';



const FilterPanel = ({ initialFilters, onApply, onClose }) => {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [ageRange, setAgeRange] = useState(filters.ageRange.split('-').map(Number));

  // This effect would load saved filters from user profile
  useEffect(() => {
    if (user?.searchPreferences) {
      setFilters({
        paceRange: user.searchPreferences.paceRange || [240, 480],
        distanceRange: user.searchPreferences.distanceRange || [5, 50],
        ageRange: user.searchPreferences.ageRange || [18, 65],
        maxDistance: user.searchPreferences.maxDistance || 25,
        preferredRunTypes: user.searchPreferences.preferredRunTypes || [],
        minCompatibility: user.searchPreferences.minCompatibility || 0.5,
        activityLevel: user.searchPreferences.activityLevel || 'recreational',
        sportTypes: user.searchPreferences.sportTypes || '',
      });
    }
  }, [user]);


  
  const handleApply = () => {
    onApply({
      ...filters,
      ageRange: `${ageRange[0]}-${ageRange[1]}`,
      sportTypes: (filters.sportTypes || '').split(',').filter(Boolean).join(','),
    });
  };

  const handleReset = () => {
    const defaultFilters = {
      maxDistance: 50,
      minCompatibility: 0.3,
      ageRange: '18-99',
      activityLevel: '',
      sportTypes: ''
    };
    setFilters(defaultFilters);
    setAgeRange(defaultFilters.ageRange.split('-').map(Number));
    onApply(defaultFilters);
  };

  const handleSportTypeChange = (sport) => {
    const currentTypes = filters.sportTypes ? filters.sportTypes.split(',') : [];
    const newTypes = currentTypes.includes(sport)
      ? currentTypes.filter(s => s !== sport)
      : [...currentTypes, sport];
    setFilters({ ...filters, sportTypes: newTypes.join(',') });
  };
  
  const handleActivityLevelChange = (level) => {
    setFilters({ ...filters, activityLevel: level });
  };
  
  const sportTypes = ['running', 'cycling', 'walking', 'hiking', 'swimming', 'gym'];
  const activityLevels = ['beginner', 'recreational', 'serious', 'competitive'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white rounded-t-2xl w-full max-w-lg h-full max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Filter</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800">
            <X />
          </button>
        </header>

        <div className="flex-1 p-6 overflow-y-auto space-y-8">
          {/* Distance */}
          <div>
            <label className="block font-semibold mb-2">Maxavstånd: {filters.maxDistance} km</label>
            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={filters.maxDistance}
              onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Compatibility */}
          <div>
            <label className="block font-semibold mb-2">Minsta kompatibilitet: {Math.round(filters.minCompatibility * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={filters.minCompatibility}
              onChange={(e) => setFilters({ ...filters, minCompatibility: e.target.value })}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Age Range */}
          <div>
            <label className="block font-semibold mb-2">Åldersintervall: {ageRange[0]} - {ageRange[1]} år</label>
            {/* Simple inputs for now, could be a two-thumb slider */}
            <div className="flex items-center space-x-4">
              <input 
                type="number"
                value={ageRange[0]}
                onChange={e => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                className="w-full p-2 border rounded-md"
              />
              <span className="text-gray-500">-</span>
              <input 
                type="number"
                value={ageRange[1]}
                onChange={e => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block font-semibold mb-2">Aktivitetsnivå</label>
            <div className="flex flex-wrap gap-2">
              {activityLevels.map(level => (
                <button
                  key={level}
                  onClick={() => handleActivityLevelChange(level)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filters.activityLevel === level
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Sport Types */}
          <div>
            <label className="block font-semibold mb-2">Sporter</label>
            <div className="flex flex-wrap gap-2">
              {sportTypes.map(sport => (
                <button
                  key={sport}
                  onClick={() => handleSportTypeChange(sport)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    (filters.sportTypes || '').includes(sport)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sport.charAt(0).toUpperCase() + sport.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="p-4 border-t bg-white flex space-x-4">
          <button 
            onClick={handleReset}
            className="w-full bg-gray-200 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Återställ
          </button>
          <button 
            onClick={handleApply}
            className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-colors"
          >
            Applicera Filter
          </button>
        </footer>
      </motion.div>
    </motion.div>
  );
};

export default FilterPanel; 