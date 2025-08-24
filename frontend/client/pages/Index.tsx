import Navigation from '@/components/Navigation';
import {
  Navigation as CompassIcon,
  Radar,
  Route,
  Satellite,
  Activity,
  Wind,
  Zap,
  MapPin,
  BarChart3,
  Users,
  Target,
  CheckCircle,
  ArrowRight,
  Database,
  Wifi,
  Eye,
  Shield,
  Globe,
  Award,
  TrendingUp,
  Crosshair,
  Map,
  Star
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Animated counter component
const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [end, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Compass progress component
const CompassProgress = ({ value, label, bearing }: { value: number; label: string; bearing: string }) => {
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="rgba(125, 217, 86, 0.2)"
          strokeWidth="4"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#7dd956"
          strokeWidth="4"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        {/* Compass markings */}
        <g transform="translate(50,50)">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={i}
              x1="0"
              y1="-38"
              x2="0"
              y2="-42"
              stroke="#00d4ff"
              strokeWidth="1"
              transform={`rotate(${angle})`}
            />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-2xl font-bold text-lime font-mono">{value}%</div>
        <div className="text-xs text-electric">{bearing}</div>
      </div>
      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-sm text-white font-medium">{label}</div>
      </div>
    </div>
  );
};

// Constellation star component
const ConstellationStar = ({ x, y, size = 2, delay = 0 }: { x: number; y: number; size?: number; delay?: number }) => (
  <div
    className="absolute bg-electric rounded-full animate-pulse"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      animationDelay: `${delay}s`,
    }}
  />
);

// Simple Carbon Compass - representing navigation toward carbon neutrality
const CarbonCompass = ({ size = 'medium', pointToGreen = true }: { size?: 'small' | 'medium' | 'large'; pointToGreen?: boolean }) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24'
  };

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {/* Compass circle */}
      <div className="absolute inset-0 border-2 border-lime/60 rounded-full bg-emerald-deep/30">
        {/* Main directions - showing path to sustainability */}
        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-lime">🌱</div>
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-400">🏭</div>

        {/* Needle pointing toward green/sustainable future */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 h-6 bg-lime origin-bottom transform -translate-x-1/2 -translate-y-full transition-all duration-1000"
          style={{ transform: `translateX(-50%) translateY(-100%) rotate(-90deg)` }}
        >
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-lime rounded-full"></div>
        </div>

        {/* Center point */}
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-electric rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Label for clarity */}
      {size === 'large' && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-xs text-lime font-medium">Carbon Neutrality</div>
        </div>
      )}
    </div>
  );
};

