import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Map,
  Clock,
  Zap,
  Mountain,
  TrendingUp,
  ChevronLeft,
  Edit,
  Trash2,
  Heart,
  MessageSquare,
  Share2,
  Award,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import RouteMap from '../../components/Activity/RouteMap';

const formatPace = (secondsPerKm) => {
  if (!secondsPerKm) return 'N/A';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return [
    hours > 0 ? `${hours}h` : '',
    minutes > 0 ? `${minutes}m` : '',
    secs > 0 ? `${secs}s` : ''
  ].filter(Boolean).join(' ');
};

const StatDisplay = ({ icon: Icon, value, label, unit }) => (
    <div className="flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-lg">
        <Icon className="w-8 h-8 text-indigo-600 mb-2"/>
        <p className="text-2xl font-bold text-gray-900">{value}{unit && <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>}</p>
        <p className="text-sm text-gray-600">{label}</p>
    </div>
);

const ActivityPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/activities/${id}`);
        setActivity(response.data);
      } catch (err) {
        setError("Kunde inte ladda aktiviteten. Den kanske har tagits bort eller så har du inte behörighet att se den.");
        toast.error("Kunde inte ladda aktiviteten.");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Är du säker på att du vill radera denna aktivitet? Detta kan inte ångras.')) {
        try {
            await api.delete(`/activities/${id}`);
            toast.success('Aktiviteten har raderats.');
            navigate('/app/activities');
        } catch (err) {
            toast.error('Kunde inte radera aktiviteten.');
        }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center p-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Ett fel uppstod</h2>
        <p className="text-gray-600 mb-6 max-w-md">{error}</p>
        <Link to="/app/activities" className="btn btn-primary">
          Tillbaka till Mina Aktiviteter
        </Link>
      </div>
    );
  }

  if (!activity) {
    return null; // Should be handled by error state
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto p-4">
              <div className="flex justify-between items-center">
                  <Link to="/app/activities" className="flex items-center text-indigo-600 hover:text-indigo-800">
                      <ChevronLeft className="w-5 h-5"/>
                      <span className="ml-1 font-medium">Tillbaka till Aktiviteter</span>
                  </Link>
                  <div className="flex items-center space-x-2">
                      <button className="btn btn-sm btn-outline"><Edit className="w-4 h-4 mr-1"/> Redigera</button>
                      <button onClick={handleDelete} className="btn btn-sm btn-danger-outline"><Trash2 className="w-4 h-4 mr-1"/> Radera</button>
                  </div>
              </div>
          </div>
      </div>
      
      <main className="max-w-5xl mx-auto mt-6 px-4">
        {/* Activity Header */}
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
            <p className="text-gray-600 mt-1">{new Date(activity.startTime).toLocaleDateString('sv-SE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Map & Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Photos */}
            {activity.photos && activity.photos.length > 0 && (
                <div className="card">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4">
                        {activity.photos.map((photo, index) => (
                            <img key={index} src={`http://localhost:8000/${photo}`} alt={`Aktivitetsbild ${index + 1}`} className="rounded-lg object-cover w-full h-40" />
                        ))}
                    </div>
                </div>
            )}
            
            {/* GPS Route Map */}
            {activity.route && activity.route.length > 0 ? (
                <div className="card p-4">
                    <h3 className="font-bold text-lg mb-4 flex items-center">
                        <Map className="w-5 h-5 mr-2" />
                        GPS-rutt
                    </h3>
                    <RouteMap 
                        route={activity.route} 
                        startLocation={activity.startLocation}
                        className="w-full h-80"
                    />
                    <div className="mt-3 text-sm text-gray-600">
                        Spårad med {activity.source === 'app' ? 'RunMate GPS' : activity.source || 'GPS'}
                    </div>
                </div>
            ) : (
                <div className="card h-96 flex items-center justify-center">
                    <div className="text-center">
                        <Map className="w-16 h-16 text-gray-300 mx-auto"/>
                        <p className="mt-4 text-gray-500">Ingen GPS-rutt tillgänglig</p>
                        <p className="text-sm text-gray-400">Använd GPS-spårning för att se din rutt på kartan</p>
                    </div>
                </div>
            )}
            
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatDisplay icon={TrendingUp} value={activity.distance.toFixed(2)} label="Distans" unit="km" />
                <StatDisplay icon={Clock} value={formatDuration(activity.duration)} label="Tid" />
                <StatDisplay icon={Zap} value={formatPace(activity.averagePace)} label="Snittfart" unit="/km" />
                <StatDisplay icon={Mountain} value={activity.elevationGain || 0} label="Höjdmeter" unit="m" />
            </div>

            {/* Description */}
            {activity.description && (
                <div className="card p-4">
                    <h3 className="font-bold text-lg mb-2">Beskrivning</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{activity.description}</p>
                </div>
            )}

            {/* Splits Table (if available) */}
            {activity.splits && activity.splits.length > 0 && (
                <div className="card">
                    <h3 className="card-title p-4">Mellantider</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-xs text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3">Km</th>
                                    <th className="px-6 py-3">Tid</th>
                                    <th className="px-6 py-3">Fart (/km)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {activity.splits.map((split, index) => (
                                    <tr key={index} className="bg-white border-b">
                                        <td className="px-6 py-4 font-medium text-gray-900">{split.distance || index + 1}</td>
                                        <td className="px-6 py-4">{formatDuration(split.time)}</td>
                                        <td className="px-6 py-4">{formatPace(split.pace)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
          </div>

          {/* Right Column: Social & Details */}
          <div className="space-y-6">
            {/* Personal Records */}
            {activity.personalRecords && activity.personalRecords.length > 0 && (
                <div className="card p-4">
                    <h3 className="font-bold text-lg mb-3">Personliga Rekord</h3>
                    <div className="space-y-3">
                        {activity.personalRecords.map((pr, index) => (
                            <div key={index} className="flex items-center">
                                <Award className={`w-6 h-6 mr-3 ${pr.isNew ? 'text-yellow-500' : 'text-gray-400'}`} />
                                <div>
                                    <p className="font-semibold">{pr.type}</p>
                                    <p className="text-sm text-gray-600">{pr.value}</p>
                                </div>
                                {pr.isNew && <span className="ml-auto text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">NYTT!</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Social Actions */}
            <div className="card p-4 flex justify-around items-center">
                <button className="flex flex-col items-center text-gray-600 hover:text-red-500 transition-colors">
                    <Heart className="w-6 h-6 mb-1" />
                    <span className="text-sm font-medium">Kudos ({activity.kudos ? activity.kudos.length : 0})</span>
                </button>
                <button className="flex flex-col items-center text-gray-600 hover:text-indigo-600 transition-colors">
                    <MessageSquare className="w-6 h-6 mb-1" />
                    <span className="text-sm font-medium">Kommentera</span>
                </button>
                <button className="flex flex-col items-center text-gray-600 hover:text-blue-600 transition-colors">
                    <Share2 className="w-6 h-6 mb-1" />
                    <span className="text-sm font-medium">Dela</span>
                </button>
            </div>
            
            {/* Comments */}
            {activity.comments && activity.comments.length > 0 && (
                <div className="card p-4">
                    <h3 className="font-bold text-lg mb-4">Kommentarer ({activity.comments.length})</h3>
                    <div className="space-y-4">
                        {activity.comments.map((comment) => (
                            <div key={comment.id} className="flex items-start">
                                <img src={comment.user.photo} alt={comment.user.name} className="w-8 h-8 rounded-full mr-3" />
                                <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                    <p className="font-semibold text-sm">{comment.user.name}</p>
                                    <p className="text-sm text-gray-800">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ActivityPage; 