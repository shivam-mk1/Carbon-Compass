import React, { useState, useEffect, useRef } from 'react';
import Navigation from '@/components/Navigation';

// Custom hook for Google Maps
const useGoogleMaps = (mapContainer: React.RefObject<HTMLDivElement>, apiKey: string) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps API
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMaps`;
    script.async = true;
    script.defer = true;

    (window as any).initGoogleMaps = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if ((window as any).initGoogleMaps) {
        delete (window as any).initGoogleMaps;
      }
    };
  }, [apiKey]);

  useEffect(() => {
    if (isLoaded && mapContainer.current && !map) {
      const defaultCenter = { lat: 20.27, lng: 85.84 }; // Bhubaneswar, India
      
      const mapInstance = new window.google.maps.Map(mapContainer.current, {
        zoom: 12,
        center: defaultCenter,
      });

      // Add markers for cities
      const cities = [
        { name: 'Carbon Compass HQ', coords: defaultCenter },
        { name: 'New Delhi', coords: { lat: 28.7041, lng: 77.1025 } },
        { name: 'Kolkata', coords: { lat: 22.5726, lng: 88.3639 } },
        { name: 'Chennai', coords: { lat: 13.0827, lng: 80.2707 } },
        { name: 'Mumbai', coords: { lat: 19.0760, lng: 72.8777 } }
      ];

      // Custom red dot icon
      const redDot = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: 'red',
        fillOpacity: 0.8,
        strokeWeight: 0,
        scale: 8
      };

      cities.forEach((city, index) => {
        new window.google.maps.Marker({
          position: city.coords,
          map: mapInstance,
          title: city.name,
          icon: index === 0 ? undefined : redDot
        });
      });

      setMap(mapInstance);
    }
  }, [isLoaded, mapContainer, map]);

  return { map, isLoaded };
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-emerald-deep/90 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-[90%] max-w-2xl border border-lime/20 relative">
        <button 
          className="absolute top-4 right-6 text-gray-400 hover:text-lime text-3xl font-bold transition-colors duration-300"
          onClick={onClose}
        >
          ×
        </button>
        <div>
          <h2 className="text-2xl font-bold text-lime mb-6 border-b border-lime/30 pb-3">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

// Metrics Content Component
const MetricsContent = () => (
  <div className="space-y-6">
    {[
      { label: 'PM 2.5', value: '45 µg/m³', width: 45 },
      { label: 'PM 10', value: '78 µg/m³', width: 78 },
      { label: 'NOx', value: '12 ppb', width: 12 },
      { label: 'CO', value: '3 ppm', width: 30 },
      { label: 'Ozone (O₃)', value: '65 ppb', width: 65 },
      { label: 'SO₂', value: '5 ppb', width: 5 }
    ].map((metric, index) => (
      <div key={index} className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">{metric.label}</span>
          <span className="text-lime font-mono">{metric.value}</span>
        </div>
        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-lime to-electric h-full rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${metric.width}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

// Predictions Content Component
const PredictionsContent = () => (
  <div className="text-gray-300 space-y-4">
    <p><strong className="text-lime">Predicted Carbon Density:</strong> 350 tons/km²</p>
    <div>
      <p className="text-lime font-semibold mb-3">Future Projections:</p>
      <ul className="space-y-2 ml-4">
        <li><strong className="text-electric">2026:</strong> 365 tons/km² (without intervention)</li>
        <li><strong className="text-electric">2030:</strong> 410 tons/km² (without intervention)</li>
      </ul>
    </div>
    <p className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-sm">
      These projections are based on current traffic, energy consumption, and population growth trends. 
      They highlight the urgent need for new urban policies to prevent a continued rise in emissions.
    </p>
  </div>
);

// Suggestions Content Component
const SuggestionsContent = () => (
  <div className="text-gray-300 space-y-4">
    <p className="text-lime font-semibold">Based on our analysis, here are key policy recommendations to combat urban carbon emissions:</p>
    <ul className="space-y-4">
      <li className="bg-emerald-deep/30 rounded-lg p-4 border border-lime/20">
        <strong className="text-lime">Enhance Urban Green Spaces:</strong> Implement a city-wide initiative to plant 10,000 trees annually, focusing on high-density areas to maximize carbon sequestration.
      </li>
      <li className="bg-emerald-deep/30 rounded-lg p-4 border border-electric/20">
        <strong className="text-electric">Promote Sustainable Transportation:</strong> Invest in a new electric bus fleet and expand dedicated cycling infrastructure by 50% over the next five years.
      </li>
      <li className="bg-emerald-deep/30 rounded-lg p-4 border border-lime/20">
        <strong className="text-lime">Optimize Building Energy Efficiency:</strong> Launch a public-private partnership to offer incentives for smart grid technologies and energy-saving retrofits in commercial buildings.
      </li>
      <li className="bg-emerald-deep/30 rounded-lg p-4 border border-electric/20">
        <strong className="text-electric">Implement Waste-to-Energy Systems:</strong> Construct a new facility to convert municipal solid waste into clean energy, reducing reliance on landfills and fossil fuels.
      </li>
      <li className="bg-emerald-deep/30 rounded-lg p-4 border border-lime/20">
        <strong className="text-lime">Encourage Renewable Energy:</strong> Revise zoning laws to streamline the installation of residential solar panels and explore feasibility studies for a municipal wind energy project.
      </li>
    </ul>
  </div>
);

// Navigation Item Component
const NavItem = ({ icon, text, onClick }: {
  icon: string;
  text: string;
  onClick: () => void;
}) => (
  <button 
    className="w-full flex items-center gap-4 p-4 rounded-lg bg-emerald-deep/30 border border-lime/20 hover:bg-lime/10 hover:border-lime/40 transition-all duration-300 text-white hover:text-lime group backdrop-blur-sm"
    onClick={onClick}
  >
    <span className="text-2xl">{icon}</span>
    <span className="font-medium">{text}</span>
  </button>
);

// Main Navigate Component
const Navigate = () => {
  const [modalState, setModalState] = useState({ isOpen: false, title: '', content: null });
  const [coordinates, setCoordinates] = useState({ lat: '20.27', lng: '85.84' });
  const mapContainer = useRef<HTMLDivElement>(null);
  
  const apiKey = 'AIzaSyDbdQ4kTlWVcrMLQNf1gbyi0nxi4ap8NkE';
  const { map } = useGoogleMaps(mapContainer, apiKey);

  // Set up mouse move listener for coordinates
  useEffect(() => {
    if (map) {
      const listener = map.addListener('mousemove', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat().toFixed(4);
          const lng = event.latLng.lng().toFixed(4);
          setCoordinates({ lat, lng });
        }
      });

      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [map]);

  const openModal = (title: string, content: React.ReactNode) => {
    setModalState({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', content: null });
  };

  const handleMetricsClick = () => {
    openModal('Performance Metrics', <MetricsContent />);
  };

  const handlePredictionsClick = () => {
    openModal('Future Projections', <PredictionsContent />);
  };

  const handleSuggestionsClick = () => {
    openModal('Policy Recommendations', <SuggestionsContent />);
  };

  return (
    <div className="min-h-screen bg-gradient-dark text-white relative overflow-hidden">
      <Navigation />
      
      {/* Background Video Placeholder */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-deep/80 via-black to-emerald-deep/60 -z-10" />
      
      {/* Dashboard Container */}
      <div className="flex h-screen pt-20 lg:pt-24">
        {/* Sidebar */}
        <aside className="w-80 p-6 bg-emerald-deep/20 backdrop-blur-lg border-r border-lime/20 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold font-montserrat mb-8 text-center">
              Carbon Compass 🌱
              <div className="text-sm text-electric font-normal mt-1">Navigation Dashboard</div>
            </h1>
            
            <nav className="space-y-4">
              <NavItem
                icon="📊"
                text="Performance Metrics"
                onClick={handleMetricsClick}
              />
              <NavItem
                icon="🔮"
                text="Future Projections"
                onClick={handlePredictionsClick}
              />
              <NavItem
                icon="💡"
                text="Policy Recommendations"
                onClick={handleSuggestionsClick}
              />
            </nav>
          </div>
          
          <div className="space-y-4">
            {/* Coordinates Display */}
            <div className="bg-emerald-deep/50 backdrop-blur-sm p-4 rounded-lg border border-lime/30">
              <div className="text-lime font-semibold mb-2">Current Coordinates</div>
              <div className="flex justify-between text-sm font-mono">
                <span>Lat: {coordinates.lat}</span>
                <span>Lng: {coordinates.lng}</span>
              </div>
            </div>
            
            {/* Copyright */}
            <div className="text-center text-xs text-gray-400">
              © 2024 Carbon Compass Inc.
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-emerald-deep/10 backdrop-blur-lg">
          <div 
            ref={mapContainer} 
            className="w-full h-full rounded-lg border border-lime/20 bg-emerald-deep/20 backdrop-blur-sm"
            style={{ minHeight: '500px' }}
          />
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
      >
        {modalState.content}
      </Modal>
    </div>
  );
};

export default Navigate;
