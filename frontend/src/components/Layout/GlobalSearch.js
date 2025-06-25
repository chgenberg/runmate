import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MagnifyingGlassIcon, 
  XMarkIcon,
  UserIcon,
  MapPinIcon,
  TrophyIcon,
  CalendarIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const GlobalSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const performSearch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/search/global?q=${encodeURIComponent(query)}`);
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      // Fallback results for demo
      setResults({
        users: [
          { id: 1, name: 'Anna Andersson', username: 'anna_runner', level: 'Avancerad' },
          { id: 2, name: 'Erik Eriksson', username: 'erik_speed', level: 'Medel' }
        ],
        routes: [
          { id: 1, name: 'Morgonrunda Djurgården', distance: 5.2, difficulty: 'Lätt' },
          { id: 2, name: 'Intervaller Haga', distance: 8.0, difficulty: 'Medel' }
        ],
        challenges: [
          { id: 1, name: 'Veckans utmaning', type: 'Distans', participants: 45 },
          { id: 2, name: 'Månadens maraton', type: 'Tid', participants: 120 }
        ],
        events: [
          { id: 1, name: 'Stockholm Marathon', date: '2024-06-01', participants: 1500 },
          { id: 2, name: 'Midnattsloppet', date: '2024-08-15', participants: 800 }
        ]
      });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length > 1) {
        performSearch();
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleResultClick = (type, item) => {
    // Save to recent searches
    const newSearch = { query, timestamp: Date.now() };
    const updated = [newSearch, ...recentSearches.filter(s => s.query !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));

    // Navigate based on type
    switch (type) {
      case 'user':
        navigate(`/app/profile/${item.id}`);
        break;
      case 'route':
        navigate(`/app/suggested-routes?highlight=${item.id}`);
        break;
      case 'challenge':
        navigate(`/app/challenges/${item.id}`);
        break;
      case 'event':
        navigate(`/app/events/${item.id}`);
        break;
      default:
        break;
    }

    if (onClose) onClose();
  };

  const quickActions = [
    { icon: MapPinIcon, label: 'Hitta rutter nära mig', action: () => navigate('/app/suggested-routes') },
    { icon: UserIcon, label: 'Sök löpare', action: () => navigate('/app/discover') },
    { icon: TrophyIcon, label: 'Aktiva utmaningar', action: () => navigate('/app/challenges') },
    { icon: SparklesIcon, label: 'AI Coach', action: () => navigate('/app/ai-coach') }
  ];

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={searchRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sök på allt - löpare, rutter, utmaningar..."
          className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {(results || recentSearches.length > 0 || query === '') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
          >
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Söker...</p>
              </div>
            ) : results ? (
              <div>
                {/* Users */}
                {results.users?.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Löpare</h3>
                    {results.users.map((user) => (
                      <motion.button
                        key={user.id}
                        onClick={() => handleResultClick('user', user)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">@{user.username} • {user.level}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Routes */}
                {results.routes?.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rutter</h3>
                    {results.routes.map((route) => (
                      <motion.button
                        key={route.id}
                        onClick={() => handleResultClick('route', route)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <MapPinIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{route.name}</p>
                          <p className="text-sm text-gray-500">{route.distance} km • {route.difficulty}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Challenges */}
                {results.challenges?.length > 0 && (
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Utmaningar</h3>
                    {results.challenges.map((challenge) => (
                      <motion.button
                        key={challenge.id}
                        onClick={() => handleResultClick('challenge', challenge)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <TrophyIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{challenge.name}</p>
                          <p className="text-sm text-gray-500">{challenge.type} • {challenge.participants} deltagare</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}

                {/* Events */}
                {results.events?.length > 0 && (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Event</h3>
                    {results.events.map((event) => (
                      <motion.button
                        key={event.id}
                        onClick={() => handleResultClick('event', event)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">{event.name}</p>
                          <p className="text-sm text-gray-500">{event.date} • {event.participants} anmälda</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Senaste sökningar</h3>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search.query)}
                          className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <ClockIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{search.query}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Snabblänkar</h3>
                  <div className="space-y-1">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        onClick={action.action}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        whileHover={{ x: 4 }}
                      >
                        <action.icon className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-700">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalSearch; 