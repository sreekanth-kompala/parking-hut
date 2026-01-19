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
    <div className="flex justify-between items-center mb-6 px-1">
      <div className="text-[10px] font-bold text-slate-900">9:41</div>
      <div className="flex gap-1">
        <div className="w-3 h-3 bg-slate-900 rounded-full opacity-20"></div>
        <div className="w-3 h-3 bg-slate-900 rounded-full opacity-20"></div>
      </div>
    </div>
    <div className="mb-6">
      <h3 className="text-xl font-black text-[#0f172a] leading-tight">
        Hello, John! 👋
      </h3>
      <p className="text-xs font-medium text-slate-400">
        Ready for your next journey?
      </p>
    </div>
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

const CHENNAI_TNAGAR_IMAGE =
  "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=800";
const CHENNAI_KORUKKUPET_IMAGE =
  "https://images.unsplash.com/photo-1626014303757-646c2162a571?auto=format&fit=crop&q=80&w=800";
const CHENNAI_BROADWAY_IMAGE =
  "https://images.unsplash.com/photo-1625890210164-968940562e1e?auto=format&fit=crop&q=80&w=800";

const APP_STORE_BADGE =
  "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg";
const GOOGLE_PLAY_BADGE =
  "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg";
const APP_STORE_STICKER =
  "https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg";
