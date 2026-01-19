import React, { useState, useEffect, useMemo, useRef } from 'react';
import { collection, query, where, doc, onSnapshot, runTransaction, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { ParkingSpace, VehicleType } from '../types';
import { 
  Search, MapPin, Car, Bike, ShieldCheck, 
  Loader2, Lock, Video, Zap, Battery, Info, 
  CloudRain, X as CloseIcon, LogIn
} from 'lucide-react';

const getAmenityIcon = (name: string) => {
  const iconProps = { size: 16 };
  switch (name) {
    case 'CCTV': return <Video {...iconProps} />;
    case 'Security Guard': return <ShieldCheck {...iconProps} />;
    case 'EV Charging': return <Zap {...iconProps} />;
    case 'Gated Access': return <Lock {...iconProps} />;
    case 'Rain Shelter': return <CloudRain {...iconProps} />;
    case 'Power Backup': return <Battery {...iconProps} />;
    default: return <Info {...iconProps} />;
  }
};

const AmenityTag: React.FC<{ name: string }> = ({ name }) => {
  const [showName, setShowName] = useState(false);
  const timerRef = useRef<number | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    
    setShowName(true);
    timerRef.current = window.setTimeout(() => {
      setShowName(false);
      timerRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div 
      onClick={handleClick}
      className={`relative flex items-center justify-center p-2 rounded-xl transition-all duration-300 cursor-pointer select-none ${
        showName 
          ? 'bg-yellow-400 text-slate-900 shadow-lg shadow-yellow-400/20' 
          : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 border border-slate-100'
      }`}
    >
      {getAmenityIcon(name)}
      {showName && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest whitespace-nowrap rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
          {name}
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};

const SeekerDashboard: React.FC = () => {
  const { user, profile, notify, updateNotify } = useAuth();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpace, setSelectedSpace] = useState<ParkingSpace | null>(null);
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const isSeeker = profile?.role === 'seeker' || !user;

  useEffect(() => {
    const q = query(collection(db, 'spaces'), where('isAvailable', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: ParkingSpace[] = [];
      snapshot.forEach((doc) => results.push({ id: doc.id, ...doc.data() } as ParkingSpace));
      setSpaces(results);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, []);

  const priceCalculation = useMemo(() => {
    if (!selectedSpace) return { total: 0, label: '', unit: '' };
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (end <= start) return { total: 0, label: 'Invalid duration', unit: '' };

    const pricing = selectedSpace.pricing?.[vehicleType];
    if (!pricing) return { total: 0, label: 'Unavailable', unit: '' };

    const MS_PER_HOUR = 1000 * 60 * 60;
    const MS_PER_DAY = MS_PER_HOUR * 24;
    const MS_PER_MONTH = MS_PER_DAY * 30;

    let remaining = end - start;
    let months = Math.floor(remaining / MS_PER_MONTH);
    remaining %= MS_PER_MONTH;
    let days = Math.floor(remaining / MS_PER_DAY);
    remaining %= MS_PER_DAY;
    let hours = Math.ceil(remaining / MS_PER_HOUR);

    if (hours > 0 && (hours * pricing.hourly > pricing.daily)) { hours = 0; days += 1; }
    if (days >= 30) { months += Math.floor(days / 30); days %= 30; }
    const remainderCost = (days * pricing.daily) + (hours * pricing.hourly);
    if (remainderCost > pricing.monthly) { days = 0; hours = 0; months += 1; }

    const total = (months * pricing.monthly) + (days * pricing.daily) + (hours * pricing.hourly);
    let parts: string[] = [];
    if (months > 0) parts.push(`${months} Mo`);
    if (days > 0) parts.push(`${days} D`);
    if (hours > 0) parts.push(`${hours} H`);
    return { total, label: parts.join(' + ') || 'Short stay', unit: 'Rate Applied' };
  }, [selectedSpace, vehicleType, startDate, endDate]);

  const handleBook = async (space: ParkingSpace) => {
    if (!user) {
      notify("Please login to reserve a parking spot.", "info");
      return;
    }
    if (profile?.role === 'provider') {
      notify("Provider accounts cannot book spaces.", "error");
      return;
    }

    if (new Date(endDate) <= new Date(startDate)) {
      notify("End time must be after start time.", "error");
      return;
    }

    setBookingLoading(true);
    const nid = notify("Processing reservation...", "info", ["Checking Availability", "Securing Asset", "Confirming"]);
    
    try {
      const spaceRef = doc(db, 'spaces', space.id);
      await runTransaction(db, async (transaction) => {
        const spaceDoc = await transaction.get(spaceRef);
        if (!spaceDoc.exists()) throw new Error("Space listing no longer exists.");

        const data = spaceDoc.data() as ParkingSpace;
        const currentCarSlots = Number(data.carSlots);
        const currentBikeSlots = Number(data.bikeSlots);

        if (vehicleType === 'car' && currentCarSlots <= 0) throw new Error("Car slots are now full.");
        if (vehicleType === 'bike' && currentBikeSlots <= 0) throw new Error("Bike slots are now full.");

        const updatedCarSlots = vehicleType === 'car' ? currentCarSlots - 1 : currentCarSlots;
        const updatedBikeSlots = vehicleType === 'bike' ? currentBikeSlots - 1 : currentBikeSlots;
        const newTotal = updatedCarSlots + updatedBikeSlots;

        updateNotify(nid, { currentStep: 1, message: "Recording booking..." });
        const bookingRef = doc(collection(db, 'bookings'));
        transaction.set(bookingRef, {
          spaceId: space.id,
          seekerId: user.uid,
          providerId: space.providerId,
          vehicleType: vehicleType,
          startTime: new Date(startDate).getTime(),
          endTime: new Date(endDate).getTime(),
          totalAmount: priceCalculation.total,
          status: 'confirmed',
          createdAt: serverTimestamp(),
          spaceTitle: space.title,
          spaceAddress: space.address,
          seekerName: profile?.name || user.displayName || 'User',
          seekerPhone: profile?.phone || 'Not provided'
        });

        updateNotify(nid, { currentStep: 2, message: "Updating listing availability..." });
        transaction.update(spaceRef, {
          carSlots: updatedCarSlots,
          bikeSlots: updatedBikeSlots,
          totalSlots: newTotal,
          isAvailable: newTotal > 0
        });
      });

      updateNotify(nid, { type: 'success', message: 'Slot Reserved Successfully!', currentStep: 2 });
      setSelectedSpace(null);
    } catch (err: any) {
      updateNotify(nid, { type: 'error', message: err.message || "Reservation failed." });
    } finally {
      setBookingLoading(false);
    }
  };

  const filteredSpaces = spaces.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="py-12 w-full animate-fade-in-up">
      <div className="mb-12">
        <h1 className="text-5xl font-black text-slate-900 mb-2 tracking-tighter">Explore Spaces</h1>
        <p className="text-slate-500 text-2xl font-medium">Rent convenient parking near your destination in real-time.</p>
      </div>

      <div className="relative mb-16 group">
        <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none text-slate-400 group-focus-within:text-yellow-500 transition-colors">
          <Search size={32} />
        </div>
        <input
          type="text"
          placeholder="Search for cities, landmarks, or garage names..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-20 pr-12 py-8 bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 outline-none focus:ring-8 focus:ring-yellow-400/10 focus:border-yellow-400 transition-all text-2xl font-black text-slate-900 placeholder:text-slate-300"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-12">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-white border border-slate-100 rounded-[3rem] animate-pulse"></div>)}
        </div>
      ) : filteredSpaces.length === 0 ? (
        <div className="text-center py-40 bg-white rounded-[4rem] border border-slate-100 shadow-sm">
           <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6"><Search size={48} /></div>
           <p className="text-slate-400 font-black text-3xl tracking-tight">No parking spots found in this sector.</p>
           <button onClick={() => setSearchTerm('')} className="mt-8 text-yellow-600 font-black uppercase tracking-widest text-sm hover:text-yellow-700 transition-colors">Clear Search Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-12">
          {filteredSpaces.map(space => (
            <div key={space.id} className="bg-white rounded-[4rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden group" onClick={() => setSelectedSpace(space)}>
              <div className="h-64 bg-slate-100 relative overflow-hidden">
                <img src={space.imageUrl || `https://picsum.photos/seed/${space.id}/600/300`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
                <div className="absolute top-6 right-6 flex flex-col gap-3 items-end">
                   <div className={`px-6 py-2 rounded-full text-xs font-black border shadow-2xl flex items-center gap-3 ${space.carSlots > 0 ? 'bg-white/95 text-slate-700' : 'bg-red-500 text-white border-red-400'}`}>
                     <Car size={18} className={space.carSlots > 0 ? "text-yellow-500" : "text-white"} /> {space.carSlots || 0}
                   </div>
                   <div className={`px-6 py-2 rounded-full text-xs font-black border shadow-2xl flex items-center gap-3 ${space.bikeSlots > 0 ? 'bg-white/95 text-slate-700' : 'bg-red-500 text-white border-red-400'}`}>
                     <Bike size={18} className={space.bikeSlots > 0 ? "text-blue-500" : "text-white"} /> {space.bikeSlots || 0}
                   </div>
                 </div>
              </div>
              <div className="p-10 flex-1 flex flex-col">
                <h3 className="font-black text-3xl text-slate-900 truncate mb-2 leading-none">{space.title}</h3>
                <div className="flex items-center text-slate-400 text-sm font-medium mb-10 gap-2">
                  <MapPin size={20} className="text-yellow-500" />
                  <span className="truncate">{space.address}</span>
                </div>
                <div className="flex items-center justify-between mt-auto">
                   <div className="flex flex-wrap gap-2">
                      {space.amenities.map(a => <AmenityTag key={a} name={a} />)}
                   </div>
                   <div className="text-yellow-600 font-black text-2xl ml-4 whitespace-nowrap">₹{space.pricing?.car?.hourly || 0}<span className="text-slate-300 font-bold text-sm">/hr</span></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSpace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => !bookingLoading && setSelectedSpace(null)}></div>
          <div className="relative w-full max-w-xl bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
             <div className="p-12 lg:p-16">
                <div className="flex justify-between items-center mb-10">
                   <div>
                     <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Secure Slot</h2>
                     <p className="text-slate-400 font-medium text-lg truncate max-w-[280px]">{selectedSpace.title}</p>
                   </div>
                   <button onClick={() => setSelectedSpace(null)} className="p-4 bg-slate-50 hover:bg-slate-100 rounded-full transition-all text-slate-400"><CloseIcon size={28} /></button>
                </div>
                {!user ? (
                   <div className="text-center py-10">
                      <div className="w-24 h-24 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8"><LogIn size={40} /></div>
                      <p className="text-slate-900 font-black mb-4 text-2xl">Identity Required</p>
                      <p className="text-slate-500 font-medium text-lg mb-10">You need an account to book parking spots and contact hosts.</p>
                      <button onClick={() => window.location.reload()} className="w-full py-6 bg-yellow-400 text-slate-900 font-black rounded-3xl shadow-2xl shadow-yellow-400/20 active:scale-95 transition-all text-xl">SIGN IN TO BOOK</button>
                   </div>
                ) : (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div><label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">Start Time</label><input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-yellow-400 transition-all" /></div>
                       <div><label className="block text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">End Time</label><input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black outline-none focus:border-yellow-400 transition-all" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <button onClick={() => setVehicleType('car')} disabled={selectedSpace.carSlots <= 0} className={`flex items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all ${vehicleType === 'car' ? 'border-yellow-400 bg-yellow-50 text-slate-900 shadow-xl' : 'border-slate-50 text-slate-400'}`}><Car size={32} /><span className="font-black text-lg">CAR</span></button>
                       <button onClick={() => setVehicleType('bike')} disabled={selectedSpace.bikeSlots <= 0} className={`flex items-center gap-4 p-8 rounded-[2.5rem] border-2 transition-all ${vehicleType === 'bike' ? 'border-yellow-400 bg-yellow-50 text-slate-900 shadow-xl' : 'border-slate-50 text-slate-400'}`}><Bike size={32} /><span className="font-black text-lg">BIKE</span></button>
                    </div>
                    <div className="bg-slate-900 rounded-[3.5rem] p-10 md:p-12 text-white shadow-2xl">
                       <div className="flex justify-between items-center mb-8"><div><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2">Estimated Total</span><span className="text-5xl font-black text-yellow-400">₹{priceCalculation.total.toFixed(0)}</span></div><div className="text-right font-black text-slate-500 text-[11px] uppercase tracking-widest">{priceCalculation.label}</div></div>
                       <button onClick={() => handleBook(selectedSpace)} disabled={bookingLoading || priceCalculation.total <= 0} className="w-full py-6 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-[2rem] transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50 text-xl tracking-widest uppercase">{bookingLoading ? <Loader2 className="animate-spin" size={24} /> : 'RESERVE NOW'}</button>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;