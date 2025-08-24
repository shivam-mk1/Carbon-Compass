import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      <div className="bg-emerald-900/90 backdrop-blur-lg p-8 rounded-xl shadow-2xl w-[90%] max-w-2xl border border-green-400/20 relative">
        <button 
          className="absolute top-4 right-6 text-gray-400 hover:text-green-400 text-3xl font-bold transition-colors duration-300"
          onClick={onClose}
        >
          ×
        </button>
        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-6 border-b border-green-400/30 pb-3">
            {title}
          </h2>
          {children}
        </div>
      </div>
    </div>
  );
};

// Metrics Content Component
const MetricsContent = ({ metrics, coordinates, timestamp }: { 
  metrics: any;
  coordinates: { lat: string; lng: string } | null;
  timestamp?: number;
}) => {
  console.log('🔄 MetricsContent re-rendering with metrics:', JSON.stringify(metrics, null, 2));
  console.log('🔄 For coordinates:', coordinates);
  console.log('🔄 Timestamp:', timestamp);
  
  // Handle different possible data structures from backend
  let co2Value = null;
  let receivedCoords = null;
  
  if (metrics) {
    // Extract CO2 value - your backend returns co2_emissions
    co2Value = metrics.co2_emissions || 
               metrics.co2Emissions || 
               metrics.co2 || 
               metrics.emissions ||
               (typeof metrics === 'number' ? metrics : null);
    
    // Extract coordinates from backend response
    receivedCoords = metrics.coordinates;
  }
  
  console.log('💨 Extracted CO2 value:', co2Value);
  console.log('📍 Backend coordinates:', receivedCoords);

  return (
    <div className="space-y-6">
      <div className="bg-green-900/20 p-4 rounded-lg border border-green-400/30 mb-4">
        <h3 className="text-green-400 font-semibold mb-2">Location Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Selected:</span>
            <span className="text-white">
              {coordinates ? `${coordinates.lat}, ${coordinates.lng}` : 'No location selected'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Backend:</span>
            <span className="text-white">
              {receivedCoords ? `${receivedCoords.lat}, ${receivedCoords.lng}` : 'No data'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Fetched:</span>
            <span className="text-white">{new Date(timestamp || Date.now()).toLocaleTimeString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Date:</span>
            <span className="text-white">{metrics?.date || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      {co2Value !== null && typeof co2Value === 'number' ? (
        <div className="space-y-4">
          {/* Large CO2 Value Display */}
          <div className="text-center bg-gray-900/50 p-6 rounded-lg border border-green-400/30">
            <div className="text-gray-300 text-sm mb-2">Current CO2 Emissions</div>
            <div className="text-4xl font-bold font-mono text-green-400 mb-2">
              {co2Value.toFixed(2)}
              <span className="text-lg text-gray-300 ml-2">ppm</span>
            </div>
            <div className="text-xs text-gray-400">
              Unique value for coordinates: {receivedCoords ? `${receivedCoords.lat}, ${receivedCoords.lng}` : 'Unknown'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Emission Level</span>
              <span className="text-gray-300">{((co2Value / 600) * 100).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-red-400 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${Math.min((co2Value / 600) * 100, 100)}%`
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>0 ppm</span>
              <span>600+ ppm</span>
            </div>
          </div>
          
          {/* CO2 Level Indicator */}
          <div className={`p-4 rounded-lg border ${
            co2Value > 500 ? 'bg-red-900/20 border-red-500/30 text-red-300' :
            co2Value > 400 ? 'bg-yellow-900/20 border-yellow-500/30 text-yellow-300' :
            'bg-green-900/20 border-green-500/30 text-green-300'
          }`}>
            <p className="font-semibold text-lg">
              {co2Value > 500 ? '🔴 Very High Emissions' :
               co2Value > 400 ? '🟡 High Emissions' :
               '🟢 Moderate Emissions'}
            </p>
            <p className="text-sm mt-2">
              {co2Value > 500 ? 'Critical levels detected - immediate environmental action required' :
               co2Value > 400 ? 'Above average emissions - consider carbon reduction measures' :
               'Within acceptable range - continue monitoring'}
            </p>
          </div>
          
          {/* Raw Data Display */}
          <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
            <h4 className="text-green-400 font-semibold mb-3">Raw Backend Response:</h4>
            <pre className="text-xs text-gray-300 bg-black/30 p-3 rounded overflow-auto">
              {JSON.stringify(metrics, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-center p-6 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400 mb-4 text-lg">❌ CO2 emissions data not available</p>
          <div className="space-y-2 text-sm">
            <p className="text-gray-400">
              {coordinates ? 'Data received but CO2 value not found' : 'Please select a location on the map first.'}
            </p>
            <div className="bg-black/30 p-3 rounded text-xs text-gray-300">
              <strong>Expected:</strong> co2_emissions field<br/>
              <strong>Received:</strong> {JSON.stringify(metrics)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Predictions Content Component
const PredictionsContent = ({ data }: { data: any }) => {
  const dummyProjections = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Carbon Density (tons/km²)',
        data: [300, 310, 320, 330, 340, 350],
        borderColor: '#7dd956',
        backgroundColor: 'rgba(125, 217, 86, 0.2)',
        fill: true,
      },
    ],
  };

  const chartData = data && data.datasets && data.datasets[0] && Array.isArray(data.datasets[0].data) ? data : dummyProjections;

  return (
    <div className="text-gray-300 space-y-4">
      <p><strong className="text-green-400">Predicted Carbon Density:</strong> {chartData.datasets[0].data[chartData.datasets[0].data.length - 1]} tons/km²</p>
      <div>
        <p className="text-green-400 font-semibold mb-3">Future Projections:</p>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart
              data={chartData.labels.map((label: string, index: number) => ({ name: label, 'Carbon Density': chartData.datasets[0].data[index] }))}
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
              <Tooltip contentStyle={{ backgroundColor: 'transparent', border: 'none' }} itemStyle={{ color: '#e6edf3' }} />
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
};

// Suggestions Content Component
const SuggestionsContent = ({ policies }: { policies: string[] }) => (
  <div className="text-gray-300 space-y-4">
    <p className="text-green-400 font-semibold">Based on our analysis, here are key policy recommendations to combat urban carbon emissions:</p>
    <ul className="space-y-4">
      {policies.map((policy, index) => (
        <li key={index} className="bg-emerald-900/30 rounded-lg p-4 border border-green-400/20">
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
    className={`w-full flex items-center gap-4 p-4 rounded-lg bg-emerald-900/30 border border-green-400/20 transition-all duration-300 text-white backdrop-blur-sm ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-400/10 hover:border-green-400/40 hover:text-green-400 group'}`}
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
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
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
    console.log('🖱️ Metrics button clicked - current data:', metricsData);
    console.log('🖱️ Selected coordinates:', selectedCoordinates);
    console.log('🖱️ Last fetch time:', lastFetchTime);
    
    // Force re-render with current data and timestamp
    const metricsContent = (
      <MetricsContent 
        metrics={metricsData} 
        coordinates={selectedCoordinates}
        timestamp={lastFetchTime}
      />
    );
    openModal('Performance Metrics', metricsContent);
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

  const fetchLocationData = async () => {
    if (!selectedCoordinates) {
      openModal('Error', <p className="text-red-400">Please select a location on the map first by clicking on it.</p>);
      return;
    }

    setIsLoading(true);
    
    // Clear existing data to force refresh
    setMetricsData(null);
    setProjectionsData(null);
    setDataReceived(false);
    
    try {
      const lat = selectedCoordinates.lat;
      const lng = selectedCoordinates.lng;
      const timestamp = Date.now(); // Add timestamp to prevent caching

      console.log('🚀 Fetching fresh data for coordinates:', lat, lng);

      // Fetch metrics data with cache busting
      const metricsUrl = `https://carbonescompass.vercel.app/api/metrics?lat=${lat}&lng=${lng}&t=${timestamp}`;
      console.log('📡 Calling metrics API:', metricsUrl);
      
      const metricsResponse = await fetch(metricsUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      console.log('📊 Metrics response status:', metricsResponse.status);
      
      if (!metricsResponse.ok) {
        throw new Error(`Metrics API returned ${metricsResponse.status}: ${metricsResponse.statusText}`);
      }
      
      const metrics = await metricsResponse.json();
      console.log('🔍 Raw metrics received:', JSON.stringify(metrics, null, 2));
      console.log('🔍 CO2 value extracted:', metrics.co2_emissions);
      
      // Create completely new object to force React re-render
      const newMetrics = {
        ...metrics,
        fetchedAt: timestamp,
        locationKey: `${lat}-${lng}`
      };
      
      setMetricsData(newMetrics);
      setLastFetchTime(timestamp);

      // Fetch projections data with cache busting
      const projectionsUrl = `https://carbonescompass.vercel.app/api/projections?lat=${lat}&lng=${lng}&t=${timestamp}`;
      const projectionsResponse = await fetch(projectionsUrl, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (!projectionsResponse.ok) {
        throw new Error(`Projections API returned ${projectionsResponse.status}: ${projectionsResponse.statusText}`);
      }
      
      const projections = await projectionsResponse.json();
      console.log('🔍 Raw projections received:', JSON.stringify(projections, null, 2));
      setProjectionsData({...projections}); // Spread to ensure new object reference

      setDataReceived(true);
      
      // Show success modal with actual CO2 value
      const co2Value = metrics.co2_emissions || metrics.co2Emissions || metrics.co2 || metrics.emissions;
      openModal('Data Status', 
        <div>
          <p className="text-green-400 mb-2">✅ Data successfully received from backend!</p>
          <p className="text-gray-300 text-sm">Location: {lat}, {lng}</p>
          <p className="text-gray-300 text-sm">CO2 Level: <span className="text-green-400 font-bold">{co2Value ? co2Value.toFixed(2) + ' ppm' : 'N/A'}</span></p>
          <p className="text-gray-300 text-sm mt-2">You can now view metrics and projections.</p>
        </div>
      );
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      openModal('Error', 
        <div>
          <p className="text-red-400 mb-2">❌ Failed to receive data from backend.</p>
          <p className="text-gray-300 text-sm">Error: {error.message}</p>
          <p className="text-gray-300 text-sm mt-2">Please check if the backend server is running.</p>
        </div>
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-white relative overflow-hidden">
      {/* Background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900/80 via-black to-emerald-900/60 -z-10" />
      
      {/* Dashboard Container */}
      <div className="flex h-screen pt-4">
        {/* Sidebar */}
        <aside className="w-80 p-6 bg-emerald-900/20 backdrop-blur-lg border-r border-green-400/20 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-8 text-center">
              Carbon Compass 🌱
              <div className="text-sm text-blue-400 font-normal mt-1">Navigation Dashboard</div>
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
            <div className="bg-emerald-900/50 backdrop-blur-sm p-4 rounded-lg border border-green-400/30">
              <div className="text-green-400 font-semibold mb-2">Current Coordinates</div>
              <div className="flex justify-between text-sm font-mono">
                <span>Lat: {selectedCoordinates ? selectedCoordinates.lat : coordinates.lat}</span>
                <span>Lng: {selectedCoordinates ? selectedCoordinates.lng : coordinates.lng}</span>
              </div>
              {selectedCoordinates && (
                <div className="text-xs text-green-300 mt-1">✓ Location Selected</div>
              )}
            </div>
            
            <button 
              className={`w-full flex items-center justify-center gap-2 p-3 rounded-lg font-semibold transition-all duration-300 ${
                isLoading 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-500 text-white'
              }`}
              onClick={fetchLocationData}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>📡</span>
                  <span>Get Data</span>
                </>
              )}
            </button>
            
            {/* Status indicator */}
            {dataReceived && (
              <div className="text-center text-xs text-green-400 bg-green-900/20 p-2 rounded">
                ✅ Data loaded for selected location
              </div>
            )}
            
            {/* Copyright */}
            <div className="text-center text-xs text-gray-400">
              © 2025 Carbon Compass Inc.
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 bg-emerald-900/10 backdrop-blur-lg">
          <div 
            ref={mapContainer} 
            className="w-full h-full rounded-lg border border-green-400/20 bg-emerald-900/20 backdrop-blur-sm"
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