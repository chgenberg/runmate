import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Filter, 
  Plus, 
  Search, 
  MapPin, 
  Calendar,
  Users,
  Heart,
  TrendingUp,
  Sparkles,
  X,
  ChevronRight
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import FilterPanel from '../../components/Discover/FilterPanel';
import { LoadingSpinnerFullScreen } from '../../components/Layout/LoadingSpinner';

const DiscoverPage = () => {
  const [runEvents, setRunEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filters, setFilters] = useState({
    distance: [0, 50],
    pace: [180, 600],
    maxDistance: 50,
    minCompatibility: 0.3,
    ageRange: '18-99',
    activityLevel: '',
    sportTypes: ''
  });

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
      toast.error('Kunde inte ladda event.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRunEvents();
  }, [fetchRunEvents]);

  const handleApplyFilters = (newFilters) => {
    setFilters(prev => ({...prev, ...newFilters}));
    setShowFilterPanel(false);
  };

  const filteredEvents = runEvents.filter(event => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return event.title.toLowerCase().includes(search) || 
             event.location.name.toLowerCase().includes(search) ||
             event.host?.name?.toLowerCase().includes(search);
    }
    return true;
  });

  if (isLoading) {
    return <LoadingSpinnerFullScreen message="Laddar löprundor..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold gradient-text">Upptäck</h1>
            <Link to="/app/runevents/create">
              <button className="btn btn-primary btn-sm group">
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Skapa event</span>
                <span className="sm:hidden">Ny</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="px-4 pt-4">
        <div className="bg-gradient-primary rounded-2xl p-4 shadow-lg animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <div className="flex items-center space-x-2 mb-1">
                <MapPin className="w-5 h-5" />
                <h2 className="font-semibold">Löprundor nära dig</h2>
              </div>
              <p className="text-sm text-white/80">
                Hitta din nästa löpupplevelse
              </p>
            </div>
            <div className="flex flex-col items-end text-white">
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span className="text-2xl font-bold">{runEvents.length}</span>
              </div>
              <span className="text-xs text-white/80">aktiva event</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-4 py-4 space-y-3">
        <div className="relative animate-slide-up animation-delay-200">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Sök på plats, titel eller värd..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilterPanel(!showFilterPanel)}
          className="w-full btn btn-glass flex items-center justify-center animate-slide-up animation-delay-300"
        >
          <Filter className="w-5 h-5 mr-2" />
          Filtrera resultat
        </button>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slide-left">
            <FilterPanel
              initialFilters={filters}
              onApply={handleApplyFilters}
              onClose={() => setShowFilterPanel(false)}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-20 md:pb-8">
        {error ? (
          <div className="mt-8 text-center animate-slide-up">
            <div className="bg-red-50 rounded-2xl p-8 border border-red-200">
              <MapPin className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-4">{error}</p>
              <button 
                onClick={fetchRunEvents}
                className="btn btn-primary"
              >
                Försök igen
              </button>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="mt-8 text-center animate-slide-up">
            <div className="bg-gray-50 rounded-2xl p-8">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Inga löprundor hittades
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? 'Prova att söka på något annat.' : 'Bli först med att skapa en löprunda!'}
              </p>
              <Link to="/app/runevents/create">
                <button className="btn btn-primary">
                  <Plus className="w-5 h-5 mr-2" />
                  Skapa första rundan
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {filteredEvents.map((event, index) => (
              <RunEventCard 
                key={event._id} 
                event={event} 
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Updated RunEventCard component with new design
const RunEventCard = ({ event, index }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('sv-SE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-700',
      medium: 'bg-yellow-100 text-yellow-700',
      hard: 'bg-red-100 text-red-700'
    };
    return colors[difficulty] || colors.medium;
  };

  const getDifficultyText = (difficulty) => {
    const texts = {
      easy: 'Lätt',
      medium: 'Medel',
      hard: 'Svår'
    };
    return texts[difficulty] || 'Medel';
  };

  return (
    <Link to={`/app/runevents/${event._id}`}>
      <div 
        className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-[1.02] overflow-hidden animate-slide-up"
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Image or Map Preview */}
        <div className="relative h-48 bg-gradient-to-br from-primary-100 to-secondary-100">
          {event.imageUrl ? (
            <img 
              src={event.imageUrl} 
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="w-16 h-16 text-primary-300" />
            </div>
          )}
          
          {/* Difficulty Badge */}
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(event.difficulty)}`}>
              {getDifficultyText(event.difficulty)}
            </span>
          </div>

          {/* Participants Count */}
          <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span className="text-sm font-medium">
              {event.participants?.length || 0}/{event.maxParticipants || '∞'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title and Host */}
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{event.title}</h3>
            <p className="text-sm text-gray-600 flex items-center">
              <Heart className="w-4 h-4 mr-1 text-primary-500" />
              Arrangeras av {event.host?.name || 'Okänd'}
            </p>
          </div>

          {/* Event Details */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {event.location.name}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 mr-2 text-gray-400" />
              {event.distance} km • Tempo: {event.pace}
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {event.description}
            </p>
          )}

          {/* Action */}
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {event.participants?.slice(0, 3).map((participant, i) => (
                <img
                  key={i}
                  src={`https://ui-avatars.com/api/?name=${participant.name}&background=6366f1&color=fff`}
                  alt={participant.name}
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              ))}
              {event.participants?.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{event.participants.length - 3}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center text-primary-600 font-medium">
              <span className="text-sm">Se detaljer</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DiscoverPage; 