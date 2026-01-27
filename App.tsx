import React, { useState, useEffect, useRef } from 'react';
import { Icons } from './components/Icons';
import { ScreenName, TabName, ChatMessage, NavigationState, Charger } from './types';
import { askGemini } from './services/gemini';
import dohaMap from './assets/doha_map.png';

// --- Components ---

const Header = ({
  title,
  onBack,
  rightElement,
  subtitle,
  transparent = false,
  className = ''
}: {
  title?: string,
  onBack?: () => void,
  rightElement?: React.ReactNode,
  subtitle?: string,
  transparent?: boolean,
  className?: string
}) => (
  <div className={`flex items-center justify-between px-4 pb-4 pt-14 sticky top-0 z-30 transition-colors ${transparent ? 'bg-transparent' : 'bg-white'} ${className}`}>
    <div className="flex items-center gap-3">
      {onBack && (
        <button onClick={onBack} className={`p-2 rounded-full transition-colors ${transparent ? 'bg-white/20 hover:bg-white/30 text-white backdrop-blur-md' : 'hover:bg-slate-100 text-slate-800'}`}>
          <Icons.ArrowLeft className="w-6 h-6" />
        </button>
      )}
      <div>
        {title && <h1 className={`text-xl font-bold ${transparent ? 'text-white drop-shadow-md' : 'text-slate-900'}`}>{title}</h1>}
        {subtitle && <p className={`text-sm ${transparent ? 'text-white/90 drop-shadow-md' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
    {rightElement}
  </div>
);

const BottomNav = ({ activeTab, onTabChange }: { activeTab: TabName, onTabChange: (tab: TabName) => void }) => {
  const tabs: { id: TabName; label: string; Icon: React.ElementType; isSpecial?: boolean }[] = [
    { id: 'main', label: 'Home', Icon: Icons.Home },
    { id: 'cars', label: 'My Car', Icon: Icons.Car },
    { id: 'emergency', label: 'SOS', Icon: Icons.Help, isSpecial: true },
    { id: 'insurance', label: 'Insure', Icon: Icons.Shield },
    { id: 'city', label: 'City', Icon: Icons.Grid },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 pt-3 px-4 flex justify-between items-end z-50 h-28 shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (tab.isSpecial) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative -top-6 flex flex-col items-center justify-center px-2 group"
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95 border-4 border-slate-50 ${isActive ? 'bg-red-600 text-white' : 'bg-red-500 text-white'}`}>
                <tab.Icon className="w-8 h-8 stroke-2" />
              </div>
              <span className={`text-xs font-bold mt-1 ${isActive ? 'text-red-600' : 'text-red-500'}`}>{tab.label}</span>
            </button>
          )
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1.5 pb-6 transition-all duration-300 active:scale-90 ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
          >
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-600 mb-1 absolute -top-1" />}
            <tab.Icon className={`w-7 h-7 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

// --- Map Component ---

// --- Map Component ---

const MapContainer = ({
  children,
  className = "",
  dark = false,
  zoom = 1
}: {
  children?: React.ReactNode,
  className?: string,
  dark?: boolean,
  zoom?: number
}) => {
  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`}>
      {/* Map Background Pattern */}
      <div
        className="absolute inset-0 opacity-100"
        style={{
          backgroundImage: `url(${dohaMap})`, // AI Generated clean map
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: dark ? 'invert(1) hue-rotate(180deg) grayscale(0.2) contrast(1.2)' : 'grayscale(0) contrast(1.0)',
          transform: `scale(${zoom})`
        }}
      />

      {/* User Location Pulse */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-20"></div>
        <div className="absolute w-12 h-12 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
        <div className="absolute w-24 h-24 bg-blue-500 rounded-full opacity-10 animate-pulse"></div>
      </div>

      {/* Map Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
        <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-slate-700 active:scale-90 transition-transform">
          <Icons.Locate className="w-5 h-5" />
        </button>
      </div>

      {children}
    </div>
  );
};

// --- Screens ---

// 1. Home Screen
const HomeScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setChatOpen(true);
    setMessages(prev => [...prev, { role: 'user', text: prompt }]);
    setPrompt('');
    setIsAiLoading(true);

    const response = await askGemini(prompt);

    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsAiLoading(false);
  };

  return (
    <div className="pb-24 min-h-full bg-slate-50">
      {/* Header Area */}
      <div className="px-5 pb-5 pt-14 flex justify-between items-center bg-white sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Icons.Home className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Welcome,</p>
            <h2 className="text-lg font-bold text-slate-900">Dear Friend!</h2>
          </div>
        </div>
        <div className="bg-white border border-slate-100 shadow-sm rounded-full px-5 py-3 flex items-center gap-3">
          <span className="font-bold text-xl text-slate-900">1000</span>
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500" />
        </div>
      </div>

      {/* Explore Scroller */}
      <div className="flex gap-4 overflow-x-auto px-5 py-4 no-scrollbar">
        <div
          onClick={() => navigate('city')}
          className="min-w-[160px] h-[220px] bg-white rounded-3xl p-5 flex flex-col justify-between shadow-sm border border-slate-100 shrink-0 active:scale-95 transition-transform"
        >
          <h3 className="font-bold text-2xl leading-tight">Explore<br />Doha</h3>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <Icons.ArrowRight className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div
          onClick={() => navigate('feature_placeholder', { title: 'Ski Qatar', icon: 'Plane' })}
          className="min-w-[160px] h-[220px] bg-[url('https://images.unsplash.com/photo-1551524559-8af4e6624178?auto=format&fit=crop&q=80&w=300')] bg-cover rounded-3xl relative overflow-hidden shrink-0 active:scale-95 transition-transform"
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 text-white font-bold text-lg">Time to ski!</div>
        </div>
        <div
          onClick={() => navigate('feature_placeholder', { title: 'Rewards', icon: 'Zap' })}
          className="min-w-[160px] h-[220px] bg-gradient-to-br from-purple-400 to-blue-500 rounded-3xl p-5 flex flex-col justify-end text-white shrink-0 active:scale-95 transition-transform"
        >
          <div className="font-bold text-lg leading-tight">Your Coins<br />expire soon!</div>
        </div>
      </div>

      {/* AI Search */}
      <div className="px-5 mt-2">
        <div className="bg-white rounded-2xl p-2 flex items-center shadow-sm border border-slate-100 gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Icons.Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Ask us anything"
            className="flex-1 outline-none text-slate-700 placeholder-slate-400"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            onClick={handleAsk}
            className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center text-white shrink-0 hover:bg-indigo-800 transition-colors"
          >
            <Icons.ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Featured Car */}
      <div className="px-5 mt-8">
        <div className="bg-indigo-50 rounded-[32px] p-6 relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">JETOUR T2</h2>
              <button
                onClick={() => navigate('insurance_detail')}
                className="mt-6 bg-brand-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand-500/30 active:scale-95 transition-transform"
              >
                Insure
              </button>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=300"
            alt="Car"
            className="absolute right-[-40px] top-[20px] w-[260px] object-contain drop-shadow-2xl rotate-1"
          />

          <div className="grid grid-cols-2 gap-4 mt-10 z-10 relative">
            <div
              onClick={() => navigate('city')}
              className="bg-white/60 backdrop-blur-sm p-5 rounded-3xl flex items-center gap-3 active:scale-95 transition-transform cursor-pointer hover:bg-white/80 h-[120px]"
            >
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-lg leading-tight">Fix. Clean.<br />Maintain</div>
              </div>
              <Icons.Wrench className="w-8 h-8 text-brand-500" />
            </div>
            <div
              onClick={() => navigate('market')}
              className="bg-white/60 backdrop-blur-sm p-5 rounded-3xl active:scale-95 transition-transform cursor-pointer hover:bg-white/80 h-[120px] flex flex-col justify-center"
            >
              <div className="text-sm font-semibold text-slate-500">Buy & sell cars</div>
              <div className="font-bold text-brand-600 text-xl">qic•market</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-8">
        <h3 className="font-bold text-lg mb-4 text-slate-900">Quick actions</h3>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
          <div
            onClick={() => navigate('feature_placeholder', { title: 'HiWash Booking', icon: 'Wash' })}
            className="min-w-[160px] bg-indigo-700 rounded-3xl p-5 text-white flex flex-col justify-between h-[140px] active:scale-95 transition-transform"
          >
            <div className="font-bold text-lg leading-tight">Wash your car<br />at HiWash</div>
            <span className="text-sm opacity-80">Book now &rarr;</span>
          </div>
          <div
            onClick={() => navigate('emergency_hub')}
            className="min-w-[160px] bg-brand-500 rounded-3xl p-5 text-white flex flex-col justify-between h-[140px] active:scale-95 transition-transform"
          >
            <div className="font-bold text-lg leading-tight">Contact QIC<br />help center</div>
            <span className="text-sm opacity-80">Call 24/7 &rarr;</span>
          </div>
          <div
            onClick={() => navigate('feature_placeholder', { title: 'Invite Friends', icon: 'Heart' })}
            className="min-w-[160px] bg-pink-500 rounded-3xl p-5 text-white flex flex-col justify-between h-[140px] active:scale-95 transition-transform"
          >
            <div className="font-bold text-lg leading-tight">Invite<br />friends</div>
            <span className="text-sm opacity-80">Get coins &rarr;</span>
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white w-full sm:max-w-md h-[80vh] sm:rounded-3xl rounded-t-3xl flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">Doha Assistant</h3>
              <button onClick={() => setChatOpen(false)} className="p-2 hover:bg-slate-200 rounded-full"><Icons.Close className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${m.role === 'user' ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-slate-100 rounded-full px-4 py-3 outline-none text-sm"
                  placeholder="Type a message..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                />
                <button onClick={handleAsk} className="bg-brand-600 text-white p-3 rounded-full hover:bg-brand-700"><Icons.ArrowRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// 2. City Screen
const CityScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  return (
    <div className="pb-24 min-h-full bg-white">
      <div className="px-5 pb-5 pt-14">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">City</h1>

        {/* New Map Preview */}
        <div className="mb-6 h-[120px] rounded-3xl overflow-hidden relative shadow-sm" onClick={() => navigate('charging_navigator')}>
          <MapContainer className="h-full" zoom={0.8} />
          <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors pointer-events-none" />
          <div className="absolute bottom-3 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2">
            <Icons.MapPin className="w-4 h-4 text-brand-600" />
            <span className="text-xs font-bold text-slate-900">Open Map View</span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-slate-800 mb-4">Drive</h2>
        <div className="grid grid-cols-2 gap-4">
          {/* Market Card - Large */}
          <div
            onClick={() => navigate('market')}
            className="bg-slate-50 rounded-3xl p-4 relative h-[200px] border border-slate-100 overflow-hidden group active:scale-[0.98] transition-transform"
          >
            <span className="absolute top-4 right-4 bg-lime-400 text-black text-xs font-bold px-2 py-1 rounded-md rotate-3 shadow-sm z-10">New</span>
            <span className="font-bold text-lg text-slate-900 block mt-1">Market</span>
            <img
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=300"
              className="absolute bottom-2 right-[-20px] w-[180px] object-contain group-hover:scale-105 transition-transform"
              alt="Car"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div
              onClick={() => navigate('feature_placeholder', { title: 'Car Detailing', icon: 'Wash' })}
              className="bg-indigo-50 rounded-3xl p-4 h-[92px] relative overflow-hidden flex flex-col justify-center active:scale-[0.98] transition-transform"
            >
              <span className="font-bold text-slate-900 z-10">Detailing</span>
              <div className="mt-1 inline-flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-1 rounded-full w-max z-10 shadow-sm">
                <span className="text-xs font-bold">+2000</span>
                <div className="w-3 h-3 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500" />
              </div>
              <img src="https://picsum.photos/100/100?random=10" className="absolute right-0 bottom-0 w-16 h-16 rounded-tl-xl object-cover opacity-80" alt="Detailing" />
            </div>
            <div
              onClick={() => navigate('feature_placeholder', { title: 'Repairs', icon: 'Wrench' })}
              className="bg-slate-50 rounded-3xl p-4 h-[92px] relative overflow-hidden flex flex-col justify-center border border-slate-100 active:scale-[0.98] transition-transform"
            >
              <span className="font-bold text-slate-900">Repairs</span>
              <Icons.Wrench className="absolute right-3 bottom-3 text-slate-300 w-10 h-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Insurance Hub
const InsuranceScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  const items = [
    { name: 'Medical', icon: Icons.Medical, color: 'text-pink-500', bg: 'bg-pink-100' },
    { name: 'Personal accident', icon: Icons.Umbrella, color: 'text-indigo-500', bg: 'bg-indigo-100' },
    { name: 'Home contents', icon: Icons.Home, color: 'text-blue-500', bg: 'bg-blue-100' },
    { name: 'School fees protection', icon: Icons.Education, color: 'text-purple-500', bg: 'bg-purple-100' },
    { name: 'Boat and yacht', icon: Icons.Boat, color: 'text-cyan-500', bg: 'bg-cyan-100' },
    { name: 'Golf', icon: Icons.Zap, color: 'text-green-500', bg: 'bg-green-100' },
    { name: 'Business shield', icon: Icons.Business, color: 'text-slate-500', bg: 'bg-slate-100' },
    { name: 'Education', icon: Icons.Education, color: 'text-blue-600', bg: 'bg-blue-50' },
  ];

  return (
    <div className="pb-24 min-h-full bg-slate-50">
      <div className="bg-white px-4 pb-4 pt-14 flex justify-between items-end border-b border-slate-100 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-slate-900">Insurance 360</h1>
        <div className="flex items-center gap-1 text-brand-600 font-medium">
          <span>Get help</span>
          <Icons.Help className="w-5 h-5 fill-brand-600 text-white" />
        </div>
      </div>

      <div className="p-4 space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => navigate('insurance_detail')}
            className="bg-white p-6 rounded-3xl flex items-center justify-between shadow-sm active:scale-[0.99] transition-transform"
          >
            <span className="font-bold text-xl text-slate-800">{item.name}</span>
            <div className={`w-16 h-16 rounded-full ${item.bg} flex items-center justify-center`}>
              <item.icon className={`w-8 h-8 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. Insurance Detail (Policy)
const PolicyScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  return (
    <div className="pb-24 min-h-full bg-slate-50">
      <div className="bg-gradient-to-b from-brand-400 to-brand-500 text-white pb-8 rounded-b-[40px] shadow-lg">
        <div className="px-4 pb-4 pt-14 flex items-center justify-between">
          <h1 className="text-xl font-bold">Insurance 360</h1>
          <div className="flex items-center gap-1">
            <span>Get help</span>
            <Icons.Help className="w-5 h-5" />
          </div>
        </div>

        <div className="px-5 mt-2">
          <p className="text-brand-100 text-sm">Get insured to gain complete protection</p>

          <div className="mt-8 flex justify-center relative h-[220px]">
            {/* Circular UI */}
            <div className="absolute top-0 w-[220px] h-[220px] rounded-full border-4 border-brand-300/30"></div>
            <div className="absolute top-0 w-[220px] h-[220px] rounded-full border-t-4 border-r-4 border-white rotate-45"></div>
            <div className="w-[140px] h-[140px] bg-white rounded-full flex items-center justify-center self-center shadow-2xl z-10">
              <div className="w-[120px] h-[120px] bg-slate-100 rounded-full overflow-hidden border-4 border-slate-50">
                <img src="https://cdn.iconscout.com/icon/free/png-256/free-avatar-370-456322.png" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Floating Labels */}
            <button onClick={() => navigate('emergency_hub')} className="absolute bottom-[40px] left-[20px] bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-1 active:scale-95 transition-transform">
              <Icons.ArrowLeft className="w-3 h-3" /> Car
            </button>
            <button onClick={() => navigate('feature_placeholder', { title: 'Travel Insurance', icon: 'Plane' })} className="absolute top-[20px] right-[20px] bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-1 active:scale-95 transition-transform">
              Travel <Icons.ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-900 flex items-center justify-center">
              <Icons.Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900">Policies</span>
          </div>
          <Icons.ArrowRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      <div className="px-5 mt-8">
        <h3 className="font-bold text-xl text-slate-900 mb-4">Catalog</h3>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => navigate('emergency_hub')}
            className="bg-slate-100 rounded-3xl p-4 h-[140px] relative overflow-hidden active:scale-95 transition-transform"
          >
            <span className="font-bold text-slate-900">Car</span>
            <img src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=200"
              className="absolute bottom-2 right-[-10px] w-28 object-contain" alt="Car" />
          </div>
          <div
            onClick={() => navigate('feature_placeholder', { title: 'Travel Outbound', icon: 'Plane' })}
            className="bg-slate-100 rounded-3xl p-4 h-[140px] relative overflow-hidden active:scale-95 transition-transform"
          >
            <span className="font-bold text-slate-900 leading-tight block">Travel<br />outbound</span>
            <Icons.Plane className="absolute bottom-4 right-4 text-blue-500 w-12 h-12" />
          </div>
        </div>
      </div>
    </div>
  );
};

// 5. Emergency Hub (SOS Screen)
const EmergencyScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  return (
    <div className="bg-slate-50 min-h-full pb-24 flex flex-col">
      {/* Red Alert Header */}
      <div className="bg-red-600 px-6 pt-14 pb-12 rounded-b-[40px] shadow-lg relative z-10 text-white">
        <h1 className="text-3xl font-bold mb-2">Emergency</h1>
        <p className="opacity-90 mb-6 text-red-100">Immediate assistance for you and your vehicle.</p>

        <div className="flex gap-4">
          <button onClick={() => window.location.href = 'tel:999'} className="flex-1 bg-white text-red-600 py-6 rounded-3xl font-bold text-xl shadow-md flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <Icons.Phone className="w-8 h-8 fill-red-600" /> Call 999
          </button>
          <button onClick={() => navigate('success_confirmation', { type: 'simple', title: 'Accident Reported', message: 'Team dispatched. Stay safe.' })} className="flex-1 bg-red-700 text-white border border-red-500 py-6 rounded-3xl font-bold text-xl shadow-md flex items-center justify-center gap-3 active:scale-95 transition-transform">
            <Icons.Alert className="w-8 h-8" /> Report
          </button>
        </div>
      </div>

      {/* Map Integration for Location */}
      <div className="mx-6 -mt-8 relative z-20 h-[100px] rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <MapContainer className="h-full" zoom={1.2}>
          <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
          <div className="absolute inset-0 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                <Icons.MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">Your Location</p>
                <p className="font-bold text-slate-900 leading-tight">Doha Expressway</p>
              </div>
            </div>
            <button onClick={() => navigate('success_confirmation', { type: 'simple', title: 'Location Shared', message: 'Your coordinates have been sent to emergency contacts.' })} className="p-4 bg-white rounded-full text-slate-400 hover:text-blue-600 shadow-sm active:scale-95 transition-transform">
              <Icons.Share className="w-8 h-8" />
            </button>
          </div>
        </MapContainer>
      </div>

      {/* Roadside Options */}
      <div className="px-6 mt-8 flex-1">
        <h2 className="font-bold text-xl text-slate-900 mb-4">Roadside Assistance</h2>

        {/* Tabs/Cards for Vehicle Type */}
        <div className="grid grid-cols-1 gap-4">
          {/* Standard */}
          <div onClick={() => navigate('roadside_standard')} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center active:scale-[0.98] transition-transform cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                <Icons.Car className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Standard Car</h3>
                <p className="text-slate-500 text-sm">Gasoline / Diesel</p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
              <Icons.ArrowRight className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          {/* EV */}
          <div onClick={() => navigate('ev_assistance')} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center active:scale-[0.98] transition-transform cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <Icons.Zap className="w-7 h-7 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Electric Vehicle</h3>
                <p className="text-slate-500 text-sm">Charging & Towing</p>
              </div>
            </div>
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center">
              <Icons.ArrowRight className="w-8 h-8 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Charging Navigator (New Screen)
const ChargingNavigatorScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  const [filter, setFilter] = useState<'All' | 'Fast' | 'Slow'>('All');

  const chargers: Charger[] = [
    { id: '1', name: 'Doha Festival City', address: 'Umm Salal Muhammed', speed: 'Fast', kw: 150, status: 'Available', distance: '2.5 km', lat: 50, lng: 50 },
    { id: '2', name: 'Mall of Qatar', address: 'Al Rayyan', speed: 'Slow', kw: 22, status: 'Busy', distance: '5.1 km', lat: 30, lng: 70 },
    { id: '3', name: 'The Pearl Qatar', address: 'Porto Arabia', speed: 'Fast', kw: 50, status: 'Available', distance: '12 km', lat: 80, lng: 40 },
  ];

  const filtered = filter === 'All' ? chargers : chargers.filter(c => c.speed === filter);

  return (
    <div className="bg-white h-full flex flex-col relative overflow-hidden">
      {/* Map Area - Fixed Height or Flex Grow */}
      <div className="absolute inset-0 z-0 h-[60%]">
        <MapContainer className="h-full w-full" zoom={1.2}>
          {/* Render Generic Pins on Map */}
          {filtered.map((c, i) => (
            <div key={c.id} className="absolute" style={{ top: `${c.lat}%`, left: `${c.lng}%` }}>
              <div className={`w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center ${c.status === 'Available' ? 'bg-green-500' : 'bg-slate-400'}`}>
                <Icons.Zap className="w-4 h-4 text-white fill-current" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm mt-1 whitespace-nowrap">
                {c.name}
              </div>
            </div>
          ))}
        </MapContainer>
      </div>

      {/* Floating Header */}
      <div className="absolute top-14 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
        <button onClick={() => navigate('ev_assistance')} className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-auto">
          <Icons.ArrowLeft className="w-5 h-5 text-slate-800" />
        </button>
        <div className="bg-white rounded-2xl shadow-lg p-1.5 flex gap-1 pointer-events-auto">
          {(['All', 'Fast', 'Slow'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${filter === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Sheet - Absolute Positioned */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-white rounded-t-[32px] shadow-[0_-5px_20px_rgba(0,0,0,0.1)] p-6 z-10 overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sticky top-0" />
        <h2 className="font-bold text-xl text-slate-900 mb-4">Nearby Stations</h2>
        <div className="space-y-4 pb-4">
          {filtered.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.speed === 'Fast' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                  <Icons.Zap className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{c.name}</h4>
                  <p className="text-xs text-slate-500">{c.distance} • {c.kw}kW • {c.status}</p>
                </div>
              </div>
              <button onClick={() => navigate('success_confirmation', { type: 'navigation', title: 'Navigation Started', message: `Navigating to ${c.name}`, destination: c.name })} className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-blue-600 hover:bg-blue-50">
                <Icons.Navigation className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 7. EV Assistance
const EVAssistanceScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  return (
    <div className="bg-white min-h-full">
      <Header
        subtitle="QIC ROADSIDE PLUS"
        title="EV Assistance"
        onBack={() => navigate('emergency_hub')}
        rightElement={
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
        }
      />

      <div className="p-5">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-[32px] p-6 text-white relative overflow-hidden shadow-xl shadow-brand-500/20">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-4">
            <Icons.Shield className="w-3 h-3" /> EV-Safe Tech Certified
          </div>
          <h2 className="text-2xl font-bold leading-tight mb-2">Worry-Free Towing<br />& Charging</h2>
          <p className="text-brand-100 text-sm w-3/4 mb-4">Our specialists use flatbeds tailored for regenerative braking safety.</p>

          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            <Icons.Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        <h3 className="font-bold text-xl text-slate-900 mt-8 mb-4">Services</h3>
        <div className="grid grid-cols-2 gap-4">
          <div
            onClick={() => navigate('mobile_charging')}
            className="bg-slate-50 border border-slate-100 rounded-3xl p-4 flex flex-col justify-between h-[180px] active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div>
              <h4 className="font-bold text-slate-900">Mobile Charging</h4>
              <p className="text-xs text-slate-500 mt-1">Power van comes to you</p>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-600">
                <Icons.ArrowRight className="w-4 h-4" />
              </div>
              <div className="w-24 h-16 bg-slate-200 rounded-lg relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1593941707874-ef25b8b4a914?auto=format&fit=crop&q=80&w=200" className="w-full h-full object-cover opacity-80" alt="Van" />
              </div>
            </div>
          </div>

          <div
            onClick={() => navigate('ev_towing')}
            className="bg-slate-50 border border-slate-100 rounded-3xl p-4 flex flex-col justify-between h-[180px] active:scale-[0.98] transition-transform cursor-pointer"
          >
            <div>
              <h4 className="font-bold text-slate-900">EV-Safe Towing</h4>
              <p className="text-xs text-slate-500 mt-1">Flatbed transport</p>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <Icons.ArrowRight className="w-4 h-4" />
              </div>
              <div className="w-24 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Icons.Car className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        <div
          onClick={() => navigate('charging_navigator')}
          className="mt-4 bg-slate-50 border border-slate-100 rounded-3xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Icons.MapPin className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Charging Navigator</h4>
              <p className="text-xs text-slate-500">Find nearest fast chargers</p>
            </div>
          </div>
          <Icons.ArrowRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

// 8. Mobile Charging Request (Updated with Map)
const MobileChargingScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  const [range, setRange] = useState(50);

  return (
    <div className="bg-white min-h-full pb-6 flex flex-col">
      <Header
        title="Mobile Charging"
        onBack={() => navigate('ev_assistance')}
        rightElement={<Icons.Help className="w-6 h-6 text-slate-400" />}
      />

      <div className="h-[250px] relative bg-slate-100 mb-6">
        <MapContainer className="h-full" zoom={1.5}>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-green-500/10 rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute top-[40%] left-[60%]">
            <div className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-900 animate-bounce">
              <Icons.Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="bg-white px-2 py-1 rounded text-[10px] font-bold shadow-sm absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">Van #24</div>
          </div>
        </MapContainer>
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-800">Van is 15 mins away</span>
        </div>
      </div>

      <div className="flex-1 px-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl text-slate-900">Requested Range</h3>
          <span className="text-brand-600 font-bold text-2xl">+{range} km</span>
        </div>

        {/* Custom Range Slider */}
        <div className="py-6">
          <input
            type="range"
            min="10"
            max="100"
            step="10"
            value={range}
            onChange={(e) => setRange(parseInt(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
            <span>+10km</span>
            <span>+100km</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Icons.Home className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Arrival</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">15 min</p>
            <p className="text-green-600 text-xs font-bold mt-1">Fastest route</p>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <Icons.Grid className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Est. Cost</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">QAR {(115 + range).toFixed(2)}</p>
            <p className="text-slate-400 text-xs mt-1">Incl. taxes</p>
          </div>
        </div>
      </div>

      <div className="px-6 border-t border-slate-100 pt-4">
        <button
          onClick={() => navigate('success_confirmation', { type: 'charging', title: 'Power Van Requested', message: `Requested +${range}km range. ETA 15 mins.` })}
          className="w-full bg-brand-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 active:scale-98 transition-transform"
        >
          Request Power Van <Icons.ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// 8b. EV Towing (New Screen)
const EVTowingScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  return (
    <div className="bg-white min-h-full pb-6 flex flex-col">
      <Header title="EV Towing" onBack={() => navigate('ev_assistance')} />

      <div className="flex-1 px-6 pt-4">
        <h2 className="font-bold text-xl text-slate-900 mb-2">Select Destination</h2>
        <p className="text-slate-500 text-sm mb-6">Where should we take your vehicle?</p>

        <div className="space-y-3">
          <div onClick={() => navigate('success_confirmation', { type: 'roadside', title: 'Towing Requested', message: 'Towing to nearest Supercharger.' })} className="p-4 border border-slate-200 rounded-2xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Icons.Zap className="w-6 h-6 fill-current" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Nearest Supercharger</h3>
              <p className="text-xs text-slate-500">2.5km away • Doha Festival City</p>
            </div>
            <Icons.ArrowRight className="w-5 h-5 text-slate-300" />
          </div>

          <div onClick={() => navigate('success_confirmation', { type: 'roadside', title: 'Towing Requested', message: 'Towing to Tesla Service Center.' })} className="p-4 border border-slate-200 rounded-2xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Icons.Wrench className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Tesla Service Center</h3>
              <p className="text-xs text-slate-500">15km away • Industrial Area</p>
            </div>
            <Icons.ArrowRight className="w-5 h-5 text-slate-300" />
          </div>

          <div onClick={() => navigate('success_confirmation', { type: 'roadside', title: 'Towing Requested', message: 'Towing to your Home address.' })} className="p-4 border border-slate-200 rounded-2xl flex items-center gap-4 hover:bg-slate-50 cursor-pointer">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
              <Icons.Home className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900">Home</h3>
              <p className="text-xs text-slate-500">The Pearl, Tower 12</p>
            </div>
            <Icons.ArrowRight className="w-5 h-5 text-slate-300" />
          </div>
        </div>

        <div className="mt-8 bg-brand-50 rounded-2xl p-4 flex gap-4 items-start">
          <Icons.Shield className="w-6 h-6 text-brand-600 shrink-0" />
          <div>
            <h4 className="font-bold text-sm text-brand-900">EV Flatbed Guarantee</h4>
            <p className="text-xs text-brand-700 mt-1">We only use certified flatbeds to prevent motor damage from regenerative braking systems.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. Roadside Standard
const RoadsideStandardScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  return (
    <div className="bg-slate-50 min-h-full">
      <Header title="Roadside Assistance" onBack={() => navigate('emergency_hub')} rightElement={<Icons.Help className="w-6 h-6 text-brand-600 bg-brand-100 rounded-full p-1" />} />
      <div className="p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Standard Services</h1>
        <p className="text-slate-500 mb-6">Select the service you need help with right now.</p>

        <div className="bg-brand-50 rounded-3xl p-6 flex gap-5 mb-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shrink-0">
            <Icons.Settings className="w-8 h-8 text-brand-600 rotate-45" />
          </div>
          <div>
            <h3 className="font-bold text-xl text-slate-900">Pricing Information</h3>
            <p className="text-base text-slate-600 mt-2 leading-relaxed">These services are <span className="font-bold text-brand-600">Free</span> with your Roadside Plus Add-on. Without the add-on, standard market rates apply.</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            { name: 'Towing Service', sub: 'Towing to nearest workshop', icon: Icons.Car },
            { name: 'Battery Jump-start', sub: 'Dead battery revival', icon: Icons.Battery },
            { name: 'Flat Tire Change', sub: 'Spare tire installation', icon: Icons.Settings },
            { name: 'Fuel Delivery', sub: 'Emergency fuel top-up', icon: Icons.Fuel },
          ].map((s, i) => (
            <div
              key={i}
              onClick={() => navigate('success_confirmation', { type: 'roadside', title: `${s.name} Requested`, message: 'A specialist is on their way to your location.' })}
              className="bg-white rounded-3xl p-6 flex items-center justify-between shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
            >
              <div>
                <h3 className="font-bold text-xl text-slate-900">{s.name}</h3>
                <p className="text-slate-500 text-base">{s.sub}</p>
              </div>
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                <s.icon className="w-8 h-8 text-slate-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 9. Success Confirmation Screen - Context Aware
const SuccessScreen = ({ navigate, params }: { navigate: (screen: ScreenName) => void, params?: any }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  // Determine the type of success screen
  const screenType = params?.type || 'simple'; // 'navigation', 'roadside', 'charging', 'simple'

  // Get the appropriate pin icon based on type
  const getPinIcon = () => {
    switch (screenType) {
      case 'navigation':
        return <Icons.Zap className="w-6 h-6 text-white fill-current" />;
      case 'charging':
        return <Icons.Zap className="w-6 h-6 text-yellow-400 fill-current" />;
      case 'roadside':
        return <Icons.Car className="w-6 h-6 text-white" />;
      default:
        return <Icons.Check className="w-6 h-6 text-white" />;
    }
  };

  const getPinColor = () => {
    switch (screenType) {
      case 'navigation':
        return 'bg-green-500';
      case 'charging':
        return 'bg-yellow-500';
      case 'roadside':
        return 'bg-slate-900';
      default:
        return 'bg-brand-600';
    }
  };

  const getEtaLabel = () => {
    if (screenType === 'navigation') return 'Estimated Arrival';
    if (screenType === 'charging') return 'Van Arrival';
    if (screenType === 'roadside') return 'Estimated Arrival';
    return 'Status Update';
  };

  return (
    <div className="bg-white min-h-full flex flex-col relative overflow-hidden">
      {/* Top Map Section (40%) */}
      <div className="absolute top-0 left-0 right-0 h-[45%] z-0">
        <MapContainer className="h-full w-full" zoom={1.2}>
          {/* Back Button */}
          <button
            onClick={() => navigate('home')}
            className="absolute top-14 left-5 z-30 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-md active:scale-95 transition-transform text-slate-700 hover:text-slate-900"
          >
            <Icons.ArrowLeft className="w-6 h-6" />
          </button>

          {/* Dynamic Pin based on type */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ${show ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            <div className="relative">
              <div className={`w-12 h-12 ${getPinColor()} rounded-full border-4 border-white shadow-xl flex items-center justify-center z-20 relative`}>
                {getPinIcon()}
              </div>
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 ${getPinColor()} rotate-45 z-10`}></div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded-md shadow-md text-[10px] font-bold mt-2 whitespace-nowrap">
                {screenType === 'navigation' ? 'Destination' : screenType === 'roadside' ? '3 min away' : 'Active'}
              </div>
            </div>
          </div>
        </MapContainer>
        {/* Gradient Overlay for better text contrast if needed, or just to blend */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent z-10" />
      </div>

      {/* Bottom Sheet Details (60%) */}
      <div className={`absolute bottom-0 left-0 right-0 h-[60%] bg-white rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-50 flex flex-col transition-transform duration-500 ${show ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 shrink-0" />

        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{params?.title || 'Confirmed'}</h2>
              {params?.message && (
                <p className="text-slate-500 text-sm mt-1">{params.message}</p>
              )}
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active
            </div>
          </div>

          {/* ETA Card - Always shown */}
          <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between mb-6 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-900">
                <Icons.Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">{getEtaLabel()}</p>
                <p className="text-lg font-bold text-slate-900">
                  {screenType === 'navigation' ? '12 min drive' : '10:42 AM'} <span className="text-slate-400 font-normal text-sm">{screenType !== 'navigation' && '(12 min)'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* NAVIGATION TYPE - Show destination details, NO service provider */}
          {screenType === 'navigation' && (
            <>
              {/* Destination Info */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Destination</h3>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                    <Icons.Zap className="w-6 h-6 fill-current" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-900">{params?.destination || 'Charging Station'}</p>
                    <p className="text-xs text-slate-500">2.5 km away • Available</p>
                  </div>
                  <button className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 active:scale-95 transition-transform">
                    <Icons.Navigation className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Directions */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Route Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">1</div>
                    <p className="text-sm text-slate-700">Head north on current road</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">2</div>
                    <p className="text-sm text-slate-700">Turn right at the next intersection</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-sm font-bold">
                      <Icons.Check className="w-4 h-4" />
                    </div>
                    <p className="text-sm text-slate-700">Arrive at destination on your right</p>
                  </div>
                </div>
              </div>

              {/* Charger Info */}
              <div className="mb-6 bg-green-50 p-4 rounded-2xl flex gap-3 items-start">
                <Icons.Zap className="w-5 h-5 text-green-600 shrink-0 mt-0.5 fill-current" />
                <div>
                  <h4 className="font-bold text-sm text-green-900">Fast Charger Available</h4>
                  <p className="text-xs text-green-700 mt-1 leading-relaxed">150kW DC fast charging • Approximately 30 minutes to full charge.</p>
                </div>
              </div>
            </>
          )}

          {/* ROADSIDE TYPE - Show service provider */}
          {screenType === 'roadside' && (
            <>
              {/* Driver/Provider Info */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Service Provider</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=100" alt="Driver" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Ahmed Al-Sayed</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Icons.Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="font-bold text-slate-700">4.9</span>
                        <span>•</span>
                        <span>Recovery Specialist</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 active:scale-95 transition-transform">
                    <Icons.Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Vehicle Details</h3>
                <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                    <Icons.Car className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Recovery Truck</p>
                    <p className="text-xs text-slate-500">White • Plate: 123456</p>
                  </div>
                </div>
              </div>

              {/* What Happens Next */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">What Happens Next?</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">1</div>
                    <p className="text-sm text-slate-600">Driver arrives at your location</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">2</div>
                    <p className="text-sm text-slate-600">Quick vehicle inspection</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">3</div>
                    <p className="text-sm text-slate-600">Service performance & completion</p>
                  </div>
                </div>
              </div>

              {/* Safety Note */}
              <div className="mb-6 bg-blue-50 p-4 rounded-2xl flex gap-3 items-start">
                <Icons.Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-blue-900">Safety First</h4>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">Please stay in a safe location away from traffic while waiting for assistance. Keep your hazard lights on.</p>
                </div>
              </div>
            </>
          )}

          {/* CHARGING TYPE - Show power van details */}
          {screenType === 'charging' && (
            <>
              {/* Power Van Info */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Power Van</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Icons.Zap className="w-7 h-7 text-yellow-600 fill-current" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Mobile Charger #24</h4>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <span className="font-bold text-green-600">Available</span>
                        <span>•</span>
                        <span>150kW Capacity</span>
                      </div>
                    </div>
                  </div>
                  <button className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30 active:scale-95 transition-transform">
                    <Icons.Phone className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Charging Details */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">Charging Request</h3>
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Requested Range</span>
                    <span className="font-medium text-slate-900">+50 km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Charging Time</span>
                    <span className="font-medium text-slate-900">~20 min</span>
                  </div>
                  <div className="border-t border-slate-200 my-2 pt-2 flex justify-between font-bold">
                    <span className="text-slate-900">Estimated Cost</span>
                    <span className="text-brand-600">QAR 165.00</span>
                  </div>
                </div>
              </div>

              {/* EV Safety Note */}
              <div className="mb-6 bg-yellow-50 p-4 rounded-2xl flex gap-3 items-start">
                <Icons.Zap className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5 fill-current" />
                <div>
                  <h4 className="font-bold text-sm text-yellow-900">EV Certified</h4>
                  <p className="text-xs text-yellow-700 mt-1 leading-relaxed">Our mobile charging units are certified for all EV models and use standard CCS connectors.</p>
                </div>
              </div>
            </>
          )}

          {/* SIMPLE TYPE - Just a confirmation message */}
          {screenType === 'simple' && (
            <>
              {/* Simple confirmation */}
              <div className="mb-6 bg-green-50 p-6 rounded-2xl text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-bold text-lg text-green-900 mb-2">All Set!</h3>
                <p className="text-sm text-green-700">{params?.message || 'Your request has been processed successfully.'}</p>
              </div>

              {/* What's Next */}
              <div className="mb-6">
                <h3 className="font-bold text-slate-900 mb-3">What's Next?</h3>
                <p className="text-sm text-slate-600 mb-4">You'll receive updates on your request via notifications. Check back anytime for status.</p>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Actions - Sticky Footer */}
      <div className="p-6 pt-2 bg-white border-t border-slate-50">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('home')}
            className="flex-1 py-4 rounded-2xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            {screenType === 'navigation' ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => navigate('home')}
            className="flex-[2] py-4 rounded-2xl font-bold text-white bg-slate-900 shadow-xl shadow-slate-200 active:scale-95 transition-transform"
          >
            {screenType === 'navigation' ? 'Open Maps' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 10. Placeholder Screen
const PlaceholderScreen = ({ navigate, params }: { navigate: (screen: ScreenName) => void, params?: any }) => {
  const Icon = params?.icon && Icons[params.icon as keyof typeof Icons] ? Icons[params.icon as keyof typeof Icons] : Icons.Help;

  return (
    <div className="bg-slate-50 min-h-full flex flex-col">
      <div className="flex justify-between items-center p-4">
        <button onClick={() => navigate('home')} className="p-2 bg-white rounded-full"><Icons.Close className="w-6 h-6" /></button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <Icon className="w-10 h-10 text-slate-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">{params?.title || 'Coming Soon'}</h1>
        <p className="text-slate-500">This feature is currently under development. Check back later!</p>
      </div>
    </div>
  );
};

// 11. Market Screen
const MarketScreen = ({ navigate }: { navigate: (screen: ScreenName, params?: any) => void }) => {
  return (
    <div className="bg-slate-50 min-h-full pb-10">
      <Header title="QIC Market" onBack={() => navigate('city')} rightElement={<Icons.Search className="w-6 h-6 text-slate-500" />} />
      <div className="p-4 grid grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} onClick={() => navigate('feature_placeholder', { title: 'Car Details', icon: 'Car' })} className="bg-white rounded-2xl p-3 shadow-sm active:scale-95 transition-transform">
            <div className="bg-slate-100 rounded-xl h-24 mb-3 relative overflow-hidden">
              <img src={`https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200&random=${i}`} className="w-full h-full object-cover" alt="Car" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Porsche 911</h3>
            <p className="text-xs text-slate-500 mb-2">2023 • 12k km</p>
            <p className="font-bold text-brand-600 text-sm">QAR 450,000</p>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- Main App Logic ---

export default function App() {
  const [activeTab, setActiveTab] = useState<TabName>('main');
  const [navigationState, setNavigationState] = useState<{ stack: NavigationState[] }>({
    stack: [{ screen: 'home' }]
  });
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const padding = 10; // Minimal padding
      const phoneWidth = 402;
      const phoneHeight = 874;
      const availableWidth = window.innerWidth - padding;
      const availableHeight = window.innerHeight - padding;
      const scaleX = availableWidth / phoneWidth;
      const scaleY = availableHeight / phoneHeight;
      // Allow scaling up to 2.0 (or fit to screen) to mimic full-screen look
      const newScale = Math.min(scaleX, scaleY, 2.0);
      setScale(newScale);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentNav = navigationState.stack[navigationState.stack.length - 1];
  const currentScreen = currentNav.screen;
  const currentParams = currentNav.params;

  const navigate = (screen: ScreenName, params?: any) => {
    // If navigating to a root tab screen, reset stack to that root
    if (screen === 'home' || screen === 'city' || screen === 'insurance_hub' || screen === 'emergency_hub') {
      if (screen === 'home') setActiveTab('main');
      if (screen === 'city') setActiveTab('city');
      if (screen === 'insurance_hub') setActiveTab('insurance');
      if (screen === 'emergency_hub') setActiveTab('emergency');

      setNavigationState({ stack: [{ screen, params }] });
    } else {
      setNavigationState(prev => ({
        stack: [...prev.stack, { screen, params }]
      }));
    }
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (navigationState.stack.length > 1) {
      setNavigationState(prev => ({
        stack: prev.stack.slice(0, -1)
      }));
    }
  };

  const handleTabChange = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'main') navigate('home');
    if (tab === 'city') navigate('city');
    if (tab === 'insurance') navigate('insurance_hub');
    if (tab === 'emergency') navigate('emergency_hub');
    if (tab === 'cars') navigate('feature_placeholder', { title: 'My Garage', icon: 'Car' });
  };

  // Render logic based on currentScreen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen navigate={navigate} />;
      case 'city': return <CityScreen navigate={navigate} />;
      case 'market': return <MarketScreen navigate={handleBack} />;
      case 'insurance_hub': return <InsuranceScreen navigate={navigate} />;
      case 'insurance_detail': return <PolicyScreen navigate={navigate} />;
      case 'emergency_hub': return <EmergencyScreen navigate={navigate} />;
      case 'roadside_standard': return <RoadsideStandardScreen navigate={navigate} />;
      case 'ev_assistance': return <EVAssistanceScreen navigate={navigate} />;
      case 'charging_navigator': return <ChargingNavigatorScreen navigate={navigate} />;
      case 'ev_towing': return <EVTowingScreen navigate={navigate} />;
      case 'mobile_charging': return <MobileChargingScreen navigate={handleBack} />;
      case 'success_confirmation': return <SuccessScreen navigate={navigate} params={currentParams} />;
      case 'feature_placeholder': return <PlaceholderScreen navigate={handleBack} params={currentParams} />;
      default: return <HomeScreen navigate={navigate} />;
    }
  };

  // Determine if BottomNav should be shown.
  // We show it on main Hubs. Sub-workflows usually hide it to provide more screen space,
  // BUT the user requested better navigation persistence.
  // Let's keep it on main hubs and 'City' sub-pages if possible, but definitely hide on heavy interaction pages like map navigators.
  const showBottomNav = ['home', 'city', 'insurance_hub', 'emergency_hub', 'market'].includes(currentScreen);

  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.1s ease-out' }}>
      <div className="iphone-emulator">
        <div className="iphone-notch"></div>
        <div className={`iphone-screen ${showBottomNav ? 'pb-[90px]' : ''}`}>
          {renderScreen()}
        </div>
        <div className="home-indicator"></div>

        {showBottomNav && (
          <div className="absolute bottom-0 left-0 right-0 bg-white z-40 pb-5">
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        )}
      </div>
    </div>
  );
}
