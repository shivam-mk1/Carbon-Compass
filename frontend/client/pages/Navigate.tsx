import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navigation from '@/components/Navigation';

// Type declarations for Google Maps
declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

// Custom hook for Google Maps
const useGoogleMaps = (
  mapContainer: React.RefObject<HTMLDivElement>, 
  apiKey: string, 
  setSelectedCoordinates: React.Dispatch<React.SetStateAction<{ lat: string; lng: string; } | null>>
) => {
  const [map, setMap] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);

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

    window.initGoogleMaps = () => {
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
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

      // Add click listener to the map
      mapInstance.addListener('click', (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat().toFixed(4);
          const lng = event.latLng.lng().toFixed(4);
          setSelectedCoordinates({ lat, lng });

          // Remove previous selected marker if exists
          if (selectedMarker) {
            selectedMarker.setMap(null);
          }

          // Add new selected marker
          const newMarker = new window.google.maps.Marker({
            position: event.latLng,
            map: mapInstance,
            title: `Selected: ${lat}, ${lng}`,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: 'blue',
              fillOpacity: 0.8,
              strokeWeight: 0,
              scale: 10
            }
          });
          setSelectedMarker(newMarker);
        }
      });
    }
  }, [isLoaded, mapContainer, map, setSelectedCoordinates, selectedMarker]);

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
const MetricsContent = ({ metrics }: { metrics: any }) => (
  <div className="space-y-6">
    {[
      { label: 'PM 2.5', value: `${metrics.pm2_5} µg/m³`, width: metrics.pm2_5 },
      { label: 'PM 10', value: `${metrics.pm10} µg/m³`, width: metrics.pm10 },
      { label: 'NOx', value: `${metrics.nox} ppb`, width: metrics.nox },
      { label: 'CO', value: `${metrics.co} ppm`, width: metrics.co * 10 }, // Assuming CO is 0-10 range for width
      { label: 'Ozone (O₃)', value: `${metrics.ozone} ppb`, width: metrics.ozone },
      { label: 'SO₂', value: `${metrics.so2} ppb`, width: metrics.so2 * 10 } // Assuming SO2 is 0-10 range for width
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
const PredictionsContent = ({ data }: { data: any }) => (
  <div className="text-gray-300 space-y-4">
    <p><strong className="text-lime">Predicted Carbon Density:</strong> {data.datasets[0].data[data.datasets[0].data.length - 1]} tons/km²</p>
    <div>
      <p className="text-lime font-semibold mb-3">Future Projections:</p>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data.labels.map((label: string, index: number) => ({ name: label, 'Carbon Density': data.datasets[0].data[index] }))}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="name" stroke="#e6edf3" />
            <YAxis stroke="#e6edf3" />
            <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none' }} itemStyle={{ color: '#e6edf3' }} />
            <Legend />
            <Line type="monotone" dataKey="Carbon Density" stroke="#7dd956" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
    <p className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-sm">
      These projections are based on current traffic, energy consumption, and population growth trends. 
      They highlight the urgent need for new urban policies to prevent a continued rise in emissions.
    </p>
  </div>
);

// Suggestions Content Component
const SuggestionsContent = ({ policies }: { policies: string[] }) => (
  <div className="text-gray-300 space-y-4">
    <p className="text-lime font-semibold">Based on our analysis, here are key policy recommendations to combat urban carbon emissions:</p>
    <ul className="space-y-4">
      {policies.map((policy, index) => (
        <li key={index} className="bg-emerald-deep/30 rounded-lg p-4 border border-lime/20">
          {policy}
        </li>
      ))}
    </ul>
  </div>
);

// Navigation Item Component
const NavItem = ({ icon, text, onClick, disabled }: {
  icon: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button 
    className={`w-full flex items-center gap-4 p-4 rounded-lg bg-emerald-deep/30 border border-lime/20 transition-all duration-300 text-white backdrop-blur-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-lime/10 hover:border-lime/40 hover:text-lime group'}`}
    onClick={onClick}
    disabled={disabled}
  >
    <span className="text-2xl">{icon}</span>
    <span className="font-medium">{text}</span>
  </button>
);

// Main Navigate Component
const Navigate = () => {
  const [modalState, setModalState] = useState({ isOpen: false, title: '', content: null });
  const [coordinates, setCoordinates] = useState({ lat: '20.27', lng: '85.84' }); // Hovered coordinates
  const [selectedCoordinates, setSelectedCoordinates] = useState<{ lat: string; lng: string } | null>(null); // Clicked coordinates
  const [dataReceived, setDataReceived] = useState(false);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [projectionsData, setProjectionsData] = useState<any>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  
  const apiKey = 'AIzaSyDbdQ4kTlWVcrMLQNf1gbyi0nxi4ap8NkE';
  const { map } = useGoogleMaps(mapContainer, apiKey, setSelectedCoordinates);

  // Set up mouse move listener for coordinates
  useEffect(() => {
    if (map) {
      const listener = map.addListener('mousemove', (event: any) => {
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
    openModal('Performance Metrics', <MetricsContent metrics={metricsData} />);
  };

  const handlePredictionsClick = () => {
    openModal('Future Projections', <PredictionsContent data={projectionsData} />);
  };

  const handleSuggestionsClick = async () => {
    try {
      const response = await fetch('https://carbonescompass.vercel.app/api/policies');
      const data = await response.json();
      openModal('Policy Recommendations', <SuggestionsContent policies={data} />);
    } catch (error) {
      console.error('Error fetching policies:', error);
      openModal('Policy Recommendations', <p>Failed to load policies. Please try again later.</p>);
    }
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
                disabled={!dataReceived}
              />
              <NavItem
                icon="🔮"
                text="Future Projections"
                onClick={handlePredictionsClick}
                disabled={!dataReceived}
              />
              <NavItem
                icon="💡"
                text="Policy Recommendations"
                onClick={handleSuggestionsClick}
                disabled={!dataReceived}
              />
            </nav>
          </div>
          
          <div className="space-y-4">
            {/* Coordinates Display */}
            <div className="bg-emerald-deep/50 backdrop-blur-sm p-4 rounded-lg border border-lime/30">
              <div className="text-lime font-semibold mb-2">Current Coordinates</div>
              <div className="flex justify-between text-sm font-mono">
                <span>Lat: {selectedCoordinates ? selectedCoordinates.lat : coordinates.lat}</span>
                <span>Lng: {selectedCoordinates ? selectedCoordinates.lng : coordinates.lng}</span>
              </div>
            </div>
            
            <button 
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-lime/80 hover:bg-lime text-emerald-deep font-semibold transition-colors duration-300"
              onClick={async () => {
                try {
                  const metricsResponse = await fetch('https://carbonescompass.vercel.app/api/metrics');
                  const metrics = await metricsResponse.json();
                  setMetricsData(metrics);

                  const projectionsResponse = await fetch('https://carbonescompass.vercel.app/api/projections');
                  const projections = await projectionsResponse.json();
                  setProjectionsData(projections);

                  setDataReceived(true);
                  openModal('Data Status', <p>Data successfully received from backend!</p>);
                } catch (error) {
                  console.error('Error fetching initial data:', error);
                  openModal('Data Status', <p>Failed to receive data. Please check backend server.</p>);
                }
              }}
            >
              <span>Get Data</span>
            </button>
            
            {/* Copyright */}
            <div className="text-center text-xs text-gray-400">
              © 2025 Carbon Compass Inc.
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