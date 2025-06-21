import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, Hash, Zap, PlusCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import LocationPickerMap from '../../components/Activity/LocationPickerMap';

const CreateRunEventPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    locationName: '',
    distance: '',
    pace: '', // Will be stored as seconds per km
    date: '',
    time: '',
    maxParticipants: 4,
  });
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (latlng) => {
    setLocation(latlng);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!location) {
        toast.error('Välj en startplats på kartan.');
        return;
    }

    setIsLoading(true);
    
    // Convert pace from min:ss/km to seconds/km
    const paceParts = formData.pace.split(':');
    const paceInSeconds = paceParts.length === 2 ? parseInt(paceParts[0], 10) * 60 + parseInt(paceParts[1], 10) : 0;

    const eventData = {
      title: formData.title,
      description: formData.description,
      location: { 
          name: formData.locationName,
          point: {
              type: 'Point',
              coordinates: [location.lng, location.lat] // GeoJSON format: [longitude, latitude]
          }
      },
      distance: Number(formData.distance),
      pace: paceInSeconds,
      date: `${formData.date}T${formData.time}:00`,
      maxParticipants: Number(formData.maxParticipants),
    };
    
    try {
        const { data } = await api.post('/runevents', eventData);
        if (data.success) {
            toast.success('Löpevent har skapats!');
            navigate(`/app/runevents/${data.data._id}`);
        } else {
            toast.error(data.message || 'Ett oväntat fel uppstod.');
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'Kunde inte skapa eventet.');
    } finally {
        setIsLoading(false);
    }
  };

  const InputField = ({ icon: Icon, label, name, type, value, onChange, placeholder, required = true }) => (
    <div className="space-y-2">
      <label htmlFor={name} className="flex items-center gap-2 font-semibold text-gray-700">
        <Icon className="w-5 h-5 text-gray-400" />
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-red-500 focus:bg-white focus:ring-0 transition-all"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 font-semibold hover:text-red-500 transition mb-6">
          <ArrowLeft className="w-5 h-5" />
          Tillbaka
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-gray-900">Skapa en löprunda</h1>
            <p className="text-lg text-gray-600 mt-2">Bjud in andra att springa med dig!</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField icon={Hash} label="Titel för din runda" name="title" type="text" value={formData.title} onChange={handleChange} placeholder="Ex: Morgonjogg runt Långsjön" />
            
            <div>
              <label htmlFor="description" className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <Zap className="w-5 h-5 text-gray-400" />
                Beskrivning
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Berätta lite om rundan. Vilken typ av pass? Finns det backar? Är det för nybörjare eller erfarna löpare?"
                rows="4"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-transparent focus:border-red-500 focus:bg-white focus:ring-0 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={MapPin} label="Namn på mötesplats" name="locationName" type="text" value={formData.locationName} onChange={handleChange} placeholder="Ex: Lidingövallen" />
                <InputField icon={Users} label="Max antal deltagare" name="maxParticipants" type="number" value={formData.maxParticipants} onChange={handleChange} placeholder="4" />
            </div>

            <div>
              <label className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                Välj startplats på kartan
              </label>
              <LocationPickerMap onLocationSelect={handleLocationSelect} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={Zap} label="Distans (km)" name="distance" type="number" value={formData.distance} onChange={handleChange} placeholder="15" />
                <InputField icon={Clock} label="Tempo (min:sek/km)" name="pace" type="text" value={formData.pace} onChange={handleChange} placeholder="5:30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField icon={Calendar} label="Datum" name="date" type="date" value={formData.date} onChange={handleChange} />
                <InputField icon={Clock} label="Tid" name="time" type="time" value={formData.time} onChange={handleChange} />
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed">
                <PlusCircle className="w-6 h-6" />
                {isLoading ? 'Skapar event...' : 'Publicera löprunda'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateRunEventPage; 