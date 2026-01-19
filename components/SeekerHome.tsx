import React, { useState, useEffect, useMemo } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { ParkingSpace, Booking, UserProfile } from "../types";
import {
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  History,
  ChevronLeft,
  Phone,
  MessageSquare,
  Video,
  ShieldCheck as ShieldIcon,
  Lock,
  CloudRain,
  Battery,
  Info,
  User as HostIcon,
  Car,
  Bike,
  LogIn,
  Search,
  Award,
  Heart,
  Globe,
  Mail,
  Instagram,
  Facebook,
  Calendar,
  Smartphone,
  Apple,
  Play,
} from "lucide-react";

// Custom X (formerly Twitter) logo component
const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className="transition-colors"
  >
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153zM17.61 20.644h2.039L6.486 3.24H4.298l13.311 17.404z" />
  </svg>
);

// High-fidelity CSS Mockup for the App Preview
const AppPreviewMockup = () => (
  <div className="w-full h-full bg-[#f8fafc] flex flex-col p-4 text-left select-none overflow-hidden font-sans">
    {/* Status Bar Mock */}
    <div className="flex justify-between items-center mb-6 px-1">
      <div className="text-[10px] font-bold text-slate-900">9:41</div>
      <div className="flex gap-1">
        <div className="w-3 h-3 bg-slate-900 rounded-full opacity-20"></div>
        <div className="w-3 h-3 bg-slate-900 rounded-full opacity-20"></div>
      </div>
    </div>

    {/* Header */}
    <div className="mb-6">
      <h3 className="text-xl font-black text-[#0f172a] leading-tight">
        Hello, John! 👋
      </h3>
      <p className="text-xs font-medium text-slate-400">
        Ready for your next journey?
      </p>
    </div>

    {/* Stats Cards */}
    <div className="grid grid-cols-2 gap-3 mb-8">
      <div className="bg-[#0f172a] p-4 rounded-[1.8rem] text-white shadow-lg">
        <Zap size={16} fill="#F5B800" className="text-yellow-400 mb-2" />
        <div className="text-2xl font-black leading-none mb-1">1</div>
        <div className="text-[7px] font-black uppercase tracking-widest opacity-60">
          Active Bookings
        </div>
      </div>
      <div className="bg-white p-4 rounded-[1.8rem] border border-slate-100 shadow-sm">
        <History size={16} className="text-blue-500 mb-2" />
        <div className="text-2xl font-black text-slate-900 leading-none mb-1">
          1
        </div>
        <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
          Total History
        </div>
      </div>
    </div>

    {/* Popular Near You */}
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">
          Popular Near You
        </h4>
        <span className="text-[8px] font-black text-yellow-600 uppercase tracking-widest">
          See All &gt
        </span>
      </div>
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-24 bg-slate-100 relative">
          <img
            src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400"
            className="w-full h-full object-cover grayscale opacity-60"
            alt=""
          />
          <div className="absolute bottom-2 left-2 bg-white/90 px-2 py-0.5 rounded-lg text-[8px] font-black text-slate-900 border border-slate-100">
            ₹10/hr
          </div>
        </div>
        <div className="p-3">
          <h5 className="font-black text-[10px] text-slate-900 mb-0.5">
            Maruthi Garage
          </h5>
          <p className="text-[8px] text-slate-400 font-medium flex items-center gap-0.5">
            <MapPin size={8} className="text-yellow-500" /> RK Nagar 2nd Street
          </p>
        </div>
      </div>
    </div>

    {/* Recent Activity */}
    <div className="flex-1">
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-4">
        Recent Activity
      </h4>
      <div className="bg-white p-3 rounded-2xl border border-slate-50 shadow-sm flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-300">
          <Clock size={16} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-black text-slate-900">
              Maruthi Garage
            </span>
            <span className="text-[7px] font-black text-green-500 bg-green-50 px-1.5 py-0.5 rounded-md uppercase">
              Confirmed
            </span>
          </div>
          <p className="text-[7px] text-slate-400 font-medium">
            1/18/2026 • ₹1010
          </p>
        </div>
      </div>
    </div>

    {/* Bottom Nav Mock */}
    <div className="mt-auto -mx-4 -mb-4 bg-white border-t border-slate-100 px-6 py-4 flex justify-between items-center">
      <div className="flex flex-col items-center gap-1 text-yellow-600">
        <Search size={14} />
        <span className="text-[6px] font-black">HOME</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-slate-300">
        <MapPin size={14} />
        <span className="text-[6px] font-black">EXPLORE</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-slate-300">
        <Calendar size={14} />
        <span className="text-[6px] font-black">BOOKINGS</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-slate-300">
        <HostIcon size={14} />
        <span className="text-[6px] font-black">PROFILE</span>
      </div>
    </div>
  </div>
);

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1600";
const WELCOME_BG_IMAGE =
  "https://images.unsplash.com/photo-1449156003053-c30670b96835?auto=format&fit=crop&q=80&w=1600";
