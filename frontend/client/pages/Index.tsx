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
  const [currentMetric, setCurrentMetric] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [compassBearing, setCompassBearing] = useState(45);
  
  const keyMetrics = [
    { value: 2847, label: "Current Emission Coordinates", color: "text-red-400", bearing: "SW" },
    { value: 23, label: "Commission Progress", color: "text-lime", suffix: "%", bearing: "NE" },
    { value: 156, label: "Cities Navigated", color: "text-electric", bearing: "N" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric(prev => (prev + 1) % keyMetrics.length);
      setCompassBearing(prev => (prev + 30) % 360);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    const element = document.getElementById('metrics');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
            <span className="hindi-english">Emission Ka Commission</span> ✨
          </div>
          
          {/* Compass-style Metrics Display */}
          <div className="grid md:grid-cols-3 gap-8 mb-8 max-w-4xl mx-auto">
            {keyMetrics.map((metric, index) => (
              <div
                key={index}
                className={`glass rounded-xl p-6 transform transition-all duration-500 flex flex-col items-center ${
                  currentMetric === index ? 'scale-105 border-lime/50' : 'scale-100'
                }`}
              >
                <div className="mb-4 flex justify-center">
                  <CompassProgress value={index === 1 ? metric.value : Math.min((metric.value / 50), 100)} label="" bearing={metric.bearing || "N"} />
                </div>
                <div className={`text-2xl font-bold font-mono mb-2 ${metric.color}`}>
                  <AnimatedCounter end={metric.value} suffix={metric.suffix || ""} />
                </div>
                <div className="text-sm text-gray-300 text-center">{metric.label}</div>
              </div>
            ))}
          </div>
          
          <button className="group bg-lime hover:bg-lime/90 text-emerald-deep font-bold py-4 px-8 text-lg rounded-lg transition-all duration-300 hover:scale-105 animate-pulse-glow inline-flex items-center gap-2 font-montserrat">
            Start Navigation
            <CompassIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>
      </section>

      {/* Core Features Section */}
      <section id="navigate" className="py-20 lg:py-32 bg-emerald-deep/20">
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

      {/* Dashboard Preview Section */}
      <section id="monitor" className="py-20 lg:py-32 bg-emerald-deep/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-6">
              Your <span className="text-electric">Navigation Center</span> for <span className="text-lime">Carbon Management</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Compass-inspired interface designed for navigating urban carbon reduction strategies.
            </p>
          </div>
          
          {/* Dashboard Mockup */}
          <div className="glass rounded-2xl p-8 max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-6 h-96">
              {/* Left Panel - Navigation Menu */}
              <div className="bg-emerald-deep/50 rounded-xl p-4 border border-lime/30">
                <h4 className="text-lime font-semibold mb-4 flex items-center gap-2">
                  <CompassIcon className="h-4 w-4" />
                  Navigation Controls
                </h4>
                <div className="space-y-3">
                  {['Dashboard', 'Navigate', 'Track', 'Guide', 'Coordinates'].map((item, index) => (
                    <div key={item} className="flex items-center gap-3 p-2 rounded bg-emerald-deep/30 hover:bg-lime/10 transition-colors cursor-pointer">
                      <span className="text-xs text-electric font-bold w-6">{['N', 'NE', 'E', 'SE', 'S'][index]}</span>
                      <span className="text-sm text-white">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Center Panel - 3D Compass Map */}
              <div className="bg-emerald-deep/50 rounded-xl p-4 border border-electric/30">
                <h4 className="text-electric font-semibold mb-4 flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Emission Compass Map
                </h4>
                <div className="relative h-full bg-gradient-to-br from-red-900/20 to-emerald-900/20 rounded-lg overflow-hidden flex items-center justify-center">
                  <CarbonCompass size="small" />
                  {/* Emission hotspots */}
                  <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-red-500/60 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-yellow-500/60 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-lime/60 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
              
              {/* Right Panel - Commission Metrics */}
              <div className="bg-emerald-deep/50 rounded-xl p-4 border border-lime/30">
                <h4 className="text-lime font-semibold mb-4 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Commission Progress
                </h4>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Carbon Commission</span>
                      <span className="text-lime font-mono">23%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-lime h-2 rounded-full w-1/4"></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Navigation Accuracy</span>
                      <span className="text-electric font-mono">95%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-electric h-2 rounded-full w-5/6"></div>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-lime/10 rounded border border-lime/30">
                    <div className="text-xs text-lime font-semibold">Next Bearing:</div>
                    <div className="text-sm text-white">Optimize traffic flow (NE sector)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics Section */}
      <section id="insights" className="py-20 lg:py-32 network-bg">
        <div className="max-w-7xl mx-auto px-6 lg:px-8" id="metrics">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-6">
              Navigate to <span className="text-lime">Measurable Commission</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Real compass bearings showing successful navigation toward carbon neutrality.
            </p>
          </div>
          
          {/* Compass-style Progress Indicators */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <div className="flex flex-col items-center text-center">
              <CompassProgress value={78} label="Carbon Reduced" bearing="NE" />
              <div className="mt-4">
                <div className="text-2xl font-bold text-lime mb-1 font-mono">
                  {isVisible && <AnimatedCounter end={2340000} />}
                </div>
                <div className="text-sm text-gray-300">Tons CO₂ Navigated Away</div>
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <CompassProgress value={92} label="Cities Navigated" bearing="E" />
              <div className="mt-4">
                <div className="text-2xl font-bold text-electric mb-1 font-mono">
                  {isVisible && <AnimatedCounter end={156} />}
                </div>
                <div className="text-sm text-gray-300">Cities on Course</div>
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <CompassProgress value={95} label="Course Corrections" bearing="SE" />
              <div className="mt-4">
                <div className="text-2xl font-bold text-lime mb-1 font-mono">
                  {isVisible && <AnimatedCounter end={98500} />}
                </div>
                <div className="text-sm text-gray-300">Navigation Adjustments</div>
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <CompassProgress value={87} label="Green Routes" bearing="S" />
              <div className="mt-4">
                <div className="text-2xl font-bold text-electric mb-1 font-mono">
                  {isVisible && <AnimatedCounter end={847} />}
                </div>
                <div className="text-sm text-gray-300">Sustainable Pathways</div>
              </div>
            </div>
          </div>
          
          {/* Commission Achievement Badges */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass rounded-xl p-6 border border-lime/30">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-6 w-6 text-lime" />
                <h4 className="text-xl font-bold font-montserrat">San Francisco Navigation</h4>
                <span className="text-xs bg-lime/20 text-lime px-2 py-1 rounded">COMMISSION ACHIEVED</span>
              </div>
              <p className="text-gray-300 mb-3">
                Successfully navigated 31% reduction in transportation emissions through AI-optimized compass guidance.
              </p>
              <div className="text-sm text-lime font-semibold">
                Final Bearing: 450,000 tons CO₂ commission annually
              </div>
            </div>
            
            <div className="glass rounded-xl p-6 border border-electric/30">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-6 w-6 text-electric" />
                <h4 className="text-xl font-bold font-montserrat">Amsterdam Route Completion</h4>
                <span className="text-xs bg-electric/20 text-electric px-2 py-1 rounded">COMMISSION ACHIEVED</span>
              </div>
              <p className="text-gray-300 mb-3">
                Reached carbon neutrality destination in city center through precision compass navigation and smart routing.
              </p>
              <div className="text-sm text-electric font-semibold">
                Final Bearing: 100% renewable energy coordinates reached
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="commission" className="py-20 lg:py-32 bg-emerald-deep relative overflow-hidden">
        {/* Constellation Navigation Pattern */}
        <div className="absolute inset-0">
          {/* Star pattern suggesting navigation */}
          {Array.from({ length: 50 }, (_, i) => (
            <ConstellationStar 
              key={i}
              x={Math.random() * 100} 
              y={Math.random() * 100} 
              size={Math.random() * 3 + 1}
              delay={Math.random() * 3}
            />
          ))}
          
          {/* Constellation lines forming compass directions */}
          <svg className="absolute inset-0 w-full h-full opacity-30">
            <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="rgba(0, 212, 255, 0.4)" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="rgba(0, 212, 255, 0.4)" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="rgba(125, 217, 86, 0.4)" strokeWidth="1" strokeDasharray="5,5" />
            <line x1="80%" y1="20%" x2="20%" y2="80%" stroke="rgba(125, 217, 86, 0.4)" strokeWidth="1" strokeDasharray="5,5" />
          </svg>
        </div>
        
        {/* Carbon Compass pointing toward "Sustainable Future" */}
        <div className="absolute top-10 left-1/2 transform -translate-x-1/2 opacity-40">
          <CarbonCompass size="large" />
          <div className="text-center mt-4 text-lime font-bold text-sm">
            → Carbon Neutrality
          </div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-montserrat mb-6 text-white">
            Chart Your Course to <br />
            <span className="text-lime">Carbon Neutrality</span>
          </h2>
          
          <div className="text-2xl md:text-3xl text-electric mb-6 font-bold">
            <span className="hindi-english">Emission Ka Commission</span> ✨
          </div>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
            Join 50+ cities using Carbon Compass to navigate emission reduction
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <button className="bg-lime hover:bg-lime/90 text-emerald-deep font-bold py-4 px-8 text-lg rounded-lg transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 font-montserrat group">
              Start Your Journey
              <CompassIcon className="h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
            </button>
            
            <button className="bg-transparent border-2 border-electric text-electric hover:bg-electric hover:text-emerald-deep font-bold py-4 px-8 text-lg rounded-lg transition-all duration-300 hover:scale-105 inline-flex items-center gap-2 font-montserrat">
              View Success Routes
              <Map className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-sm text-gray-300">
            <Star className="h-4 w-4 text-electric" />
            <span>Trusted navigation by government agencies worldwide</span>
            <Star className="h-4 w-4 text-lime" />
            <span>Compass-certified accuracy</span>
            <Star className="h-4 w-4 text-electric" />
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
              © 2024 Carbon Compass. Navigate toward sustainable cities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