const GOOGLE_PLAY_STICKER =
  "https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg";

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

        if (spaces.length === 0) {
          const mockSpaces: ParkingSpace[] = [
            {
              id: "skyline-tnagar",
              title: "Skyline Parking Garage",
              description:
                "Secure multi-level parking in the heart of T Nagar commercial hub.",
              address: "Ranganathan Street, T Nagar",
              imageUrl: CHENNAI_TNAGAR_IMAGE,
              pricing: {
                car: { hourly: 10, daily: 50, monthly: 1000 },
                bike: { hourly: 5, daily: 20, monthly: 400 },
                suv: { hourly: 15, daily: 70, monthly: 1500 },
              },
              isAvailable: true,
              totalSlots: 20,
              carSlots: 10,
              bikeSlots: 10,
              amenities: ["CCTV", "Security Guard"],
              providerId: "system",
            },
            {
              id: "maruthi-korukkupet",
              title: "Maruthi Garage",
              description:
                "Safe private garage with round-the-clock accessibility in Korukkupet.",
              address: "RK Nagar 2nd Street, Korukkupet",
              imageUrl: CHENNAI_KORUKKUPET_IMAGE,
              pricing: {
                car: { hourly: 10, daily: 50, monthly: 1000 },
                bike: { hourly: 5, daily: 20, monthly: 400 },
                suv: { hourly: 15, daily: 70, monthly: 1500 },
              },
              isAvailable: true,
              totalSlots: 15,
              carSlots: 5,
              bikeSlots: 10,
              amenities: ["Power Backup"],
              providerId: "system",
            },
            {
              id: "broadway-georgetown",
              title: "Broadway",
              description:
                "Convenient parking spot in the George Town area, ideal for daily business visits.",
              address: "Broadway Rd, Asirvada Puram, George Town",
              imageUrl: CHENNAI_BROADWAY_IMAGE,
              pricing: {
                car: { hourly: 10, daily: 50, monthly: 1000 },
                bike: { hourly: 5, daily: 20, monthly: 400 },
                suv: { hourly: 15, daily: 70, monthly: 1500 },
              },
              isAvailable: true,
              totalSlots: 30,
              carSlots: 15,
              bikeSlots: 15,
              amenities: ["CCTV", "Gated Access"],
              providerId: "system",
            },
          ];
          setPopularSpaces(mockSpaces);
        } else {
          setPopularSpaces(spaces);
        }
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

  return (
    <div className="w-full animate-fade-in-up">
      {/* Expanded Hero Section - Container widened to max-w-[1500px] */}
      <section className="relative overflow-hidden min-h-[75vh] flex flex-col justify-center items-center py-24 rounded-[4rem] mt-4 md:mt-8 text-center">
        <div className="absolute inset-0 z-0">
          <img
            src={user ? WELCOME_BG_IMAGE : HERO_IMAGE_URL}
            className="w-full h-full object-cover transform scale-105"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1500px] px-4 md:px-8 lg:px-12 flex flex-col items-center">
          <div className="animate-fade-in-up flex flex-col items-center">
            <h1 className="text-6xl md:text-9xl lg:text-[11rem] font-extrabold text-white tracking-tighter leading-[0.85] mb-12">
              {user
                ? `Hello, ${profile?.name?.split(" ")[0] || "Explorer"}! 👋`
                : "The Smarter Way to Park"}
            </h1>
            <p className="text-slate-200 font-medium text-2xl md:text-4xl mb-20 opacity-90 leading-relaxed max-w-6xl">
              {user
                ? "Your journey is already mapped out. Where are we heading next?"
                : "Discover hidden parking gems in your neighborhood. Secure, verified, and affordable slots at your fingertips."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-12 w-full">
              {!user && (
                <button
                  onClick={() => setActiveTab("spaces")}
                  className="inline-flex items-center gap-6 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-20 py-10 rounded-[2.5rem] font-black text-xl transition-all group shadow-2xl shadow-yellow-400/40 active:scale-[0.98]"
                >
                  EXPLORE NOW{" "}
                  <ArrowRight
                    size={32}
                    className="group-hover:translate-x-2 transition-transform"
                  />
                </button>
              )}

              <div className="flex items-center gap-10 bg-black/40 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white/10 shadow-2xl">
                <div className="flex items-center gap-8 pr-10 border-r border-white/10">
                  <img
                    src={APP_STORE_STICKER}
                    alt="App Store"
                    className="h-14 w-14 object-contain"
                  />
                  <img
                    src={GOOGLE_PLAY_STICKER}
                    alt="Google Play"
                    className="h-14 w-14 object-contain"
                  />
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-yellow-400 uppercase tracking-[0.3em] leading-none mb-3">
                    Coming Soon
                  </p>
                  <p className="text-4xl font-black text-white leading-none tracking-tighter">
                    iOS & Android
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-24 space-y-40">
        {/* Featured Spots Section */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left mb-20 gap-8">
            <div>
              <h2 className="text-6xl md:text-8xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Featured Spots
              </h2>
              <p className="text-slate-400 text-2xl font-medium mt-6">
                The most reliable locations in the grid.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("spaces")}
              className="text-sm font-black text-yellow-600 uppercase tracking-widest items-center gap-4 group bg-yellow-50 px-12 py-8 rounded-[2rem] hover:bg-yellow-100 transition-colors flex shadow-sm"
            >
              See All{" "}
              <ArrowRight
                size={24}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          <div className="flex gap-12 overflow-x-auto pb-14 scrollbar-hide px-4 -mx-4">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[540px] h-[600px] bg-white border border-slate-100 rounded-[4rem] animate-pulse"
                />
              ))
            ) : popularSpaces.length > 0 ? (
              popularSpaces.map((space) => (
                <div
                  key={space.id}
                  className="min-w-[540px] bg-white rounded-[4.5rem] border border-slate-100 shadow-xl overflow-hidden group hover:border-yellow-300 transition-all cursor-pointer flex flex-col"
                >
                  <div className="h-80 bg-slate-100 relative overflow-hidden m-6 rounded-[3.5rem]">
                    <img
                      src={
                        space.imageUrl ||
                        `https://picsum.photos/seed/${space.id}/800/600`
                      }
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={space.title}
                    />
                    <div className="absolute bottom-8 left-8 bg-white px-8 py-4 rounded-3xl text-sm font-black text-slate-900 shadow-2xl border border-slate-100">
                      ₹{space.pricing?.car?.hourly || 0}/hr
                    </div>
                  </div>

                  <div className="p-10 pb-16 text-center flex-1 flex flex-col justify-center">
                    <h4 className="font-black text-4xl text-slate-900 mb-4 tracking-tight">
                      {space.title}
                    </h4>
                    <div className="flex items-center justify-center gap-3 text-slate-400 font-bold text-lg">
                      <MapPin
                        size={26}
                        className="text-yellow-500 flex-shrink-0"
                      />
                      <span className="truncate max-w-[420px]">
                        {space.address}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full p-32 bg-white border-2 border-dashed border-slate-100 rounded-[5rem] text-center">
                <p className="text-slate-400 text-3xl font-bold">
                  No spots discovered yet.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Mobile App Section */}
        <section className="bg-slate-900 p-20 md:p-32 lg:p-40 rounded-[6rem] flex flex-col lg:flex-row items-center gap-32 overflow-hidden relative">
          <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-yellow-400 rounded-full blur-[250px] opacity-10"></div>
          <div className="flex-1 z-10 space-y-16 text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-6 px-8 py-4 bg-white/10 text-white rounded-full text-sm font-black uppercase tracking-widest border border-white/10">
              <Smartphone size={24} className="text-yellow-400" /> COMING SOON
            </div>
            <h2 className="text-7xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter">
              Parking Hut in your Pocket
            </h2>
            <p className="text-slate-400 text-2xl md:text-3xl leading-relaxed font-medium max-w-5xl">
              Get real-time directions to your spot, instant push notifications
              for booking updates, and quick one-tap extensions right from our
              mobile app.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-10 pt-8">
              <img src={APP_STORE_BADGE} alt="App Store" className="h-[84px]" />
              <img
                src={GOOGLE_PLAY_BADGE}
                alt="Play Store"
                className="h-[84px]"
              />
            </div>
          </div>
          <div className="flex-1 w-full flex justify-center z-10">
            <div className="relative w-[360px] h-[720px] bg-slate-800 rounded-[5rem] border-[12px] border-slate-700 shadow-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
              <AppPreviewMockup />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white p-24 md:p-40 rounded-[6rem] border border-slate-100 shadow-sm">
          <div className="text-center mb-32">
            <h2 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tighter">
              Simple 1-2-3 Booking
            </h2>
            <p className="text-slate-400 font-medium text-3xl">
              Revolutionizing urban parking one slot at a time.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-32">
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
                <div className="w-40 h-40 bg-slate-50 text-slate-900 rounded-[4rem] flex items-center justify-center mx-auto mb-12 group-hover:bg-yellow-400 group-hover:scale-110 transition-all duration-500 shadow-sm">
                  <step.icon size={64} strokeWidth={2.5} />
                </div>
                <h4 className="text-4xl font-black text-slate-900 mb-6">
                  {step.title}
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed text-2xl">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer - Container widened to max-w-[1500px] */}
      <footer className="pt-40 pb-20 border-t border-slate-100 bg-white">
        <div className="max-w-[1500px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24 mb-40 text-center md:text-left">
            <div className="col-span-1 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-5 mb-12">
                <div className="w-16 h-16 bg-yellow-400 rounded-3xl flex items-center justify-center font-black text-slate-900 text-3xl shadow-xl">
                  P
                </div>
                <span className="text-4xl font-black text-slate-900 tracking-tighter">
                  Parking Hut
                </span>
              </div>
              <p className="text-slate-400 font-medium mb-16 text-2xl leading-relaxed">
                Empowering individuals to share their space and earn, while
                solving urban mobility challenges.
              </p>
              <div className="flex gap-8">
                <button className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-slate-400 hover:text-yellow-500 transition-all">
                  <Instagram size={32} />
                </button>
                <button className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-slate-400 hover:text-yellow-500 transition-all">
                  <Facebook size={32} />
                </button>
                <button className="w-16 h-16 bg-white border border-slate-100 rounded-3xl flex items-center justify-center text-slate-400 hover:text-yellow-500 transition-all">
                  <XIcon size={28} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-black text-slate-900 mb-12 uppercase tracking-widest text-sm">
                Platform
              </h4>
              <ul className="space-y-8 text-slate-500 font-bold text-xl">
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
            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-black text-slate-900 mb-12 uppercase tracking-widest text-sm">
                Resources
              </h4>
              <ul className="space-y-8 text-slate-500 font-bold text-xl">
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
            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-black text-slate-900 mb-12 uppercase tracking-widest text-sm">
                Company
              </h4>
              <ul className="space-y-8 text-slate-500 font-bold text-xl">
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
          <div className="text-center space-y-8 pt-20 border-t border-slate-50">
            <p className="text-slate-400 font-bold text-xl">
              Copyright © 2026 Parking Hut - All Rights Reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-16 text-[14px] font-black uppercase tracking-widest text-slate-300">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Cookie Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SeekerHome;