const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&q=80&w=1600";

const APP_STORE_BADGE =
  "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg";
const GOOGLE_PLAY_BADGE =
  "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg";

// New Sticker Icons for Hero Section
const APP_STORE_STICKER =
  "https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg";
const GOOGLE_PLAY_STICKER =
  "https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg";

const getAmenityIcon = (name: string) => {
  const iconProps = { size: 18 };
  switch (name) {
    case "CCTV":
      return <Video {...iconProps} />;
    case "Security Guard":
      return <ShieldIcon {...iconProps} />;
    case "EV Charging":
      return <Zap {...iconProps} />;
    case "Gated Access":
      return <Lock {...iconProps} />;
    case "Rain Shelter":
      return <CloudRain {...iconProps} />;
    case "Power Backup":
      return <Battery {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

const AmenityItem: React.FC<{ name: string }> = ({ name }) => {
  const [showName, setShowName] = useState(false);
  return (
    <div
      onClick={() => setShowName(!showName)}
      className={`flex flex-col items-center justify-center p-4 rounded-3xl border transition-all cursor-pointer ${
        showName
          ? "bg-yellow-400 border-yellow-500 text-slate-900 shadow-xl"
          : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
      }`}
    >
      {getAmenityIcon(name)}
      {showName && (
        <span className="text-[10px] font-black uppercase tracking-widest mt-2 text-center">
          {name}
        </span>
      )}
    </div>
  );
};

const SpaceDetailView: React.FC<{
  space: ParkingSpace;
  onBack: () => void;
}> = ({ space, onBack }) => {
  const [host, setHost] = useState<UserProfile | null>(null);
  const [hostLoading, setHostLoading] = useState(true);
  const { user, openAuth, setActiveTab } = useAuth();

  useEffect(() => {
    const fetchHost = async () => {
      try {
        const hostDoc = await getDoc(doc(db, "users", space.providerId));
        if (hostDoc.exists()) {
          setHost(hostDoc.data() as UserProfile);
        }
      } catch (err) {
        console.error("Host fetch error:", err);
      } finally {
        setHostLoading(false);
      }
    };
    fetchHost();
  }, [space.providerId]);

  const handleContactClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuth("login");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto animate-in slide-in-from-right duration-300">
      <div className="relative h-96">
        <img
          src={
            space.imageUrl || `https://picsum.photos/seed/${space.id}/800/600`
          }
          className="w-full h-full object-cover"
          alt={space.title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
        <button
          onClick={onBack}
          className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] left-6 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/40 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="absolute bottom-10 left-8 right-8 text-white">
          <h1 className="text-4xl font-black mb-2 leading-tight">
            {space.title}
          </h1>
          <div className="flex items-center gap-2 opacity-90">
            <MapPin size={18} className="text-yellow-400" />
            <span className="font-medium text-lg">{space.address}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto -mt-6 relative bg-slate-50 rounded-t-[3rem] p-8 md:p-12 space-y-10">
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <Car size={24} className="text-yellow-500 mb-2" />
              <p className="text-2xl font-black text-slate-900">
                {space.carSlots}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Car Slots
              </p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
              <Bike size={24} className="text-blue-500 mb-2" />
              <p className="text-2xl font-black text-slate-900">
                {space.bikeSlots}
              </p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Bike Slots
              </p>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white flex flex-col items-center justify-center text-center col-span-2">
              <p className="text-3xl font-black text-yellow-400">
                ₹{space.pricing?.car?.hourly || 0}
              </p>
              <p className="text-[10px] font-black opacity-60 uppercase tracking-widest">
                Starting Rate Per Hour
              </p>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
            Description
          </h3>
          <p className="text-slate-600 leading-relaxed text-lg font-medium">
            {space.description ||
              "Secure and reliable parking spot in a prime location. Verified listing with easy access."}
          </p>
        </section>

        <section>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Host
          </h3>
          {hostLoading ? (
            <div className="h-24 bg-white rounded-3xl animate-pulse"></div>
          ) : host ? (
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
              <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-[1.8rem] flex items-center justify-center font-black text-2xl uppercase">
                {host.name.substring(0, 2)}
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-black text-slate-900 mb-1">
                  {host.name}
                </h4>
                <div className="flex items-center gap-4">
                  <a
                    href={user ? `tel:${host.phone}` : "#"}
                    onClick={handleContactClick}
                    className="flex items-center gap-2 text-yellow-600 font-bold text-sm bg-yellow-50 px-4 py-2 rounded-xl"
                  >
                    <Phone size={14} /> CALL
                  </a>
                  <a
                    href={user ? `sms:${host.phone}` : "#"}
                    onClick={handleContactClick}
                    className="flex items-center gap-2 text-slate-600 font-bold text-sm bg-slate-50 px-4 py-2 rounded-xl"
                  >
                    <MessageSquare size={14} /> CHAT
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-red-50 text-red-500 rounded-3xl text-sm font-bold">
              Details unavailable
            </div>
          )}
        </section>

        <section>
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
            Amenities
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {space.amenities.map((a) => (
              <AmenityItem key={a} name={a} />
            ))}
          </div>
        </section>

        <div className="sticky bottom-[calc(2rem+env(safe-area-inset-bottom))] left-0 right-0 pt-10 pb-safe">
          <button
            onClick={() => setActiveTab("spaces")}
            className="w-full py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 text-xl font-black rounded-3xl shadow-2xl shadow-yellow-400/30 transition-all active:scale-95"
          >
            {user ? "CHECK AVAILABILITY" : "LOGIN TO BOOK"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SeekerHome: React.FC = () => {
  const { user, profile, setActiveTab } = useAuth();
  const [popularSpaces, setPopularSpaces] = useState<ParkingSpace[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        const qSpaces = query(
          collection(db, "spaces"),
          where("isAvailable", "==", true),
          orderBy("totalSlots", "desc"),
          limit(5),
        );
        const spaceSnap = await getDocs(qSpaces);
        const spaces: ParkingSpace[] = [];
        spaceSnap.forEach((doc) =>
          spaces.push({ id: doc.id, ...doc.data() } as ParkingSpace),
        );
        setPopularSpaces(spaces);
      } catch (e) {
        console.error("Spaces fetch error:", e);
      }
    };

    let unsubscribeBookings = () => {};
    if (user?.uid) {
      const qBookings = query(
        collection(db, "bookings"),
        where("seekerId", "==", user.uid),
        orderBy("createdAt", "desc"),
      );
      unsubscribeBookings = onSnapshot(
        qBookings,
        (snapshot) => {
          const results: Booking[] = [];
          snapshot.forEach((doc) =>
            results.push({ id: doc.id, ...doc.data() } as Booking),
          );
          setBookings(results);
          setLoading(false);
        },
        () => setLoading(false),
      );
    } else {
      setLoading(false);
    }

    fetchSpaces();
    return () => unsubscribeBookings();
  }, [user]);

  const activeCount = useMemo(
    () => bookings.filter((b) => b.status === "confirmed").length,
    [bookings],
  );
  const totalCount = bookings.length;
  const recentActivity = useMemo(() => bookings.slice(0, 5), [bookings]);

  if (selectedSpace) {
    return (
      <SpaceDetailView
        space={selectedSpace}
        onBack={() => setSelectedSpace(null)}
      />
    );
  }

  return (
    <div className="w-full animate-fade-in-up">
      {/* Header Hero Section - Added mt-4 md:mt-8 to separate from static navbar */}
      <section className="relative overflow-hidden min-h-[70vh] flex flex-col justify-center py-20 rounded-[3rem] mt-4 md:mt-8">
        <div className="absolute inset-0 z-0">
          <img
            src={user ? WELCOME_BG_IMAGE : HERO_IMAGE_URL}
            className="w-full h-full object-cover transform scale-105 hover:scale-100 transition-transform duration-1000"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-transparent"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 md:px-10">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-extrabold text-white tracking-tighter leading-[0.9] mb-10">
              {user
                ? `Hello, ${profile?.name?.split(" ")[0] || "Explorer"}! 👋`
                : "The Smarter Way to Park"}
            </h1>
            <p className="text-slate-200 font-medium text-xl md:text-3xl mb-16 opacity-90 leading-relaxed max-w-3xl">
              {user
                ? "Your journey is already mapped out. Where are we heading next?"
                : "Discover hidden parking gems in your neighborhood. Secure, verified, and affordable slots at your fingertips."}
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-10">
              {!user && (
                <button
                  onClick={() => setActiveTab("spaces")}
                  className="inline-flex items-center gap-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-16 py-8 rounded-[2rem] font-black text-lg transition-all group shadow-2xl shadow-yellow-400/40 active:scale-95"
                >
                  EXPLORE NOW{" "}
                  <ArrowRight
                    size={28}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </button>
              )}

              <div className="flex items-center gap-8 bg-black/40 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 shadow-2xl">
                <div className="flex items-center gap-6 pr-8 border-r border-white/10">
                  <img
                    src={APP_STORE_STICKER}
                    alt="App Store"
                    className="h-12 w-12 object-contain"
                  />
                  <img
                    src={GOOGLE_PLAY_STICKER}
                    alt="Google Play"
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-yellow-400 uppercase tracking-[0.2em] leading-none mb-2">
                    Coming Soon
                  </p>
                  <p className="text-3xl font-black text-white leading-none tracking-tighter">
                    iOS & Android
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-24 space-y-32">
        {/* User Quick Stats (Only if logged in) */}
        {user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl group transition-all hover:scale-[1.01]">
              <Zap
                className="text-yellow-400 mb-6 group-hover:animate-pulse"
                size={48}
                fill="currentColor"
              />
              <p className="text-8xl font-black mb-2 leading-none">
                {activeCount}
              </p>
              <p className="text-[14px] font-black uppercase tracking-widest opacity-50">
                Active Bookings
              </p>
            </div>
            <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm group transition-all hover:scale-[1.01]">
              <History className="text-blue-500 mb-6" size={48} />
              <p className="text-8xl font-black text-slate-900 mb-2 leading-none">
                {totalCount}
              </p>
              <p className="text-[14px] font-black text-slate-400 uppercase tracking-widest">
                Total History
              </p>
            </div>
          </div>
        )}

        {/* Featured Spots Section */}
        <section>
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter">
                Featured Spots
              </h2>
              <p className="text-slate-400 text-xl font-medium mt-2">
                The most reliable locations in the grid.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("spaces")}
              className="hidden md:flex text-xs font-black text-yellow-600 uppercase tracking-widest items-center gap-3 group bg-yellow-50 px-8 py-5 rounded-2xl hover:bg-yellow-100 transition-colors"
            >
              See All{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          <div className="flex gap-10 overflow-x-auto pb-10 scrollbar-hide">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="min-w-[400px] h-80 bg-white border border-slate-100 rounded-[3rem] animate-pulse"
                />
              ))
            ) : popularSpaces.length > 0 ? (
              popularSpaces.map((space) => (
                <div
                  key={space.id}
                  onClick={() => setSelectedSpace(space)}
                  className="min-w-[400px] bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:border-yellow-300 transition-all cursor-pointer hover:shadow-2xl"
                >
                  <div className="h-60 bg-slate-100 relative overflow-hidden">
                    <img
                      src={
                        space.imageUrl ||
                        `https://picsum.photos/seed/${space.id}/600/300`
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt=""
                    />
                    <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-xl px-6 py-3 rounded-2xl text-sm font-black text-slate-900 shadow-xl border border-slate-100">
                      ₹{space.pricing?.car?.hourly || 0}/hr
                    </div>
                  </div>
                  <div className="p-10">
                    <h4 className="font-black text-2xl text-slate-900 truncate mb-2">
                      {space.title}
                    </h4>
                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                      <MapPin size={20} className="text-yellow-500" />
                      <span className="">{space.address}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full p-24 bg-white border-2 border-dashed border-slate-100 rounded-[4rem] text-center">
                <p className="text-slate-400 text-2xl font-bold">
                  No spots discovered yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Mobile App Section */}
        <section className="bg-slate-900 p-16 md:p-24 lg:p-32 rounded-[5rem] flex flex-col lg:flex-row items-center gap-24 overflow-hidden relative">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-yellow-400 rounded-full blur-[200px] opacity-10"></div>
          <div className="flex-1 z-10 space-y-12">
            <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/10 text-white rounded-full text-xs font-black uppercase tracking-widest border border-white/10">
              <Smartphone size={20} className="text-yellow-400" /> COMING SOON
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter">
              Parking Hut in your Pocket
            </h2>
            <p className="text-slate-400 text-xl md:text-2xl leading-relaxed font-medium max-w-2xl">
              Get real-time directions to your spot, instant push notifications
              for booking updates, and quick one-tap extensions right from our
              mobile app.
            </p>
            <div className="flex flex-wrap gap-8 pt-6">
              <div className="transition-all hover:scale-[1.05] cursor-not-allowed">
                <img
                  src={APP_STORE_BADGE}
                  alt="Download on the App Store"
                  className="h-[72px]"
                />
              </div>
              <div className="transition-all hover:scale-[1.05] cursor-not-allowed">
                <img
                  src={GOOGLE_PLAY_BADGE}
                  alt="Get it on Google Play"
                  className="h-[72px]"
                />
              </div>
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center z-10">
            {/* Interactive Phone Mockup */}
            <div className="relative w-80 h-[640px] bg-slate-800 rounded-[4rem] border-[10px] border-slate-700 shadow-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
              <AppPreviewMockup />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></div>
              <div className="absolute bottom-12 left-0 right-0 p-8 text-center pointer-events-none">
                <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-5 font-black text-slate-900 shadow-xl">
                  P
                </div>
                <p className="text-white font-black text-xl">
                  Next-Gen Parking
                </p>
                <p className="text-slate-400 text-sm font-bold mt-1">
                  Version 2.4 Coming Soon
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white p-20 md:p-32 rounded-[5rem] border border-slate-100 shadow-sm">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tighter">
              Simple 1-2-3 Booking
            </h2>
            <p className="text-slate-400 font-medium text-2xl">
              Revolutionizing urban parking one slot at a time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-24">
            {[
              {
                icon: Search,
                title: "Find",
                desc: "Search for spaces near your destination using our real-time grid.",
              },
              {
                icon: Calendar,
                title: "Book",
                desc: "Select your duration and vehicle type. Instant confirmation via SMS.",
              },
              {
                icon: MapPin,
                title: "Park",
                desc: "Navigate to your spot and park with confidence. No more circling!",
              },
            ].map((step, i) => (
              <div key={i} className="text-center group">
                <div className="w-32 h-32 bg-slate-50 text-slate-900 rounded-[3rem] flex items-center justify-center mx-auto mb-10 group-hover:bg-yellow-400 group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <step.icon size={48} strokeWidth={2.5} />
                </div>
                <h4 className="text-3xl font-black text-slate-900 mb-5">
                  {step.title}
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed text-xl">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="flex flex-col lg:flex-row items-center gap-24 py-10">
          <div className="flex-1 space-y-14">
            <div className="inline-block px-6 py-3 bg-yellow-400/10 text-yellow-600 rounded-full text-xs font-black uppercase tracking-widest">
              Premium Features
            </div>
            <h2 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              Safety & Convenience is our Priority
            </h2>
            <div className="grid grid-cols-1 gap-12">
              {[
                {
                  icon: ShieldCheck,
                  title: "Verified Listings",
                  desc: "Every space is physically verified by our safety team before listing.",
                },
                {
                  icon: Award,
                  title: "Best Pricing",
                  desc: "Peer-to-peer rates are 40% cheaper than traditional commercial garages.",
                },
                {
                  icon: Heart,
                  title: "Community Driven",
                  desc: "Built for neighbors, by neighbors. Rated 4.9/5 stars by 10k+ users.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-10 group">
                  <div className="w-20 h-20 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-yellow-500 shadow-sm group-hover:shadow-2xl transition-all flex-shrink-0">
                    <item.icon size={36} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-slate-500 font-medium text-xl leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 w-full h-[800px] rounded-[5rem] overflow-hidden shadow-2xl relative group">
            <img
              src={ABOUT_IMAGE}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              alt="Parking Garage"
            />
            <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors"></div>
          </div>
        </section>

        {/* Statistics Section */}
        <section className="bg-slate-900 p-24 md:p-32 rounded-[5rem] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10 pointer-events-none -translate-y-1/2 translate-x-1/4">
            <Globe size={800} />
          </div>
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-16">
            {[
              { val: "NA", lab: "Cities Covered" },
              { val: "NA", lab: "Parking Slots" },
              { val: "NA", lab: "Hours Parked" },
              { val: "NA", lab: "User Rating" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-6xl md:text-8xl font-black text-yellow-400 mb-5 tracking-tighter">
                  {stat.val}
                </p>
                <p className="text-[14px] font-black uppercase tracking-widest text-slate-400">
                  {stat.lab}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Us Section */}
        <section
          id="contact"
          className="bg-white p-16 md:p-24 rounded-[5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex flex-col lg:flex-row gap-24">
            <div className="flex-1 space-y-12">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
                Get in Touch
              </h2>
              <p className="text-slate-500 font-medium leading-relaxed text-2xl">
                Have questions about listing your space or a recent booking? Our
                support team is here for you 24/7.
              </p>
              <div className="space-y-10 pt-10">
                <div className="flex items-center gap-8 text-slate-600 group">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-yellow-500 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all">
                    <Mail size={32} />
                  </div>
                  <span className="font-black text-2xl">
                    admin@parkinghut.com
                  </span>
                </div>
                <div className="flex items-start gap-8 text-slate-600 group">
                  <div className="w-16 h-16 bg-slate-50 rounded-[1.8rem] flex items-center justify-center text-yellow-500 flex-shrink-0 group-hover:bg-yellow-400 group-hover:text-slate-900 transition-all">
                    <MapPin size={32} />
                  </div>
                  <span className="font-black text-2xl leading-tight mt-4">
                    21, RK Nagar 2nd Street, Korukkupet
                  </span>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-slate-50 p-12 rounded-[4rem]">
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="w-full p-6 bg-white border border-slate-100 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="w-full p-6 bg-white border border-slate-100 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full p-6 bg-white border border-slate-100 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all"
                />
                <textarea
                  placeholder="Tell us more about your inquiry..."
                  rows={6}
                  className="w-full p-6 bg-white border border-slate-100 rounded-3xl font-black text-lg outline-none focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all resize-none"
                ></textarea>
                <button className="w-full py-8 bg-yellow-400 text-slate-900 font-black rounded-3xl shadow-2xl shadow-yellow-400/30 active:scale-95 transition-all text-2xl uppercase tracking-widest">
                  SEND MESSAGE
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Section */}
      <footer className="pt-32 pb-16 border-t border-slate-100 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
          <div className="col-span-1">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-slate-900 text-2xl shadow-xl shadow-yellow-400/20">
                P
              </div>
              <span className="text-3xl font-black text-slate-900 tracking-tighter">
                Parking Hut
              </span>
            </div>
            <p className="text-slate-400 font-medium mb-12 text-xl leading-relaxed">
              Empowering individuals to share their space and earn, while
              solving urban mobility challenges.
            </p>
            <div className="flex gap-6">
              <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-yellow-500 hover:border-yellow-400 transition-all shadow-sm hover:shadow-xl">
                <Instagram size={28} />
              </button>
              <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-yellow-500 hover:border-yellow-400 transition-all shadow-sm hover:shadow-xl">
                <Facebook size={28} />
              </button>
              <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-yellow-500 hover:border-yellow-400 transition-all shadow-sm hover:shadow-xl">
                <XIcon size={24} />
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-10 uppercase tracking-widest text-xs">
              Platform
            </h4>
            <ul className="space-y-6 text-slate-500 font-bold text-lg">
              <li
                className="hover:text-yellow-500 cursor-pointer transition-colors"
                onClick={() => setActiveTab("spaces")}
              >
                Explore Spots
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                List Your Garage
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Safety Protocols
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Help Center
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-10 uppercase tracking-widest text-xs">
              Resources
            </h4>
            <ul className="space-y-6 text-slate-500 font-bold text-lg">
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Pricing Guide
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Provider Dashboard
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Seeker App
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Trust & Safety
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-10 uppercase tracking-widest text-xs">
              Company
            </h4>
            <ul className="space-y-6 text-slate-500 font-bold text-lg">
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Our Vision
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Sustainability
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Partner With Us
              </li>
              <li className="hover:text-yellow-500 cursor-pointer transition-colors">
                Press & Media
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center space-y-6">
          <p className="text-slate-400 font-bold text-lg">
            Copyright © 2026 Parking Hut - All Rights Reserved.
          </p>
          <div className="flex justify-center gap-12 text-[12px] font-black uppercase tracking-widest text-slate-300">
            <span className="hover:text-slate-500 cursor-pointer transition-colors">
              Privacy Policy
            </span>
            <span className="hover:text-slate-500 cursor-pointer transition-colors">
              Terms of Service
            </span>
            <span className="hover:text-slate-500 cursor-pointer transition-colors">
              Cookie Policy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SeekerHome;
