import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  User, 
  MapPin, 
  Activity,
  Settings,
  Save,
  X,
  Plus,
  Edit3,
  Target,
  Clock,
  Trash2,
  Star
} from 'lucide-react';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';
import UserRatingProfile from '../../components/Rating/UserRatingProfile';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    age: '',
    location: '',
    sports: [],
    activityLevel: '',
    preferredTimes: [],
    goals: ''
  });

  const [photos, setPhotos] = useState([
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop&auto=format'
  ]);

  const sportsOptions = [
    { id: 'running', name: 'Löpning', icon: '🏃‍♂️' },
  ];

  const activityLevels = [
    { id: 'beginner', name: 'Nybörjare', desc: '1-2 gånger per vecka' },
    { id: 'intermediate', name: 'Medel', desc: '3-4 gånger per vecka' },
    { id: 'advanced', name: 'Avancerad', desc: '5+ gånger per vecka' },
    { id: 'athlete', name: 'Atlet', desc: 'Daglig träning' }
  ];

  const timeOptions = [
    { id: 'morning', name: 'Morgon', time: '06:00-09:00' },
    { id: 'lunch', name: 'Lunch', time: '11:00-14:00' },
    { id: 'afternoon', name: 'Eftermiddag', time: '15:00-18:00' },
    { id: 'evening', name: 'Kväll', time: '18:00-21:00' }
  ];

  useEffect(() => {
    // Load user data
    const userData = {
      firstName: 'Christopher',
      lastName: 'Genberg',
      bio: 'Löpare från Stockholm som älskar att utforska nya rutter och träffa nya träningspartners!',
      age: '28',
      location: 'Stockholm, Sverige',
      sports: ['running'],
      activityLevel: 'intermediate',
      preferredTimes: ['morning', 'evening'],
      goals: 'Springa mitt första maraton inom 6 månader'
    };
    setUser(userData);
    setProfileData(userData);
  }, []);

  const handleSave = () => {
    setUser(profileData);
    setEditing(false);
    // Save to backend
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos([...photos, e.target.result]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const toggleSport = (sportId) => {
    if (sportId === 'running') {
      const newSports = profileData.sports.includes('running') ? [] : ['running'];
      setProfileData({ ...profileData, sports: newSports });
    }
  };

  const toggleTime = (timeId) => {
    const newTimes = profileData.preferredTimes.includes(timeId)
      ? profileData.preferredTimes.filter(t => t !== timeId)
      : [...profileData.preferredTimes, timeId];
    setProfileData({ ...profileData, preferredTimes: newTimes });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner 
          variant="pulse" 
          size="xl" 
          text="Laddar din profil..." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-responsive">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Min Profil</h1>
              <p className="text-gray-600">Hantera din profil och inställningar</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="btn btn-outline"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Avbryt
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Spara
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="btn btn-primary"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Redigera
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 space-y-4">
              <div className="text-center">
                <img
                  src={photos[0] || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&auto=format'}
                  alt="Profile"
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-primary-100"
                />
                <h3 className="mt-3 font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600">{user.location}</p>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'basic' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Grundläggande
                </button>
                <button
                  onClick={() => setActiveTab('photos')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'photos' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Camera className="w-4 h-4 inline mr-2" />
                  Foton
                </button>
                <button
                  onClick={() => setActiveTab('ratings')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'ratings' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-4 h-4 inline mr-2" />
                  Betyg & Recensioner
                </button>
                <button
                  onClick={() => setActiveTab('sports')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'sports' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Activity className="w-4 h-4 inline mr-2" />
                  Träning
                </button>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    activeTab === 'preferences' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Inställningar
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'basic' && (
              <div className="card p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Grundläggande information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Förnamn
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!editing}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Efternamn
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!editing}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ålder
                    </label>
                    <input
                      type="number"
                      value={profileData.age}
                      onChange={(e) => setProfileData({ ...profileData, age: e.target.value })}
                      disabled={!editing}
                      className="input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Plats
                    </label>
                    <input
                      type="text"
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      disabled={!editing}
                      className="input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Om mig
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    disabled={!editing}
                    rows={4}
                    className="input"
                    placeholder="Berätta lite om dig själv..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-1" />
                    Tränings mål
                  </label>
                  <textarea
                    value={profileData.goals}
                    onChange={(e) => setProfileData({ ...profileData, goals: e.target.value })}
                    disabled={!editing}
                    rows={3}
                    className="input"
                    placeholder="Vad vill du uppnå med din träning?"
                  />
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Mina foton</h2>
                  <p className="text-sm text-gray-600">Max 6 foton</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={photo}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {editing && (
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 bg-primary-500 text-white px-2 py-1 rounded text-xs">
                          Huvudfoto
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {editing && photos.length < 6 && (
                    <label className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                      <Plus className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Lägg till foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ratings' && (
              <UserRatingProfile userId={user.id || '6854fe50b7a8e3befa884139'} />
            )}

            {activeTab === 'sports' && (
              <div className="card p-6 space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Träningsintresse</h2>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800">Vilka sporter utövar du?</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {sportsOptions.map((sport) => (
                      <button
                        key={sport.id}
                        onClick={() => toggleSport(sport.id)}
                        disabled={sport.id !== 'running'}
                        className={`p-4 border rounded-lg text-center transition-all ${
                          profileData.sports.includes(sport.id)
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500'
                            : 'border-gray-300 hover:border-primary-400'
                        } ${sport.id !== 'running' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-2xl">{sport.icon}</span>
                        <p className="font-medium mt-1">{sport.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Aktivitetsnivå
                  </label>
                  <div className="space-y-3">
                    {activityLevels.map((level) => (
                      <label
                        key={level.id}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                          profileData.activityLevel === level.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="activityLevel"
                          value={level.id}
                          checked={profileData.activityLevel === level.id}
                          onChange={(e) => setProfileData({ ...profileData, activityLevel: e.target.value })}
                          disabled={!editing}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">{level.name}</div>
                          <div className="text-sm text-gray-600">{level.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Föredragna träningstider
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {timeOptions.map((time) => (
                      <label
                        key={time.id}
                        className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                          profileData.preferredTimes.includes(time.id)
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={profileData.preferredTimes.includes(time.id)}
                          onChange={() => editing && toggleTime(time.id)}
                          disabled={!editing}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">{time.name}</div>
                          <div className="text-sm text-gray-600">{time.time}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-6">
                <div className="card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Sökpreferenser</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Åldersintervall
                      </label>
                      <div className="flex items-center space-x-4">
                        <input type="number" placeholder="Min ålder" className="input flex-1" />
                        <span>-</span>
                        <input type="number" placeholder="Max ålder" className="input flex-1" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sökradie
                      </label>
                      <select className="input">
                        <option>5 km</option>
                        <option>10 km</option>
                        <option>25 km</option>
                        <option>50 km</option>
                        <option>Inga begränsningar</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Notifikationer</h2>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between">
                      <span>Nya matches</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Meddelanden</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span>Träningspåminnelser</span>
                      <input type="checkbox" defaultChecked className="toggle" />
                    </label>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Konto</h2>
                  <div className="space-y-4">
                    <button className="btn btn-outline w-full">
                      Ändra lösenord
                    </button>
                    <button className="btn btn-outline w-full text-red-600 border-red-300 hover:bg-red-50">
                      Radera konto
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 