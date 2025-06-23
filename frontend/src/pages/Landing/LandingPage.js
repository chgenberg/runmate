import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  Users, 
  Trophy, 
  Target, 
  Map, 
  Menu,
  X,
  Zap,
  Star,
  ArrowRight,
  Play,
} from 'lucide-react';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm' : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="container-responsive">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-pulse-slow">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">RunMate</span>
            </div>
            
            <div className="hidden lg:flex items-center space-x-8">
              <a href="#features" className="nav-link">Funktioner</a>
              <a href="#how-it-works" className="nav-link">Hur det fungerar</a>
              <a href="#testimonials" className="nav-link">Recensioner</a>
              <Link to="/login" className="nav-link">Logga in</Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/register" className="hidden sm:block btn btn-primary">
                Kom igång
              </Link>
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="mobile-menu-backdrop" onClick={() => setMobileMenuOpen(false)} />
          <div className="mobile-menu-panel bg-white">
            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold gradient-text">RunMate</span>
              </div>
              
              <nav className="space-y-4">
                <a href="#features" className="block py-2 text-lg font-medium tap-highlight" onClick={() => setMobileMenuOpen(false)}>
                  Funktioner
                </a>
                <a href="#how-it-works" className="block py-2 text-lg font-medium tap-highlight" onClick={() => setMobileMenuOpen(false)}>
                  Hur det fungerar
                </a>
                <a href="#testimonials" className="block py-2 text-lg font-medium tap-highlight" onClick={() => setMobileMenuOpen(false)}>
                  Recensioner
                </a>
                <Link to="/login" className="block py-2 text-lg font-medium tap-highlight">
                  Logga in
                </Link>
              </nav>
              
              <Link to="/register" className="btn btn-primary w-full">
                Kom igång
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30 animate-gradient"></div>
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-200 rounded-full filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-secondary-200 rounded-full filter blur-3xl opacity-20 animate-float animation-delay-2000"></div>
        
        <div className="container-responsive relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="space-y-6">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 animate-pulse">
                  <Star className="w-4 h-4 mr-1" />
                  Sveriges #1 sociala träningsapp
                </div>
                
                <h1 className="heading-responsive font-extrabold leading-tight">
                  Hitta din
                  <span className="block gradient-text">träningskompis</span>
                </h1>
                
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Matcha med löpare i din närhet. Träna tillsammans, 
                  utmana varandra och nå nya mål i Sveriges mest sociala träningsapp.
                </p>
              </div>
              
              <div className="stack-horizontal">
                <Link to="/register" className="btn btn-primary btn-lg group">
                  Börja matcha
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="btn btn-glass btn-lg group">
                  <Play className="w-5 h-5 mr-2 transform group-hover:scale-110 transition-transform" />
                  Se hur det fungerar
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center space-y-1 animate-fade-in animation-delay-500">
                  <div className="text-3xl font-bold gradient-text">10K+</div>
                  <div className="text-sm text-gray-600">Aktiva användare</div>
                </div>
                <div className="text-center space-y-1 animate-fade-in animation-delay-700">
                  <div className="text-3xl font-bold gradient-text">25K+</div>
                  <div className="text-sm text-gray-600">Träningspass</div>
                </div>
                <div className="text-center space-y-1 animate-fade-in animation-delay-900">
                  <div className="text-3xl font-bold gradient-text">4.8★</div>
                  <div className="text-sm text-gray-600">App Store</div>
                </div>
              </div>
            </div>
            
            <div className="relative animate-slide-left">
              <div className="relative z-10 perspective-1000">
                <div className="bg-white/95 backdrop-blur-md border border-white/30 shadow-xl p-2 rounded-3xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img 
                    src="/lopning2.png" 
                    alt="People running together" 
                    className="w-full rounded-2xl object-cover h-96"
                  />
                  <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md border border-white/20 shadow-lg rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">Emma & Marcus</div>
                        <div className="text-sm text-white/80">Matchade för 2 veckor sedan</div>
                      </div>
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-primary rounded-3xl filter blur-2xl opacity-20 -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50/5 to-transparent"></div>
        
        <div className="container-responsive relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="heading-responsive font-bold animate-slide-up">
              Allt du behöver för att träna socialt
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto animate-slide-up animation-delay-200">
              Kombinera det bästa från Tinder och Strava för en helt ny träningsupplevelse
            </p>
          </div>
          
          <div className="grid-responsive">
            {[
              {
                icon: Heart,
                title: "Smart Matchning",
                description: "AI-driven algoritm som matchar dig med träningspartners baserat på nivå, intressen och närhet",
                gradient: "from-red-500 to-pink-500"
              },
              {
                icon: Users,
                title: "Träna Tillsammans",
                description: "Hitta motivation genom att träna med likasinnade i din stad",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Trophy,
                title: "Utmaningar & Tävlingar",
                description: "Delta i gruppütmaningar och tävla mot andra för extra motivation",
                gradient: "from-yellow-500 to-orange-500"
              },
              {
                icon: Target,
                title: "Personliga Mål",
                description: "Sätt och följ upp dina träningsmål med hjälp av community",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Map,
                title: "Träningsplatser",
                description: "Upptäck nya löprutter och cykelvägar tillsammans med andra",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: Zap,
                title: "Live Aktivitet",
                description: "Se vad dina matchningar tränar just nu och ge stöd i realtid",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="feature-card animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} p-3 mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-full h-full text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Så enkelt kom du igång
            </h2>
            <p className="text-xl text-gray-600">
              Från registrering till första träningspasset på bara några minuter
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Skapa din profil",
                description: "Berätta om dina träningsintressen, nivå och vad du vill uppnå",
                image: "/lopning6.png"
              },
              {
                step: "2", 
                title: "Svajpa & matcha",
                description: "Bläddra bland träningspartners i din närhet och matcha med intressanta personer",
                image: "/lopning3.png"
              },
              {
                step: "3",
                title: "Träna tillsammans",
                description: "Chatta, planera träningspass och motivera varandra att nå era mål",
                image: "/lopning4.png"
              }
            ].map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="relative">
                  <img 
                    src={step.image} 
                    alt={step.title}
                    className="w-full rounded-xl shadow-lg"
                  />
                  <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Vad säger våra användare?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Anna Svensson",
                location: "Stockholm",
                avatar: "https://ui-avatars.com/api/?name=Anna+Svensson&background=6366f1&color=fff",
                text: "Fantastisk app! Hittade min löparkompis Emma här och nu tränar vi tillsammans 4 gånger i veckan. Har aldrig varit i så bra form!",
                rating: 5
              },
              {
                name: "Marcus Johansson", 
                location: "Göteborg",
                avatar: "https://ui-avatars.com/api/?name=Marcus+Johansson&background=10b981&color=fff",
                text: "Som nybörjare var det skrämmande att börja cykla. Genom RunMate hittade jag erfarna cyklister som hjälpte mig komma igång.",
                rating: 5
              },
              {
                name: "Sara Lindqvist",
                location: "Malmö", 
                avatar: "https://ui-avatars.com/api/?name=Sara+Lindqvist&background=f59e0b&color=fff",
                text: "Utmaningarna i appen är fantastiska! Vi bildade en grupp på 8 personer och tränade inför Vätternrundan tillsammans.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="card p-6 space-y-4">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
                <div className="flex items-center space-x-3">
                  <img 
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Redo att hitta din träningskompis?
            </h2>
            <p className="text-xl text-white/90">
              Gå med i tusentals löpare och cyklister som redan tränar tillsammans
            </p>
            <Link to="/register" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-50">
              Skapa konto gratis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">RunMate</span>
              </div>
              <p className="text-gray-400">
                Sveriges mest sociala träningsapp för löpare och cyklister.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Produkt</h3>
              <div className="space-y-2 text-gray-400">
                <div>Funktioner</div>
                <div>Priser</div>
                <div>FAQ</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Företag</h3>
              <div className="space-y-2 text-gray-400">
                <div>Om oss</div>
                <div>Karriär</div>
                <div>Kontakt</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <div className="space-y-2 text-gray-400">
                <div>Hjälpcenter</div>
                <div>Integritet</div>
                <div>Användarvillkor</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RunMate. Alla rättigheter förbehållna.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 