export default function Index() {
  const [co2Emission, setCo2Emission] = useState<number | null>(null);
  const [policies, setPolicies] = useState<string[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const navigate = useNavigate();

  // Fetch CO2 Metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Using dummy lat/lng for now, ideally these would come from user input or geolocation
        const lat = 28.7041;
        const lng = 77.1025;
        const response = await fetch(`/api/metrics?lat=${lat}&lng=${lng}`);
        const data = await response.json();
        if (data && typeof data.co2_emissions === 'number') {
          setCo2Emission(data.co2_emissions);
        } else {
          // Fallback to dummy data if API fails or returns unexpected format
          setCo2Emission(100); // Dummy CO2 emission
        }
      } catch (error) {
        console.error("Error fetching CO2 metrics:", error);
        setCo2Emission(100); // Dummy CO2 emission on error
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, []);

  // Fetch Policies based on CO2 Metrics
  useEffect(() => {
    if (co2Emission !== null) {
      const fetchPolicies = async () => {
        try {
          const response = await fetch(`/api/policies?co2_level=${co2Emission}`);
          const data = await response.json();
          if (Array.isArray(data)) {
            setPolicies(data);
          } else if (typeof data === 'string') {
            setPolicies([data]); // If Gemini returns a single string, wrap it in an array
          } else {
            setPolicies(["No specific policies generated for this CO2 level."]);
          }
        } catch (error) {
          console.error("Error fetching policies:", error);
          setPolicies(["Failed to load policies. Please try again later."]);
        } finally {
          setLoadingPolicies(false);
        }
      };
      fetchPolicies();
    }
  }, [co2Emission]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center gradient-dark">
        {/* Constellation Background */}
        <div className="absolute inset-0 overflow-hidden">
          <ConstellationStar x={10} y={20} size={3} delay={0} />
          <ConstellationStar x={90} y={15} size={2} delay={1} />
          <ConstellationStar x={20} y={80} size={4} delay={2} />
          <ConstellationStar x={80} y={75} size={2} delay={0.5} />
          <ConstellationStar x={50} y={30} size={3} delay={1.5} />
          <ConstellationStar x={70} y={60} size={2} delay={2.5} />
          <ConstellationStar x={30} y={50} size={3} delay={1} />
          <ConstellationStar x={85} y={40} size={2} delay={2} />

          {/* Constellation lines */}
          <svg className="absolute inset-0 w-full h-full">
            <line x1="10%" y1="20%" x2="50%" y2="30%" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" />
            <line x1="50%" y1="30%" x2="90%" y2="15%" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" />
            <line x1="70%" y1="60%" x2="80%" y2="75%" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" />
            <line x1="20%" y1="80%" x2="30%" y2="50%" stroke="rgba(0, 212, 255, 0.3)" strokeWidth="1" />
          </svg>
        </div>


        <div className="relative z-10 text-center max-w-6xl mx-auto px-6 pt-24 lg:pt-32">

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-montserrat mb-6 leading-tight">
            Navigate Your City Toward <br />
            <span className="text-lime">Carbon Neutrality</span>
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 max-w-4xl mx-auto font-light leading-relaxed">
            Your trusted compass for emission tracking, prediction, and reduction strategies
          </p>

          <div className="text-2xl md:text-3xl text-electric mb-8 font-bold">
            <span className="hindi-english">Emission Ka Commission</span> 💸
          </div>


          <button onClick={() => navigate('/navigate')} className="group bg-lime hover:bg-lime/90 text-emerald-deep font-bold py-4 px-8 text-lg rounded-lg transition-all duration-300 hover:scale-105 animate-pulse-glow inline-flex items-center gap-2 font-montserrat">
            Start Navigation
            <CompassIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>
      </section>

      {/* CO2 Metrics Section */}
      <section id="metrics" className="py-20 lg:py-32 bg-emerald-deep/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-6">
              Current <span className="text-lime">CO2 Emissions</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real-time insights into your city's carbon footprint.
            </p>
          </div>

          <div className="flex justify-center items-center">
            {loadingMetrics ? (
              <p className="text-electric text-lg">Loading CO2 metrics...</p>
            ) : (
              <div className="glass rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold font-montserrat mb-4 text-white">Predicted CO2 PPM</h3>
                <p className="text-lime text-6xl font-bold font-mono">
                  <AnimatedCounter end={co2Emission || 0} suffix="ppm" />
                </p>
                <p className="text-gray-400 mt-4">
                  This value represents the predicted CO2 levels in parts per million.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Policy Recommendations Section */}
      <section id="policies" className="py-20 lg:py-32 network-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-6">
              Policy <span className="text-lime">Recommendations</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Guidance for urban carbon management based on current CO2 levels.
            </p>
          </div>

          <div className="flex justify-center">
            {loadingPolicies ? (
              <p className="text-electric text-lg">Generating policies...</p>
            ) : (
              <ul className="list-disc list-inside text-left text-gray-300 space-y-3 max-w-2xl">
                {policies.map((policy, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-lime mr-2 mt-1 flex-shrink-0" />
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* Core Features Section (renamed from navigate to avoid ID conflict) */}
      <section id="core-features" className="py-20 lg:py-32 bg-emerald-deep/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-6">
              Your <span className="text-lime">Navigation</span> Command Center
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Chart your course to carbon neutrality with precision navigation tools and AI-powered guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Navigate */}
            <div className="group glass rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:border-lime/30 relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-electric bg-electric/20 px-2 py-1 rounded">NE</div>
              <div className="w-16 h-16 bg-electric/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-electric/30 transition-colors duration-300 relative">
                <CompassIcon className="h-8 w-8 text-electric group-hover:rotate-12 transition-transform duration-300" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-lime/30 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-3 w-3 text-lime" />
                </div>
              </div>
              <h3 className="text-2xl font-bold font-montserrat mb-4 text-white group-hover:text-electric transition-colors duration-300">
                AI-Powered Direction
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Find your path to emission reduction with 95% accuracy using advanced compass-based navigation algorithms.
              </p>
              <div className="text-sm text-electric font-semibold">
                ✓ Future trend bearings<br />
                ✓ Weather impact navigation<br />
                ✓ Route optimization predictions
              </div>
              <div className="mt-4 opacity-30">
                <CarbonCompass size="small" />
              </div>
            </div>

            {/* Track */}
            <div className="group glass rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:border-lime/30 relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-lime bg-lime/20 px-2 py-1 rounded">E</div>
              <div className="w-16 h-16 bg-lime/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-lime/30 transition-colors duration-300 relative">
                <Radar className="h-8 w-8 text-lime" />
                <div className="absolute top-0 right-0 w-3 h-3 bg-electric rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-2xl font-bold font-montserrat mb-4 text-white group-hover:text-lime transition-colors duration-300">
                Real-Time Tracking
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Monitor emission coordinates across all city sectors with our comprehensive tracking compass network.
              </p>
              <div className="text-sm text-lime font-semibold">
                ✓ 500+ tracking coordinates<br />
                ✓ Satellite navigation sync<br />
                ✓ Live emission bearings
              </div>
              <div className="mt-4 opacity-30">
                <CarbonCompass size="small" />
              </div>
            </div>

            {/* Guide */}
            <div className="group glass rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:border-lime/30 relative">
              <div className="absolute top-4 right-4 text-xs font-bold text-electric bg-electric/20 px-2 py-1 rounded">SE</div>
              <div className="w-16 h-16 bg-electric/20 rounded-full flex items-center justify-center mb-6 group-hover:bg-electric/30 transition-colors duration-300 relative">
                <Route className="h-8 w-8 text-electric" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-lime/50 rounded-full flex items-center justify-center">
                  <Target className="h-2 w-2 text-emerald-deep" />
                </div>
              </div>
              <h3 className="text-2xl font-bold font-montserrat mb-4 text-white group-hover:text-electric transition-colors duration-300">
                Smart Guidance
              </h3>
              <p className="text-gray-300 leading-relaxed mb-4">
                Get turn-by-turn directions for carbon reduction strategies with compass-guided route planning.
              </p>
              <div className="text-sm text-electric font-semibold">
                ✓ Policy navigation routes<br />
                ✓ Resource compass optimization<br />
                ✓ Commission pathway analysis
              </div>
              <div className="mt-4 opacity-30">
                <CarbonCompass size="small" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources Section */}
      <section id="data-points" className="py-20 lg:py-32 network-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-6">
              Multi-Directional <span className="text-lime">Data Navigation</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Navigating 500+ data coordinates across urban infrastructure with compass precision.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* 3D Compass Center with Data Flows */}
            <div className="relative">
              <div className="relative w-full h-96 flex items-center justify-center">
                {/* Central Hub Text */}
                <div className="relative z-10 text-center">
                  <div className="text-lime font-bold text-xl">Navigation Hub</div>
                  <div className="text-electric text-sm">Data Coordinates</div>
                </div>

                {/* Data Source Icons with Compass Bearings */}
                <div className="absolute inset-0">
                  {/* North - Satellite */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <div className="w-12 h-12 bg-electric/20 rounded-full flex items-center justify-center animate-float mb-2">
                      <Satellite className="h-6 w-6 text-electric" />
                    </div>
                    <div className="text-xs text-electric font-bold">N</div>
                  </div>

                  {/* East - IoT Sensors */}
                  <div className="absolute top-1/2 right-8 transform -translate-y-1/2 flex flex-col items-center">
                    <div className="w-12 h-12 bg-lime/20 rounded-full flex items-center justify-center animate-float mb-2" style={{ animationDelay: '1s' }}>
                      <Wifi className="h-6 w-6 text-lime" />
                    </div>
                    <div className="text-xs text-lime font-bold">E</div>
                  </div>

                  {/* South - Traffic Monitor */}
                  <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                    <div className="w-12 h-12 bg-electric/20 rounded-full flex items-center justify-center animate-float mb-2" style={{ animationDelay: '2s' }}>
                      <Activity className="h-6 w-6 text-electric" />
                    </div>
                    <div className="text-xs text-electric font-bold">S</div>
                  </div>

                  {/* West - Air Quality */}
                  <div className="absolute top-1/2 left-8 transform -translate-y-1/2 flex flex-col items-center">
                    <div className="w-12 h-12 bg-lime/20 rounded-full flex items-center justify-center animate-float mb-2" style={{ animationDelay: '0.5s' }}>
                      <Wind className="h-6 w-6 text-lime" />
                    </div>
                    <div className="text-xs text-lime font-bold">W</div>
                  </div>
                </div>

                {/* Compass bearing lines */}
                <div className="absolute inset-0">
                  <div className="absolute top-20 left-1/2 w-px h-20 bg-gradient-to-b from-electric/60 to-transparent transform -translate-x-1/2"></div>
                  <div className="absolute top-1/2 right-20 w-20 h-px bg-gradient-to-l from-lime/60 to-transparent transform -translate-y-1/2"></div>
                  <div className="absolute bottom-20 left-1/2 w-px h-20 bg-gradient-to-t from-electric/60 to-transparent transform -translate-x-1/2"></div>
                  <div className="absolute top-1/2 left-20 w-20 h-px bg-gradient-to-r from-lime/60 to-transparent transform -translate-y-1/2"></div>
                </div>
              </div>
            </div>

            <div>
              <div className="space-y-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[60px]">
                    <Satellite className="h-5 w-5 text-electric" />
                    <span className="text-xs font-bold text-electric">N</span>
                  </div>
                  <span className="text-gray-300">Satellite imagery and atmospheric navigation</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[60px]">
                    <Wifi className="h-5 w-5 text-lime" />
                    <span className="text-xs font-bold text-lime">E</span>
                  </div>
                  <span className="text-gray-300">IoT sensor coordinate network</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[60px]">
                    <Activity className="h-5 w-5 text-electric" />
                    <span className="text-xs font-bold text-electric">S</span>
                  </div>
                  <span className="text-gray-300">Traffic flow navigation analysis</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 min-w-[60px]">
                    <Wind className="h-5 w-5 text-lime" />
                    <span className="text-xs font-bold text-lime">W</span>
                  </div>
                  <span className="text-gray-300">Air quality compass monitoring</span>
                </div>
              </div>

              <div className="bg-lime/10 rounded-lg p-4 border border-lime/30">
                <p className="text-lime font-semibold flex items-center gap-2">
                  <Crosshair className="h-5 w-5" />
                  Navigating 500+ data coordinates with compass precision
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-lime/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 flex items-center gap-3">
              <div className="relative w-8 h-8 bg-gradient-to-br from-lime to-electric rounded-full flex items-center justify-center">
                <CompassIcon className="h-5 w-5 text-emerald-deep" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-montserrat text-white">
                  Carbon <span className="text-lime">Compass</span>
                </span>
                <span className="text-xs text-electric -mt-1">Emission Ka Commission</span>
              </div>
            </div>
            <p className="text-gray-400 text-center md:text-right">
              © 2025 Carbon Compass. Navigate toward sustainable cities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}