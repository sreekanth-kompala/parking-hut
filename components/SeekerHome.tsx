import React, { useState, useEffect, useMemo, useRef } from "react";
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
  User as UserIcon,
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
  Send,
  Home as HomeIcon,
  Star,
  Quote,
  ChevronRight,
} from "lucide-react";

const FEATURED_IMAGES = [
  "https://i.postimg.cc/2S3zSP8r/Skyline-Parking-Garage.jpg",
  "https://i.postimg.cc/Yq0hXNnC/parking2.webp",
  "https://i.postimg.cc/Jzt1z94R/Maruthi-Garage.jpg",
  "https://i.postimg.cc/9F0rxP8R/parking4.jpg",
  "https://i.postimg.cc/CL5zvCPz/parking3.webp",
  "https://i.postimg.cc/BntqndZr/Broadway-Parking-Garage.jpg",
  "https://i.postimg.cc/tCJYrdS7/parking1.jpg",
];

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

const AppPreviewMockup = () => (
  <div className="w-full h-full bg-[#f8fafc] flex flex-col p-5 text-left select-none overflow-hidden font-sans">
    <div className="flex justify-between items-center mb-4 px-1">
      <div className="text-[10px] font-bold text-slate-900">9:41</div>
      <div className="flex gap-1.5">
        <div className="w-4 h-4 bg-slate-900 rounded-full opacity-20"></div>
        <div className="w-4 h-4 bg-slate-900 rounded-full opacity-20"></div>
      </div>
    </div>

    <div className="mb-6">
      <h3 className="text-2xl font-black text-[#0f172a] leading-tight">
        Hello, John! 👋
      </h3>
      <p className="text-[11px] font-medium text-slate-400">
        Ready for your next journey?
      </p>
    </div>

    <div className="grid grid-cols-2 gap-3 mb-6">
      <div className="bg-[#0f172a] p-5 rounded-[2.2rem] text-white shadow-xl">
        <Zap size={18} fill="#F5B800" className="text-yellow-400 mb-3" />
        <div className="text-3xl font-black leading-none mb-1">1</div>
        <div className="text-[7px] font-black uppercase tracking-widest opacity-60">
          Active Bookings
        </div>
      </div>
      <div className="bg-white p-5 rounded-[2.2rem] border border-slate-100 shadow-sm">
        <History size={18} className="text-blue-500 mb-3" />
        <div className="text-3xl font-black text-slate-900 leading-none mb-1">
          1
        </div>
        <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest">
          Total History
        </div>
      </div>
    </div>

    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-[13px] font-black text-slate-900 uppercase tracking-tight">
          Popular Near You
        </h4>
        <span className="text-[9px] font-black text-yellow-600 uppercase tracking-widest flex items-center gap-1">
          SEE ALL <ArrowRight size={10} strokeWidth={3} />
        </span>
      </div>
      <div className="bg-white rounded-[2.2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="h-28 bg-slate-100 relative">
          <img
            src="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400"
            className="w-full h-full object-cover grayscale opacity-60"
            alt=""
          />
          <div className="absolute bottom-3 left-3 bg-white px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-900 shadow-sm">
            ₹10/hr
          </div>
        </div>
        <div className="p-4">
          <h5 className="font-black text-[12px] text-slate-900 mb-0.5">
            Skyline Parking Garage
          </h5>
          <p className="text-[9px] text-slate-400 font-medium flex items-center gap-1">
            <MapPin size={10} className="text-yellow-500" /> Ranganathan Street
          </p>
        </div>
      </div>
    </div>

    <div className="mt-auto -mx-5 -mb-5 bg-white border-t border-slate-100 px-8 py-5 flex justify-between items-center shadow-inner">
      <div className="flex flex-col items-center gap-1 text-yellow-600">
        <HomeIcon size={16} fill="currentColor" />
        <span className="text-[7px] font-black">HOME</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-slate-300">
        <Search size={16} />
        <span className="text-[7px] font-black">EXPLORE</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-slate-300">
        <Calendar size={16} />
        <span className="text-[7px] font-black">BOOKINGS</span>
      </div>
      <div className="flex flex-col items-center gap-1 text-slate-300">
        <UserIcon size={16} />
        <span className="text-[7px] font-black">PROFILE</span>
      </div>
    </div>
  </div>
);

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=1600";
const WELCOME_BG_IMAGE =
  "https://images.unsplash.com/photo-1449156003053-c30670b96835?auto=format&fit=crop&q=80&w=1600";
