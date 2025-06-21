import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'use-debounce';
import { 
  Search, 
  X, 
  User, 
  Activity, 
  Trophy, 
  Hash,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 300);
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => {
    setQuery('');
    setIsOpen(false);
  };

  useEffect(() => {
    // Keyboard shortcut to open search (Cmd+K or Ctrl+K)
    const handleKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (event.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const fetchResults = useCallback(async () => {
    if (debouncedQuery.trim().length < 2) {
      setResults(null);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.get(`/search?q=${debouncedQuery}`);
      setResults(response.data.data);
    } catch (error) {
      console.error('Search failed:', error);
      setResults(null); // Clear results on error
    } finally {
      setIsLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleNavigation = (path) => {
    navigate(path);
    closeSearch();
  };
  
  const ResultItem = ({ icon: Icon, text, subtext, path, color }) => (
    <motion.li
      whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.05)' }}
      onClick={() => handleNavigation(path)}
      className="flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer"
    >
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color} text-white`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="font-semibold text-gray-800">{text}</p>
        {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
    </motion.li>
  );

  return (
    <>
      <button 
        onClick={openSearch}
        className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
      >
        <Search className="w-4 h-4" />
        Sök...
        <span className="ml-2 text-xs border border-gray-300 rounded px-1.5 py-0.5">⌘K</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50 backdrop-blur-sm"
            onClick={closeSearch}
          >
            <motion.div
              initial={{ scale: 0.95, y: -20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: -20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="relative p-4 border-b border-gray-100">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Sök efter löpare, events, utmaningar..."
                  className="w-full bg-transparent pl-10 pr-4 py-2 text-lg text-gray-800 focus:outline-none"
                />
                <button
                  onClick={closeSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Results */}
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {isLoading && (
                  <div className="flex items-center justify-center p-6">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-6 h-6 border-2 border-t-red-500 border-gray-200 rounded-full"
                    />
                    <p className="ml-2 text-gray-600">Söker...</p>
                  </div>
                )}
                
                {!isLoading && debouncedQuery && results && (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {results.users?.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">Löpare</h3>
                          <ul>
                            {results.users.map(u => 
                              <ResultItem 
                                key={u._id} 
                                icon={User}
                                text={`${u.firstName} ${u.lastName}`}
                                path={`/app/profile/${u._id}`}
                                color="from-blue-400 to-blue-500"
                              />
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {results.events?.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">Events</h3>
                          <ul>
                            {results.events.map(e => 
                              <ResultItem 
                                key={e._id} 
                                icon={Activity}
                                text={e.title}
                                subtext={e.location.name}
                                path={`/app/runevents/${e._id}`}
                                color="from-red-400 to-red-500"
                              />
                            )}
                          </ul>
                        </div>
                      )}
                      
                      {results.challenges?.length > 0 && (
                        <div className="mb-4">
                          <h3 className="text-xs font-semibold text-gray-400 uppercase px-4 mb-2">Utmaningar</h3>
                          <ul>
                            {results.challenges.map(c => 
                              <ResultItem 
                                key={c._id} 
                                icon={Trophy}
                                text={c.title}
                                path={`/app/challenges/${c._id}`}
                                color="from-yellow-400 to-yellow-500"
                              />
                            )}
                          </ul>
                        </div>
                      )}

                      {results.users?.length === 0 && results.events?.length === 0 && results.challenges?.length === 0 && (
                        <div className="text-center p-8">
                          <p className="font-semibold text-gray-700">Inga resultat hittades för "{query}"</p>
                          <p className="text-sm text-gray-500 mt-1">Försök med en annan sökterm.</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}

                {!debouncedQuery && !isLoading && (
                   <div className="text-center p-8">
                    <p className="font-semibold text-gray-700">Börja skriva för att söka</p>
                    <p className="text-sm text-gray-500 mt-1">Hitta allt på ett ställe.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GlobalSearch; 