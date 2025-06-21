import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    ChevronLeft, 
    Save, 
    MapPin, 
    Mountain, 
    Calendar,
    Timer,
    Activity,
    Zap,
    Award,
    FileText,
    Sparkles,
    TrendingUp,
    Clock,
    Heart,
    Info,
    CheckCircle,
    Target,
    Camera,
    Upload,
    X,
    Image as ImageIcon
} from 'lucide-react';
import api from '../../services/api';

const LogActivityPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        distance: '', // km
        hours: '',
        minutes: '',
        seconds: '',
        elevation: '', // meters
        type: 'recovery',
        description: '',
    });
    const [calculatedPace, setCalculatedPace] = useState(null);
    const [calories, setCalories] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState('recovery');
    const [images, setImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const fileInputRef = useRef(null);

    const activityTypes = [
        { value: 'recovery', label: 'Återhämtning', icon: Activity, color: 'emerald', gradient: 'from-emerald-400 to-green-500', description: 'Lätt löpning för återhämtning' },
        { value: 'long', label: 'Långpass', icon: Timer, color: 'blue', gradient: 'from-blue-400 to-indigo-500', description: 'Uthållighetsbyggande löpning' },
        { value: 'interval', label: 'Intervall', icon: Zap, color: 'red', gradient: 'from-red-400 to-pink-500', description: 'Högintensiv intervallträning' },
        { value: 'tempo', label: 'Tempo', icon: TrendingUp, color: 'purple', gradient: 'from-purple-400 to-violet-500', description: 'Snabb och jämn takt' },
        { value: 'hill', label: 'Backe', icon: Mountain, color: 'orange', gradient: 'from-orange-400 to-amber-500', description: 'Kuperad terräng och backar' },
        { value: 'race', label: 'Tävling', icon: Award, color: 'yellow', gradient: 'from-yellow-400 to-orange-500', description: 'Tävling eller testlopp' },
    ];

    // Calculate pace and calories when relevant fields change
    useEffect(() => {
        const distance = parseFloat(formData.distance) || 0;
        const totalSeconds = (parseInt(formData.hours || 0) * 3600) + 
                           (parseInt(formData.minutes || 0) * 60) + 
                           parseInt(formData.seconds || 0);
        
        // Calculate pace
        if (totalSeconds > 0 && distance > 0) {
            const paceSeconds = totalSeconds / distance;
            const paceMinutes = Math.floor(paceSeconds / 60);
            const paceRemainderSeconds = Math.round(paceSeconds % 60);
            setCalculatedPace(`${paceMinutes}:${paceRemainderSeconds.toString().padStart(2, '0')}`);
            
            // Estimate calories (rough estimate: 100 calories per km for average runner)
            const weight = 70; // Default weight in kg
            const met = formData.type === 'interval' ? 12 : formData.type === 'tempo' ? 10 : 8;
            const hours = totalSeconds / 3600;
            const estimatedCalories = Math.round(met * weight * hours);
            setCalories(estimatedCalories);
        } else {
            setCalculatedPace(null);
            setCalories(0);
        }
    }, [formData.distance, formData.hours, formData.minutes, formData.seconds, formData.type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!formData.title || !formData.distance || (!formData.hours && !formData.minutes && !formData.seconds)) {
            toast.error('Vänligen fyll i titel, distans och tid.');
            return;
        }

        setIsLoading(true);

        try {
            const durationInSeconds = (parseInt(formData.hours || 0) * 3600) + (parseInt(formData.minutes || 0) * 60) + parseInt(formData.seconds || 0);
            
            const uploadData = new FormData();
            
            uploadData.append('title', formData.title);
            uploadData.append('description', formData.description);
            uploadData.append('distance', formData.distance);
            uploadData.append('duration', durationInSeconds);
            uploadData.append('elevationGain', formData.elevation);
            uploadData.append('activityType', formData.type);
            uploadData.append('startTime', new Date(formData.date).toISOString());
            uploadData.append('calories', calories);

            images.forEach((image) => {
                uploadData.append(`images`, image);
            });
            
            const response = await api.post('/activities', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 201) {
                toast.success('Aktivitet sparad! 🎉🏃‍♂️');
                navigate('/app/activities');
            } else {
                toast.error('Något gick fel. Försök igen.');
            }

        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Något gick fel vid uppladdning');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setFormData(prev => ({ ...prev, type: type }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            toast.error('Max 5 bilder tillåtna');
            return;
        }

        const newImages = [...images, ...files];
        setImages(newImages);

        // Create preview URLs
        const newPreviewUrls = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
        
        // Clean up the URL to prevent memory leaks
        URL.revokeObjectURL(previewUrls[index]);
        
        setImages(newImages);
        setPreviewUrls(newPreviewUrls);
    };

    // Clean up URLs on unmount
    useEffect(() => {
        return () => {
            previewUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [previewUrls]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Subtle Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
                <div className="absolute top-40 -left-40 w-80 h-80 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-slow"></div>
            </div>

            {/* Header */}
            <div className="relative bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Link to="/app/dashboard" className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 mr-4 transition-all duration-200 hover:scale-105">
                               <ChevronLeft className="w-6 h-6 text-gray-700"/>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Logga nytt löppass
                                </h1>
                                <p className="text-gray-600 mt-1 flex items-center">
                                    <Sparkles className="w-4 h-4 mr-1 text-yellow-500" />
                                    Dokumentera ditt äventyr
                                </p>
                            </div>
                        </div>
                        {/* Live Stats Preview */}
                        {(calculatedPace || calories > 0 || images.length > 0) && (
                            <div className="hidden sm:flex items-center space-x-4 bg-gray-50 rounded-2xl px-4 py-2">
                                {calculatedPace && (
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Tempo</p>
                                        <p className="font-semibold text-red-600">{calculatedPace} min/km</p>
                                    </div>
                                )}
                                {calories > 0 && (
                                    <div className="text-center border-l border-gray-200 pl-4">
                                        <p className="text-xs text-gray-500">Kalorier</p>
                                        <p className="font-semibold text-orange-600">{calories} kcal</p>
                                    </div>
                                )}
                                {images.length > 0 && (
                                    <div className="text-center border-l border-gray-200 pl-4">
                                        <p className="text-xs text-gray-500">Bilder</p>
                                        <p className="font-semibold text-blue-600 flex items-center">
                                            <Camera className="w-4 h-4 mr-1" />
                                            {images.length}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Activity Type Selection */}
                    <div className="relative">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <Target className="w-5 h-5 mr-2 text-primary-500" />
                            Välj typ av aktivitet
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {activityTypes.map((type) => {
                                const Icon = type.icon;
                                const isSelected = selectedType === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => handleTypeSelect(type.value)}
                                        className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                                            isSelected 
                                                ? `border-transparent bg-gradient-to-br ${type.gradient} text-white shadow-lg` 
                                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center space-y-2">
                                            <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                                            <span className={`font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                {type.label}
                                            </span>
                                            <span className={`text-xs text-center ${isSelected ? 'text-white/80' : 'text-gray-500'} line-clamp-2`}>
                                                {type.description}
                                            </span>
                                        </div>
                                        {isSelected && (
                                            <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-white" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg space-y-6 border border-gray-100">
                        {/* Title Input with Animation */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium text-gray-700 flex items-center">
                                <FileText className="w-4 h-4 mr-1" />
                                Ge ditt pass en titel
                            </label>
                            <input 
                                type="text" 
                                name="title" 
                                id="title" 
                                value={formData.title} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 placeholder-gray-400"
                                placeholder="T.ex. Solig morgonrunda i parken 🌅" 
                            />
                        </div>

                        {/* Date and Distance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="date" className="text-sm font-medium text-gray-700 flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Datum
                                </label>
                                <input 
                                    type="date" 
                                    name="date" 
                                    id="date" 
                                    value={formData.date} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="distance" className="text-sm font-medium text-gray-700 flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    Distans (km)
                                </label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    name="distance" 
                                    id="distance" 
                                    value={formData.distance} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                                    placeholder="T.ex. 10.5" 
                                />
                            </div>
                        </div>

                        {/* Time Input with Visual Enhancement */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                Tid
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <input 
                                        type="number" 
                                        name="hours" 
                                        value={formData.hours} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 text-center text-lg font-medium"
                                        placeholder="00" 
                                        min="0"
                                        max="23"
                                    />
                                    <p className="text-xs text-gray-500 text-center mt-1">Timmar</p>
                                </div>
                                <div>
                                    <input 
                                        type="number" 
                                        name="minutes" 
                                        value={formData.minutes} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 text-center text-lg font-medium"
                                        placeholder="00" 
                                        min="0"
                                        max="59"
                                    />
                                    <p className="text-xs text-gray-500 text-center mt-1">Minuter</p>
                                </div>
                                <div>
                                    <input 
                                        type="number" 
                                        name="seconds" 
                                        value={formData.seconds} 
                                        onChange={handleChange} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 text-center text-lg font-medium"
                                        placeholder="00" 
                                        min="0"
                                        max="59"
                                    />
                                    <p className="text-xs text-gray-500 text-center mt-1">Sekunder</p>
                                </div>
                            </div>
                        </div>

                        {/* Elevation */}
                        <div className="space-y-2">
                            <label htmlFor="elevation" className="text-sm font-medium text-gray-700 flex items-center">
                                <Mountain className="w-4 h-4 mr-1" />
                                Höjdmeter (valfritt)
                            </label>
                            <input 
                                type="number" 
                                name="elevation" 
                                id="elevation" 
                                value={formData.elevation} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-200"
                                placeholder="T.ex. 150" 
                            />
                        </div>

                        {/* Description with Character Count */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center justify-between">
                                <span className="flex items-center">
                                    <Info className="w-4 h-4 mr-1" />
                                    Beskrivning
                                </span>
                                <span className="text-xs text-gray-400">{formData.description.length}/500</span>
                            </label>
                            <textarea 
                                name="description" 
                                id="description" 
                                rows="4" 
                                value={formData.description} 
                                onChange={handleChange} 
                                maxLength="500"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/20 focus:outline-none transition-all duration-200 resize-none"
                                placeholder="Hur kändes passet? Berätta om din upplevelse... 🏃‍♂️"
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 flex items-center">
                                <Camera className="w-4 h-4 mr-1" />
                                Lägg till bilder
                                <span className="text-xs text-gray-400 ml-2">(Max 5 bilder)</span>
                            </label>
                            
                            {/* Upload Area */}
                            <div className="relative">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                    id="image-upload"
                                />
                                
                                {/* Image Preview Grid */}
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                    {/* Upload Button */}
                                    {images.length < 5 && (
                                        <label
                                            htmlFor="image-upload"
                                            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-red-400 bg-gray-50 hover:bg-gray-100 cursor-pointer flex flex-col items-center justify-center transition-all duration-200 group"
                                        >
                                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-red-500 mb-1" />
                                            <span className="text-xs text-gray-500 group-hover:text-red-600">Ladda upp</span>
                                        </label>
                                    )}
                                    
                                    {/* Image Previews */}
                                    {previewUrls.map((url, index) => (
                                        <div key={index} className="relative aspect-square group">
                                            <img
                                                src={url}
                                                alt={`Upload ${index + 1}`}
                                                className="w-full h-full object-cover rounded-xl border border-gray-200 group-hover:border-red-400 transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg hover:scale-110 transform"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent rounded-b-xl p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <p className="text-white text-xs font-medium">Bild {index + 1}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Helper Text */}
                                {images.length === 0 && (
                                    <p className="text-xs text-gray-500 mt-2 flex items-center">
                                        <ImageIcon className="w-3 h-3 mr-1" />
                                        Dela bilder från ditt löppass för att göra det mer minnesvärt
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Real-time Statistics Card */}
                        {(calculatedPace || calories > 0) && (
                            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100">
                                <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                    <Heart className="w-4 h-4 mr-1 text-red-500" />
                                    Beräknad statistik
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {calculatedPace && (
                                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                            <p className="text-sm text-gray-500">Genomsnittstempo</p>
                                            <p className="text-2xl font-bold text-red-600">{calculatedPace}</p>
                                            <p className="text-xs text-gray-400">min/km</p>
                                        </div>
                                    )}
                                    {calories > 0 && (
                                        <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                                            <p className="text-sm text-gray-500">Förbrända kalorier</p>
                                            <p className="text-2xl font-bold text-orange-600">{calories}</p>
                                            <p className="text-xs text-gray-400">kcal</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center">
                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`
                                relative inline-flex items-center px-8 py-4 rounded-2xl font-semibold text-white
                                bg-gradient-to-r from-red-500 to-red-600 
                                hover:from-red-600 hover:to-red-700 
                                transform transition-all duration-200 
                                hover:scale-105 hover:shadow-2xl
                                focus:outline-none focus:ring-4 focus:ring-red-500/30
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                                ${isLoading ? 'animate-pulse' : ''}
                            `}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Sparar...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Spara aktivitet
                                    <Sparkles className="w-4 h-4 ml-2 text-yellow-300" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>


        </div>
    );
};

export default LogActivityPage; 