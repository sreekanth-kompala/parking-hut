import React, { useState, useEffect, useCallback, useRef } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserProfile, TabID } from "./types";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  LogIn,
  Menu,
  LogOut,
  ChevronRight,
  User as UserIcon,
  Home,
  MapPin,
  Calendar,
} from "lucide-react";
import { AuthContext, Notification } from "./AuthContext";

// Components
import Auth from "./components/Auth";
import ComingSoon from "./components/ComingSoon";
import ProviderDashboard from "./components/ProviderDashboard";
import SeekerDashboard from "./components/SeekerDashboard";
import SeekerHome from "./components/SeekerHome";
import Bookings from "./components/Bookings";
import LoadingScreen from "./components/LoadingScreen";

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
  const [activeTab, setActiveTab] = useState<TabID>("home");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isNavPanelOpen, setIsNavPanelOpen] = useState(false);
  const isInitialized = useRef(false);

  const dismissNotify = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (
      message: string,
      type: "info" | "success" | "error" = "info",
      steps?: string[],
      currentStep?: number,
    ) => {
      const id = crypto.randomUUID();
      setNotifications((prev) => [
        ...prev,
        { id, type, message, steps, currentStep },
      ]);
      if (!steps) {
        setTimeout(() => dismissNotify(id), 5000);
      }
      return id;
    },
    [dismissNotify],
  );

  const updateNotify = useCallback(
    (id: string, updates: Partial<Notification>) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, ...updates } : n)),
      );
      if (updates.type === "success" || updates.type === "error") {
        setTimeout(() => dismissNotify(id), 4000);
      }
    },
    [dismissNotify],
  );

  const fetchProfile = useCallback(
    async (uid: string) => {
      try {
        const docRef = doc(db, "users", uid);
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
    },
    [notify],
  );

  const openAuth = useCallback((mode: "login" | "signup") => {
    setAuthMode(mode);
    setShowAuthOverlay(true);
    setIsNavPanelOpen(false);
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

  const handleTabChange = (tab: TabID) => {
    setActiveTab(tab);
    setIsNavPanelOpen(false);
  };

  if (loading) return <LoadingScreen />;

  const RestrictedView = ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <div className="p-4 md:p-8 flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-12 rounded-[3rem] border border-slate-100 shadow-xl text-center max-w-lg w-full animate-fade-in-up">
        <div className="w-20 h-20 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogIn size={40} strokeWidth={2.5} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">{title}</h2>
        <p className="text-slate-500 font-medium mb-10">{description}</p>
        <button
          onClick={() => openAuth("login")}
          className="w-full py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-2xl shadow-lg shadow-yellow-400/20 transition-all active:scale-[0.98]"
        >
          LOG IN TO CONTINUE
        </button>
      </div>
    </div>
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        refreshProfile,
        notify,
        updateNotify,
        dismissNotify,
        setActiveTab: handleTabChange,
        openAuth,
      }}
    >
      {/* Root container - Padding-top added to offset the fixed header height */}
      <div className="min-h-screen bg-slate-50 pt-[calc(5rem+env(safe-area-inset-top))] md:pt-24 lg:pt-28 overflow-x-hidden">
        {/* Navbar - Changed to fixed top-0 to ensure it doesn't scroll away */}
        <header className="fixed top-0 left-0 right-0 z-[100] bg-white border-b border-slate-100 w-full transition-all px-6 md:px-8 lg:px-16 h-20 md:h-24 lg:h-28 flex items-center justify-between shadow-sm">
          <div
            className="flex items-center gap-3 md:gap-4 cursor-pointer group"
            onClick={() => handleTabChange("home")}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 bg-yellow-400 rounded-lg sm:rounded-xl md:rounded-2xl flex items-center justify-center font-black text-slate-900 text-sm sm:text-lg md:text-xl lg:text-2xl shadow-lg shadow-yellow-400/20 group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="text-xl md:text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">
              Parking Hut
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 lg:gap-14">
            {(["home", "spaces"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`text-sm lg:text-lg font-black uppercase tracking-widest transition-all relative py-2 ${
                  activeTab === tab
                    ? "text-yellow-600"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-full"></div>
                )}
              </button>
            ))}
            {user &&
              (["bookings", "profile"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`text-sm lg:text-lg font-black uppercase tracking-widest transition-all relative py-2 ${
                    activeTab === tab
                      ? "text-yellow-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-400 rounded-full"></div>
                  )}
                </button>
              ))}
          </nav>

          <div className="hidden md:flex items-center gap-4 lg:gap-8">
            {user ? (
              <button
                onClick={() => auth.signOut()}
                className="px-6 py-2.5 lg:px-10 lg:py-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 font-black rounded-xl transition-all text-xs tracking-widest uppercase"
              >
                SIGN OUT
              </button>
            ) : (
              <div className="flex items-center gap-4 lg:gap-6">
                <button
                  onClick={() => openAuth("login")}
                  className="px-6 py-2.5 lg:px-8 lg:py-3.5 text-slate-600 font-black rounded-xl hover:bg-slate-50 transition-all text-xs tracking-widest uppercase"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => openAuth("signup")}
                  className="px-6 py-2.5 lg:px-12 lg:py-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-xl shadow-xl shadow-yellow-400/20 transition-all active:scale-[0.98] text-xs tracking-widest uppercase"
                >
                  SIGNUP
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsNavPanelOpen(true)}
            className="md:hidden p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-slate-100 transition-all"
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Mobile NavPanel (Drawer) */}
        {isNavPanelOpen && (
          <div className="fixed inset-0 z-[1000] md:hidden">
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setIsNavPanelOpen(false)}
            ></div>
            <div className="absolute top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
              <div className="p-8 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-slate-900 text-sm">
                    P
                  </div>
                  <span className="font-black text-xl tracking-tighter">
                    Parking Hut
                  </span>
                </div>
                <button
                  onClick={() => setIsNavPanelOpen(false)}
                  className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-2 overflow-y-auto">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-2">
                  Navigation
                </div>
                {[
                  { id: "home", label: "Home", icon: Home },
                  { id: "spaces", label: "Explore", icon: MapPin },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id as TabID)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === item.id ? "bg-yellow-50 text-yellow-600" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={20} />
                      <span className="font-black uppercase tracking-widest text-xs">
                        {item.label}
                      </span>
                    </div>
                    {activeTab === item.id && (
                      <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                    )}
                  </button>
                ))}

                {user && (
                  <>
                    {[
                      { id: "bookings", label: "Bookings", icon: Calendar },
                      { id: "profile", label: "Profile", icon: UserIcon },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleTabChange(item.id as TabID)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeTab === item.id ? "bg-yellow-50 text-yellow-600" : "text-slate-500 hover:bg-slate-50"}`}
                      >
                        <div className="flex items-center gap-4">
                          <item.icon size={20} />
                          <span className="font-black uppercase tracking-widest text-xs">
                            {item.label}
                          </span>
                        </div>
                        {activeTab === item.id && (
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </>
                )}
              </div>

              <div className="p-8 bg-slate-50 space-y-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 px-4">
                      <div className="w-9 h-9 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center font-black text-xs uppercase">
                        {profile?.name?.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-slate-900 truncate text-sm">
                          {profile?.name || "User"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {profile?.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        auth.signOut();
                        setIsNavPanelOpen(false);
                      }}
                      className="w-full py-4 bg-white border border-slate-200 text-red-500 font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      Log Out <LogOut size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => openAuth("login")}
                      className="py-4 bg-white text-slate-600 border border-slate-200 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => openAuth("signup")}
                      className="py-4 bg-yellow-400 text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest"
                    >
                      Signup
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-8">
          {activeTab === "home" &&
            (profile?.role === "provider" ? (
              <ProviderDashboard />
            ) : (
              <SeekerHome />
            ))}
          {activeTab === "spaces" && <SeekerDashboard />}
          {activeTab === "bookings" &&
            (user ? (
              <Bookings />
            ) : (
              <RestrictedView
                title="Your Bookings"
                description="Please log in to view and manage your parking reservations."
              />
            ))}
          {activeTab === "profile" &&
            (user ? (
              <div className="py-8 lg:py-16">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 md:mb-12 tracking-tight">
                  Profile Settings
                </h1>
                <div className="bg-white p-8 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-slate-100 shadow-sm max-w-5xl">
                  <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 mb-8 md:mb-12 pb-8 md:pb-12 border-b border-slate-50 text-center md:text-left">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-yellow-100 text-yellow-600 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center font-black text-2xl md:text-3xl uppercase">
                      {profile?.name?.substring(0, 2) || "??"}
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                        {profile?.name || "User"}
                      </h3>
                      <p className="text-slate-500 text-lg md:text-xl font-medium mt-1 md:mt-2">
                        {profile?.email || user.email}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Account Type
                      </label>
                      <p className="text-xl md:text-2xl font-bold text-slate-900 capitalize">
                        {profile?.role || "Seeker"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        Phone Number
                      </label>
                      <p className="text-xl md:text-2xl font-bold text-slate-900">
                        {profile?.phone || "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-12 md:mt-16 pt-8 md:pt-12 border-t border-slate-50">
                    <button
                      onClick={() => auth.signOut()}
                      className="w-full md:w-auto px-12 md:px-16 py-5 md:py-6 bg-red-50 text-red-600 font-black rounded-2xl md:rounded-3xl hover:bg-red-100 transition-colors uppercase tracking-widest text-xs md:text-sm"
                    >
                      Log Out Account
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <RestrictedView
                title="Profile Settings"
                description="Access your profile, vehicles and security settings by logging in."
              />
            ))}
        </main>

        {showAuthOverlay && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
            <div
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowAuthOverlay(false)}
            ></div>
            <div className="relative w-full h-full md:h-auto overflow-y-auto flex items-center justify-center p-4">
              <ComingSoon onClose={() => setShowAuthOverlay(false)} />
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="fixed bottom-10 right-6 md:right-10 z-[2000] space-y-4 md:space-y-6 w-full max-w-[400px]">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex gap-4 md:gap-5 border animate-in slide-in-from-right-full duration-500 ${
                n.type === "success"
                  ? "bg-white border-green-100 text-green-800"
                  : n.type === "error"
                    ? "bg-white border-red-100 text-red-800"
                    : "bg-white border-slate-100 text-slate-800"
              }`}
            >
              <div
                className={`mt-0.5 ${n.type === "success" ? "text-green-500" : n.type === "error" ? "text-red-500" : "text-yellow-500"}`}
              >
                {n.type === "success" ? (
                  <CheckCircle2 size={24} />
                ) : n.type === "error" ? (
                  <AlertCircle size={24} />
                ) : (
                  <Info size={24} />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm md:text-base font-black leading-tight">
                  {n.message}
                </p>
              </div>
              <button
                onClick={() => dismissNotify(n.id)}
                className="text-slate-300 hover:text-slate-500 transition-colors self-start"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </AuthContext.Provider>
  );
};

export default App;
