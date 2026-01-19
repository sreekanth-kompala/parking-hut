import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { UserProfile, TabID } from './types';
import { AlertCircle, CheckCircle2, Info, X, LogIn, UserPlus } from 'lucide-react';
import { AuthContext, Notification } from './AuthContext';

// Components
import Auth from './components/Auth';
import ComingSoon from './components/ComingSoon';
import Navigation from './components/Navigation';
import ProviderDashboard from './components/ProviderDashboard';
import SeekerDashboard from './components/SeekerDashboard';
import SeekerHome from './components/SeekerHome';
import Bookings from './components/Bookings';
import LoadingScreen from './components/LoadingScreen';

declare global {
  interface Window {
    hideInitialLoader: () => void;
  }
}

const MIN_LOADING_TIME = 1500;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabID>('home');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const isInitialized = useRef(false);

  const dismissNotify = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((message: string, type: 'info' | 'success' | 'error' = 'info', steps?: string[], currentStep?: number) => {
    const id = crypto.randomUUID();
    setNotifications(prev => [...prev, { id, type, message, steps, currentStep }]);
    if (!steps) {
      setTimeout(() => dismissNotify(id), 5000);
    }
    return id;
  }, [dismissNotify]);

  const updateNotify = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    if (updates.type === 'success' || updates.type === 'error') {
      setTimeout(() => dismissNotify(id), 4000);
    }
  }, [dismissNotify]);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as UserProfile;
        setProfile(data);
        return data;
      }
      setProfile(null);
      return null;
    } catch (err) {
      notify("Failed to load profile.", "error");
      return null;
    }
  }, [notify]);

  const openAuth = useCallback((mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthOverlay(true);
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    if (window.hideInitialLoader) window.hideInitialLoader();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
        setShowAuthOverlay(false);
      } else {
        setProfile(null);
      }

      if (!isInitialized.current) {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);
        setTimeout(() => {
          setLoading(false);
          isInitialized.current = true;
        }, remainingTime);
      } else {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [fetchProfile]);

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  if (loading) return <LoadingScreen />;

  const RestrictedView = ({ title, description }: { title: string, description: string }) => (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl text-center max-w-lg w-full animate-fade-in-up">
        <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 font-medium mb-10">{description}</p>
        <button 
          onClick={() => openAuth('login')}
          className="w-full py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-2xl shadow-lg shadow-yellow-400/20 transition-all active:scale-[0.98]"
        >
          LOG IN TO CONTINUE
        </button>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile, notify, updateNotify, dismissNotify, setActiveTab: (t: any) => setActiveTab(t), openAuth }}>
      <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 pt-safe">
        <div className="w-full">
          {/* Enhanced Header with larger elements and better spacing for desktop */}
          <header className="hidden md:flex items-center justify-between py-8 lg:py-10 px-8 lg:px-16 bg-white border-b border-slate-100 sticky top-0 z-40 transition-all">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setActiveTab('home')}>
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-slate-900 text-xl lg:text-3xl shadow-lg shadow-yellow-400/20 group-hover:scale-105 transition-transform">P</div>
              <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">Parking Hut</span>
            </div>
            
            <div className="flex items-center gap-12 lg:gap-16">
              <nav className="flex items-center gap-10 lg:gap-14">
                {(['home', 'spaces'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-base lg:text-lg font-black uppercase tracking-widest transition-all relative ${
                      activeTab === tab ? 'text-yellow-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400 rounded-full"></div>}
                  </button>
                ))}
                
                {user && (['bookings', 'profile'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-base lg:text-lg font-black uppercase tracking-widest transition-all relative ${
                      activeTab === tab ? 'text-yellow-600' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                    {activeTab === tab && <div className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400 rounded-full"></div>}
                  </button>
                ))}
              </nav>

              <div className="flex items-center gap-6 lg:gap-8">
                {user ? (
                  <button 
                    onClick={() => auth.signOut()}
                    className="px-8 py-3.5 lg:px-10 lg:py-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-black rounded-2xl transition-all text-sm tracking-widest uppercase"
                  >
                    SIGN OUT
                  </button>
                ) : (
                  <div className="flex items-center gap-5 lg:gap-6">
                    <button 
                      onClick={() => openAuth('login')}
                      className="px-8 py-3.5 lg:px-10 lg:py-4 text-slate-600 font-black rounded-2xl hover:bg-slate-50 transition-all text-sm tracking-widest uppercase"
                    >
                      LOGIN
                    </button>
                    <button 
                      onClick={() => openAuth('signup')}
                      className="px-8 py-3.5 lg:px-12 lg:py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-2xl shadow-xl shadow-yellow-400/20 transition-all active:scale-[0.98] text-sm tracking-widest uppercase"
                    >
                      SIGNUP
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="w-full px-5 lg:px-16">
            {activeTab === 'home' && (
              profile?.role === 'provider' 
                ? <ProviderDashboard /> 
                : <SeekerHome />
            )}
            {activeTab === 'spaces' && <SeekerDashboard />}
            {activeTab === 'bookings' && (
              user ? <Bookings /> : <RestrictedView title="Your Bookings" description="Please log in to view and manage your parking reservations." />
            )}
            {activeTab === 'profile' && (
              user ? (
                <div className="py-8 lg:py-16">
                  <h1 className="text-5xl font-black text-slate-900 mb-12 tracking-tight">Profile Settings</h1>
                  <div className="bg-white p-12 lg:p-16 rounded-[4rem] border border-slate-100 shadow-sm max-w-5xl">
                    <div className="flex items-center gap-10 mb-12 pb-12 border-b border-slate-50">
                       <div className="w-28 h-28 lg:w-32 lg:h-32 bg-yellow-100 text-yellow-600 rounded-[2.5rem] flex items-center justify-center font-black text-4xl uppercase">
                          {profile?.name?.substring(0, 2) || '??'}
                       </div>
                       <div>
                          <h3 className="text-3xl font-black text-slate-900 leading-tight">{profile?.name || 'User'}</h3>
                          <p className="text-slate-500 text-xl font-medium mt-2">{profile?.email || user.email}</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Account Type</label>
                          <p className="text-2xl font-bold text-slate-900 capitalize">{profile?.role || 'Seeker'}</p>
                       </div>
                       <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Phone Number</label>
                          <p className="text-2xl font-bold text-slate-900">{profile?.phone || 'Not set'}</p>
                       </div>
                    </div>
                    <div className="mt-16 pt-12 border-t border-slate-50">
                       <button onClick={() => auth.signOut()} className="w-full md:w-auto px-16 py-6 bg-red-50 text-red-600 font-black rounded-3xl hover:bg-red-100 transition-colors uppercase tracking-widest text-sm">Log Out Account</button>
                    </div>
                  </div>
                </div>
              ) : <RestrictedView title="Profile Settings" description="Access your profile, vehicles and security settings by logging in." />
            )}
          </main>
        </div>

        <Navigation activeTab={activeTab} setActiveTab={(t: any) => setActiveTab(t)} />

        {showAuthOverlay && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAuthOverlay(false)}></div>
            <div className="relative w-full h-full md:h-auto overflow-y-auto flex items-center justify-center p-4">
              {/* Temporarily showing ComingSoon instead of Auth */}
              <ComingSoon onClose={() => setShowAuthOverlay(false)} />
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="fixed bottom-24 md:bottom-10 right-10 z-[2000] space-y-6 w-full max-w-[400px] px-4 md:px-0">
          {notifications.map(n => (
            <div key={n.id} className={`p-6 rounded-[2.5rem] shadow-2xl flex gap-5 border animate-in slide-in-from-right-full duration-500 ${
              n.type === 'success' ? 'bg-white border-green-100 text-green-800' :
              n.type === 'error' ? 'bg-white border-red-100 text-red-800' :
              'bg-white border-slate-100 text-slate-800'
            }`}>
              <div className={`mt-0.5 ${n.type === 'success' ? 'text-green-500' : n.type === 'error' ? 'text-red-500' : 'text-yellow-500'}`}>
                {n.type === 'success' ? <CheckCircle2 size={28} /> : n.type === 'error' ? <AlertCircle size={28} /> : <Info size={28} />}
              </div>
              <div className="flex-1"><p className="text-base font-black leading-tight">{n.message}</p></div>
              <button onClick={() => dismissNotify(n.id)} className="text-slate-300 hover:text-slate-500 transition-colors self-start"><X size={24} /></button>
            </div>
          ))}
        </div>
      </div>
    </AuthContext.Provider>
  );
};

export default App;