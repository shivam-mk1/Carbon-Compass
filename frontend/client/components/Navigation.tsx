import { useState, useEffect } from 'react';
import { Menu, X, MapPin, AlertTriangle, Navigation as Compass } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('San Francisco');
  const [carbonEmission, setCarbonEmission] = useState(2847);
  const [compassRotation, setCompassRotation] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Simulate real-time carbon emission updates
    const interval = setInterval(() => {
      setCarbonEmission(prev => prev + Math.floor(Math.random() * 10 - 5));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Rotate compass slowly
    const interval = setInterval(() => {
      setCompassRotation(prev => (prev + 1) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: 'Dashboard', href: '#dashboard' },
    { name: 'Navigate', href: '/navigate' },
    { name: 'Monitor', href: '#monitor' },
    { name: 'Insights', href: '#insights' },
    { name: 'Data Points', href: '#data-points' },
  ];

  // Calculate compass needle direction based on selected city
  const getCityBearing = (city: string) => {
    const bearings = {
      'San Francisco': 45,
      'New York': 90,
      'London': 135,
      'Tokyo': 180,
      'Toronto': 225,
      'Berlin': 270,
    };
    return bearings[city] || 0;
  };

  return (
    <>
      {/* Emergency Alert Banner */}
      {carbonEmission > 3000 && (
        <div className="bg-red-600/90 backdrop-blur-lg border-b border-red-400/30 px-4 py-2 fixed top-0 left-0 right-0 z-[60]">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-white">
            <AlertTriangle className="h-4 w-4 animate-pulse" />
            <span className="text-sm font-medium">Course Correction Required: {selectedCity} - Navigate to Emission Reduction</span>
          </div>
        </div>
      )}

      <nav
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          carbonEmission > 3000 ? 'top-10' : 'top-0'
        } ${
          isScrolled
            ? 'bg-emerald-deep/90 backdrop-blur-lg border-b border-lime/20'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="#home" className="flex items-center">
                <div className="flex flex-col">
                  <span className="text-2xl lg:text-3xl font-bold font-montserrat text-white">
                    Carbon <span className="text-lime">Compass</span>
                  </span>
                  <span className="text-xs lg:text-sm text-electric font-medium -mt-1">
                    Emission Ka Commission
                  </span>
                </div>
              </a>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="ml-10 flex items-center space-x-8">
                {navItems.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white hover:text-lime transition-colors duration-300 px-3 py-2 text-sm font-medium font-inter relative group"
                  >
                    {item.name}
                    <span className="absolute inset-x-0 bottom-0 h-0.5 bg-lime transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
                    {/* Compass direction indicator */}
                    <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs text-electric opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {['N', 'NE', 'E', 'SE', 'S'][index]}
                    </span>
                  </a>
                ))}
                
                {/* City Selector with Compass */}
                <div className="flex items-center gap-4 ml-6 pl-6 border-l border-lime/30">
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6">
                      <MapPin className="h-4 w-4 text-lime absolute top-1 left-1" />
                      <div 
                        className="absolute w-2 h-2 bg-electric rounded-full"
                        style={{
                          transform: `rotate(${getCityBearing(selectedCity)}deg) translateY(-8px)`,
                          transformOrigin: 'center 8px'
                        }}
                      />
                    </div>
                    <select 
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="bg-emerald-deep/50 text-white border border-lime/30 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-lime"
                    >
                      <option value="San Francisco">San Francisco</option>
                      <option value="New York">New York</option>
                      <option value="London">London</option>
                      <option value="Tokyo">Tokyo</option>
                      <option value="Toronto">Toronto</option>
                      <option value="Berlin">Berlin</option>
                    </select>
                  </div>
                  
                  {/* Live Carbon Counter with Compass Style */}
                  <div className="flex items-center gap-2 px-3 py-1 bg-lime/10 rounded-lg border border-lime/30">
                    <div className="relative w-4 h-4">
                      <div className="w-2 h-2 bg-lime rounded-full animate-pulse absolute top-1 left-1"></div>
                      <div className="absolute inset-0 border border-lime/50 rounded-full"></div>
                    </div>
                    <span className="text-sm text-lime font-mono">{carbonEmission.toLocaleString()} CO₂</span>
                    <span className="text-xs text-electric">coords</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:text-lime transition-colors duration-300 p-2"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden">
            <div className="bg-emerald-deep/95 backdrop-blur-lg border-t border-lime/30">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-lime hover:bg-emerald-deep/50 block px-3 py-2 text-base font-medium font-inter transition-colors duration-300 flex items-center gap-2"
                  >
                    <span className="text-xs text-electric w-6">{['N', 'NE', 'E', 'SE', 'S'][index]}</span>
                    {item.name}
                  </a>
                ))}
                
                {/* Mobile City Selector */}
                <div className="px-3 py-2 border-t border-lime/30 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-lime" />
                    <span className="text-sm text-white">Navigation Point:</span>
                  </div>
                  <select 
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-emerald-deep/50 text-white border border-lime/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-lime"
                  >
                    <option value="San Francisco">San Francisco</option>
                    <option value="New York">New York</option>
                    <option value="London">London</option>
                    <option value="Tokyo">Tokyo</option>
                    <option value="Toronto">Toronto</option>
                    <option value="Berlin">Berlin</option>
                  </select>
                  
                  <div className="mt-3 flex items-center gap-2 justify-center">
                    <div className="relative w-4 h-4">
                      <div className="w-2 h-2 bg-lime rounded-full animate-pulse absolute top-1 left-1"></div>
                      <div className="absolute inset-0 border border-lime/50 rounded-full"></div>
                    </div>
                    <span className="text-sm text-lime font-mono">{carbonEmission.toLocaleString()} CO₂</span>
                    <span className="text-xs text-electric">coordinates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navigation;