const PRIORITY_SECTION_IMAGE =
  "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?auto=format&fit=crop&q=80&w=1200";

const APP_STORE_BADGE =
  "https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg";
const GOOGLE_PLAY_BADGE =
  "https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg";
const APP_STORE_STICKER =
  "https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg";
const GOOGLE_PLAY_STICKER =
  "https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg";

// Utility component for reveal animations
const ScrollReveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
}> = ({ children, className = "", delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      } ${className}`}
    >
      {children}
    </div>
  );
};

const SeekerHome: React.FC = () => {
  const { user, profile, setActiveTab, notify } = useAuth();
  const [popularSpaces, setPopularSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollPos, setScrollPos] = useState(0);

  useEffect(() => {
    const handleMainScroll = () => setScrollPos(window.scrollY);
    window.addEventListener("scroll", handleMainScroll);
    return () => window.removeEventListener("scroll", handleMainScroll);
  }, []);

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
              imageUrl: FEATURED_IMAGES[0],
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
              id: "chennai-central",
              title: "Chennai Central Parking Lot",
              description: "Massive open parking area next to the station.",
              address: "Kannappar Thidal, Park Town, Chennai",
              imageUrl: FEATURED_IMAGES[1],
              pricing: {
                car: { hourly: 20, daily: 80, monthly: 1800 },
                bike: { hourly: 10, daily: 40, monthly: 800 },
                suv: { hourly: 30, daily: 120, monthly: 2500 },
              },
              isAvailable: true,
              totalSlots: 450,
              carSlots: 150,
              bikeSlots: 300,
              amenities: ["CCTV", "Security Guard"],
              providerId: "system",
            },
            {
              id: "maruthi-korukkupet",
              title: "Maruthi Garage",
              description:
                "Safe private garage with round-the-clock accessibility in Korukkupet.",
              address: "RK Nagar 2nd Street, Korukkupet",
              imageUrl: FEATURED_IMAGES[2],
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
          ];
          setPopularSpaces(mockSpaces);
        } else {
          setPopularSpaces(spaces);
        }
      } catch (e) {
        console.error("Spaces fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSpaces();
  }, []);

  const scrollNext = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: "smooth" });
    }
  };

  const scrollPrev = () => {
    scrollRef.current?.scrollBy({ left: -400, behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    notify("Thank you! Our support team will contact you shortly.", "success");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="w-full">
      <section className="relative overflow-hidden min-h-[70vh] flex flex-col justify-center items-center py-16 rounded-[3rem] sm:rounded-[4rem] mt-4 md:mt-6 text-center transition-all duration-700">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={user ? WELCOME_BG_IMAGE : HERO_IMAGE_URL}
            style={{
              transform: `scale(${1.05 + scrollPos * 0.0001}) translateY(${scrollPos * 0.1}px)`,
            }}
            className="w-full h-full object-cover transition-transform duration-100 ease-out"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80"></div>
        </div>

        <div className="relative z-10 w-full max-w-[1500px] xl:max-w-[1800px] 2xl:max-w-[2200px] px-6 md:px-12 lg:px-20 flex flex-col items-center">
          <div className="animate-fade-in-up flex flex-col items-center">
            <h1 className="text-4xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white tracking-tighter leading-tight mb-8 drop-shadow-xl">
              {user
                ? `Hello, ${profile?.name?.split(" ")[0] || "Explorer"}! 👋`
                : "The Smarter Way to Park"}
            </h1>
            <p className="text-slate-200 font-medium text-lg md:text-2xl xl:text-3xl mb-16 opacity-90 leading-relaxed max-w-4xl xl:max-w-5xl">
              {user
                ? "Your journey is already mapped out. Where are we heading next?"
                : "Discover hidden parking gems in your neighborhood. Secure, verified, and affordable slots at your fingertips."}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-10 w-full">
              {!user && (
                <button
                  onClick={() => setActiveTab("spaces")}
                  className="inline-flex items-center gap-4 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-12 py-6 rounded-2xl font-black text-lg transition-all group shadow-2xl shadow-yellow-400/40 active:scale-[0.98]"
                >
                  EXPLORE NOW{" "}
                  <ArrowRight
                    size={24}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              )}

              <div className="flex items-center gap-8 bg-black/40 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 shadow-2xl">
                <div className="flex items-center gap-6 pr-8 border-r border-white/10">
                  <img
                    src={APP_STORE_STICKER}
                    alt="App Store"
                    className="h-10 w-10 object-contain"
                  />
                  <img
                    src={GOOGLE_PLAY_STICKER}
                    alt="Google Play"
                    className="h-10 w-10 object-contain"
                  />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest leading-none mb-2">
                    Coming Soon
                  </p>
                  <p className="text-2xl font-black text-white leading-none tracking-tight">
                    iOS & Android
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="py-20 space-y-32">
        <ScrollReveal className="relative">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left mb-16 gap-6 px-4">
            <div>
              <h2 className="text-3xl md:text-5xl xl:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                Featured Spots
              </h2>
              <p className="text-slate-400 text-xl font-medium mt-4">
                The most reliable locations in the grid.
              </p>
            </div>
            <button
              onClick={() => setActiveTab("spaces")}
              className="text-xs font-black text-yellow-600 uppercase tracking-widest items-center gap-3 group bg-yellow-50 px-10 py-5 rounded-2xl hover:bg-yellow-100 transition-colors flex shadow-sm"
            >
              See All{" "}
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>

          <div className="relative group">
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex gap-10 overflow-x-auto pb-12 scrollbar-hide px-4 -mx-4 transition-all"
            >
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="min-w-[340px] xl:min-w-[440px] 2xl:min-w-[520px] h-[500px] bg-white border border-slate-100 rounded-[3rem] animate-pulse"
                  />
                ))
              ) : popularSpaces.length > 0 ? (
                popularSpaces.map((space, index) => (
                  <div
                    key={space.id}
                    className="min-w-[340px] xl:min-w-[440px] 2xl:min-w-[520px] bg-white rounded-[3rem] border border-slate-100 shadow-lg overflow-hidden group hover:border-yellow-300 transition-all cursor-pointer flex flex-col"
                  >
                    <div className="h-56 xl:h-64 bg-slate-100 relative overflow-hidden m-4 rounded-[2.2rem]">
                      <img
                        src={FEATURED_IMAGES[index % FEATURED_IMAGES.length]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        alt={space.title}
                      />
                      <div className="absolute bottom-6 left-6 bg-white px-6 py-3 rounded-2xl text-xs font-black text-slate-900 shadow-xl border border-slate-100">
                        ₹{space.pricing?.car?.hourly || 0}/hr
                      </div>
                    </div>

                    <div className="p-8 pb-12 text-center flex-1 flex flex-col justify-center">
                      <h4 className="font-black text-2xl xl:text-3xl text-slate-900 mb-3 tracking-tight leading-tight">
                        {space.title}
                      </h4>
                      <div className="flex items-center justify-center gap-2 text-slate-400 font-bold text-sm xl:text-base">
                        <MapPin
                          size={18}
                          className="text-yellow-500 flex-shrink-0"
                        />
                        <span className="truncate max-w-[280px] xl:max-w-[380px]">
                          {space.address}
                        </span>
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

            {canScrollLeft && (
              <button
                onClick={scrollPrev}
                className="absolute top-1/2 left-4 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md text-slate-900 rounded-xl flex items-center justify-center border border-white/30 hover:bg-yellow-400/20 hover:border-yellow-400 hover:text-yellow-600 shadow-lg hover:scale-110 active:scale-95 transition-all z-20 group"
              >
                <ChevronLeft
                  size={32}
                  strokeWidth={3}
                  className="group-hover:-translate-x-1 transition-transform"
                />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={scrollNext}
                className="absolute top-1/2 right-4 -translate-y-1/2 w-16 h-16 bg-white/10 backdrop-blur-md text-slate-900 rounded-xl flex items-center justify-center border border-white/30 hover:bg-yellow-400/20 hover:border-yellow-400 hover:text-yellow-600 shadow-lg hover:scale-110 active:scale-95 transition-all z-20 group"
                aria-label="Next featured spot"
              >
                <ChevronRight
                  size={32}
                  strokeWidth={3}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>
            )}
          </div>
        </ScrollReveal>

        <ScrollReveal className="bg-white p-16 md:p-24 rounded-[4rem] border border-slate-100 shadow-sm transition-all duration-500">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter">
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
              <ScrollReveal
                key={i}
                delay={i * 200}
                className="text-center group"
              >
                <div className="w-32 h-32 bg-slate-50 text-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 group-hover:bg-yellow-400 group-hover:text-white transition-all duration-500 shadow-sm">
                  <step.icon size={48} strokeWidth={2.5} />
                </div>
                <h4 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
                  {step.title}
                </h4>
                <p className="text-slate-500 font-medium leading-relaxed text-lg">
                  {step.desc}
                </p>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        <section className="px-4">
          <ScrollReveal className="max-w-[1500px] xl:max-w-[1800px] 2xl:max-w-[2200px] mx-auto bg-white rounded-[4rem] border border-slate-100 overflow-hidden shadow-sm flex flex-col lg:flex-row items-stretch">
            <div className="flex-1 p-12 md:p-16 lg:p-20 xl:p-24 flex flex-col justify-center">
              <div className="inline-flex items-center px-4 py-1.5 bg-yellow-50 text-yellow-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 self-start">
                Premium Features
              </div>
              <h2 className="text-4xl md:text-5xl xl:text-6xl font-black text-slate-900 leading-[1.1] tracking-tighter mb-12">
                Safety & Convenience is our Priority
              </h2>

              <div className="space-y-10">
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
                  <ScrollReveal
                    key={i}
                    delay={i * 150}
                    className="flex gap-6 items-start group"
                  >
                    <div className="p-4 bg-white rounded-2xl shadow-xl border border-slate-50 text-yellow-500 group-hover:bg-yellow-400 group-hover:text-white transition-all duration-300">
                      <item.icon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg mb-1 leading-tight">
                        {item.title}
                      </h4>
                      <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-sm">
                        {item.desc}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-[400px] relative overflow-hidden group">
              <img
                src={PRIORITY_SECTION_IMAGE}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                alt="Safety Priority"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-900/10"></div>
            </div>
          </ScrollReveal>
        </section>

        <section className="px-4">
          <ScrollReveal className="max-w-[1500px] xl:max-w-[1800px] 2xl:max-w-[2200px] mx-auto bg-[#0f172a] rounded-[4rem] p-16 md:p-24 text-center flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl shadow-slate-900/40">
            <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            <div className="relative z-10 space-y-8 max-w-2xl">
              <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                Partner with Us
              </h2>
              <p className="text-slate-400 text-xl md:text-2xl font-medium leading-relaxed">
                Transform your empty garage into a steady revenue stream. Join
                thousands of providers in the Grid.
              </p>
              <button
                onClick={() => setActiveTab("profile")}
                className="mt-6 px-12 py-5 bg-white hover:bg-yellow-400 text-slate-900 font-black rounded-2xl text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                START LISTING
              </button>
            </div>
          </ScrollReveal>
        </section>

        <section className="space-y-32">
          <div className="max-w-[1500px] xl:max-w-[1800px] 2xl:max-w-[2200px] mx-auto px-4">
            <ScrollReveal className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 bg-white rounded-[3rem] border border-slate-100 shadow-sm items-center divide-y md:divide-y-0 md:divide-x divide-slate-50">
              <div className="px-12 py-6 text-center">
                <p className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-2">
                  NA
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Verified Spots
                </p>
              </div>
              <div className="px-12 py-6 text-center">
                <p className="text-5xl lg:text-6xl font-black text-yellow-400 tracking-tighter mb-2">
                  NA
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Booked Hours
                </p>
              </div>
              <div className="px-12 py-6 text-center">
                <p className="text-5xl lg:text-6xl font-black text-slate-900 tracking-tighter mb-2">
                  NA
                </p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Provider Earnings
                </p>
              </div>
            </ScrollReveal>
          </div>

          <div className="max-w-[1500px] xl:max-w-[1800px] 2xl:max-w-[2200px] mx-auto px-4">
            <ScrollReveal className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none mb-6">
                  Voices from the Grid
                </h2>
                <p className="text-slate-400 text-xl font-medium leading-relaxed">
                  See how Parking Hut is changing the way people move and earn
                  across the city.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-100"
                    >
                      <img
                        src={`https://i.pravatar.cc/150?u=${i + 10}`}
                        alt="User"
                      />
                    </div>
                  ))}
                </div>
                <div className="pl-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    Community Trusted
                  </p>
                  <div className="flex text-yellow-400 gap-0.5">
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                    <Star size={14} fill="currentColor" />
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                {
                  name: "Raja Shanmugam",
                  role: "Daily Commuter",
                  text: "Found a secure spot right next to my office for half the price of the public garage. The SMS alerts are a game changer.",
                  rating: 5,
                  img: "https://i.postimg.cc/9XYv9JDj/userrating1.jpg",
                },
                {
                  name: "Diya V",
                  role: "Garage Provider",
                  text: "My empty driveway now pays for my monthly groceries. The verification process was quick and professional.",
                  rating: 5,
                  img: "https://i.postimg.cc/050LScbh/userrating2.jpg",
                },
                {
                  name: "Arya Kannan",
                  role: "Frequent Traveler",
                  text: "Booking a 10-day spot near the station was so easy. I felt safe leaving my car in a verified gated residence.",
                  rating: 5,
                  img: "https://i.postimg.cc/hP4N1Tmq/userrating3.png",
                },
              ].map((t, i) => (
                <ScrollReveal
                  key={i}
                  delay={i * 200}
                  className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm flex flex-col hover:border-yellow-400 transition-all group"
                >
                  <div className="mb-10 text-yellow-100 group-hover:text-yellow-400 transition-colors">
                    <Quote size={40} fill="currentColor" strokeWidth={0} />
                  </div>
                  <p className="text-slate-500 font-medium text-lg leading-relaxed flex-1 mb-10 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-6 pt-10 border-t border-slate-50">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 flex-shrink-0">
                      <img
                        src={t.img}
                        className="w-full h-full object-cover"
                        alt={t.name}
                      />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-lg leading-none mb-1">
                        {t.name}
                      </h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4">
          <ScrollReveal className="bg-[#0f172a] p-12 md:p-20 lg:p-24 rounded-[4rem] flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative transition-all duration-500">
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-yellow-400 rounded-full blur-[200px] opacity-10"></div>
            <div className="flex-1 z-10 space-y-12 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-white/5 text-white/60 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                <Smartphone size={16} className="text-yellow-400" /> COMING SOON
              </div>
              <h2 className="text-6xl md:text-8xl xl:text-9xl font-black text-white leading-[0.9] tracking-tighter max-w-xl">
                Parking Hut in your Pocket
              </h2>
              <p className="text-slate-400 text-xl md:text-2xl leading-relaxed font-medium max-w-xl">
                Get real-time directions to your spot, instant push
                notifications for booking updates, and quick one-tap extensions
                right from our mobile app.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-4">
                <img
                  src={APP_STORE_BADGE}
                  alt="App Store"
                  className="h-[65px] hover:scale-105 transition-transform cursor-pointer"
                />
                <img
                  src={GOOGLE_PLAY_BADGE}
                  alt="Play Store"
                  className="h-[65px] hover:scale-105 transition-transform cursor-pointer"
                />
              </div>
            </div>

            <div className="flex-1 w-full flex justify-center lg:justify-end z-10 lg:pr-10">
              <div className="relative w-[340px] h-[680px] xl:w-[380px] xl:h-[760px] bg-[#0f172a] rounded-[4.5rem] border-[12px] border-[#1e293b] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] overflow-hidden group hover:scale-[1.02] transition-all duration-700">
                <AppPreviewMockup />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 via-transparent to-white/10 opacity-30"></div>
              </div>
            </div>
          </ScrollReveal>
        </section>

        <section className="px-4">
          <ScrollReveal className="max-w-[1500px] xl:max-w-[1800px] 2xl:max-w-[2200px] mx-auto flex flex-col lg:flex-row gap-12">
            <div className="flex-1 bg-white p-12 md:p-16 rounded-[3.5rem] border border-slate-100 shadow-sm transition-all">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-3 leading-tight">
                Get in Touch
              </h2>
              <p className="text-slate-400 font-medium mb-12 text-base leading-relaxed">
                Have questions about listing your space or finding a spot? Our
                team is here to help you 24/7.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-yellow-500 transition-colors">
                      NAME
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Your name"
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-yellow-500 transition-colors">
                      EMAIL
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="name@example.com"
                      className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-slate-900 placeholder:text-slate-300"
                    />
                  </div>
                </div>
                <div className="group">
                  <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 group-focus-within:text-yellow-500 transition-colors">
                    MESSAGE
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="How can we help you?"
                    className="w-full px-6 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none focus:border-yellow-400 focus:bg-white transition-all font-bold text-slate-900 resize-none placeholder:text-slate-300"
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="w-full py-6 bg-[#F5B800] hover:bg-[#D4A017] text-slate-900 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-yellow-400/20 uppercase tracking-[0.15em] text-xs"
                >
                  <Send size={16} fill="currentColor" /> SEND MESSAGE
                </button>
              </form>
            </div>

            <div className="w-full lg:w-[420px] space-y-6 flex flex-col">
              {[
                {
                  icon: Mail,
                  label: "SUPPORT EMAIL",
                  value: "admin@parkinghut.com",
                  iconColor: "text-blue-500",
                },
                {
                  icon: Phone,
                  label: "SUPPORT LINE",
                  value: "+91 99401 23099",
                  iconColor: "text-green-500",
                },
                {
                  icon: MapPin,
                  label: "CORPORATE OFFICE",
                  value: "Tower 4, Grid Sector, Chennai TN",
                  iconColor: "text-red-500",
                },
              ].map((item, i) => (
                <ScrollReveal
                  key={i}
                  delay={i * 100}
                  className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-yellow-100 transition-all cursor-default"
                >
                  <div
                    className={`w-14 h-14 flex items-center justify-center bg-slate-50 rounded-2xl ${item.iconColor} group-hover:bg-yellow-50 transition-colors`}
                  >
                    <item.icon size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1.5 leading-none">
                      {item.label}
                    </p>
                    <p className="text-base font-black text-slate-900 tracking-tight leading-none">
                      {item.value}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </ScrollReveal>
        </section>
      </div>

      <footer className="pt-24 pb-12 border-t border-slate-100 bg-white">
        <div className="max-w-[1500px] xl:max-w-[1800px] 2xl:max-w-[2200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-24 text-center md:text-left">
            <div className="col-span-1 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center font-black text-slate-900 text-2xl shadow-lg">
                  P
                </div>
                <span className="text-3xl font-black text-slate-900 tracking-tighter">
                  Parking Hut
                </span>
              </div>
              <p className="text-slate-400 font-medium mb-12 text-lg leading-relaxed">
                Empowering individuals to share their space and earn, while
                solving urban mobility challenges.
              </p>
              <div className="flex gap-6">
                <button className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-yellow-500 transition-all">
                  <Instagram size={24} />
                </button>
                <button className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-yellow-500 transition-all">
                  <Facebook size={24} />
                </button>
                <button className="w-12 h-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-yellow-500 transition-all">
                  <XIcon size={20} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center md:items-start">
              <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-xs">
                Platform
              </h4>
              <ul className="space-y-6 text-slate-500 font-bold text-base">
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
              <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-xs">
                Resources
              </h4>
              <ul className="space-y-6 text-slate-500 font-bold text-base">
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
              <h4 className="font-black text-slate-900 mb-8 uppercase tracking-widest text-xs">
                Company
              </h4>
              <ul className="space-y-6 text-slate-500 font-bold text-base">
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
          <div className="text-center space-y-6 pt-16 border-t border-slate-50">
            <p className="text-slate-400 font-bold text-base">
              Copyright © 2026 Parking Hut - All Rights Reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-12 text-[12px] font-black uppercase tracking-widest text-slate-300">
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
