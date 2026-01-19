import React, { useState, useEffect, useRef, useMemo } from 'react';
import { collection, query, where, addDoc, doc, deleteDoc, onSnapshot, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../AuthContext';
import { ParkingSpace, SpacePricing, Booking } from '../types';
import { Plus, MapPin, Trash2, Shield, Briefcase, Loader2, Wand2, Camera, X as CloseIcon, Upload, Car, Bike, Phone, User as UserIcon, Video, ShieldCheck, Zap, Lock, CloudRain, Battery, Info, Edit2, History } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const AMENITIES_LIST = [
  'CCTV', 'Security Guard', 'EV Charging', 'Gated Access', 'Rain Shelter', 'Power Backup'
];

const INITIAL_PRICING: SpacePricing = {
  car: { hourly: 10, daily: 50, monthly: 1000 },
  bike: { hourly: 5, daily: 20, monthly: 400 },
  suv: { hourly: 15, daily: 70, monthly: 1500 }
};

const getAmenityIcon = (name: string) => {
  const iconProps = { size: 14 };
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
      className={`relative flex items-center justify-center p-1.5 rounded-lg transition-all cursor-pointer ${
        showName ? 'bg-yellow-400 text-slate-900 shadow-md' : 'bg-slate-50 text-slate-400 border border-slate-100'
      }`}
    >
      {getAmenityIcon(name)}
      {showName && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-tighter whitespace-nowrap rounded shadow-lg animate-in fade-in slide-in-from-bottom-1 duration-300 z-50">
          {name}
          {/* Tooltip Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
        </div>
      )}
    </div>
  );
};

const ProviderDashboard: React.FC = () => {
  const { user, notify, updateNotify } = useAuth();
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState<string | null>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionStartTime = useRef(Date.now());
  
  const [newSpace, setNewSpace] = useState({
    title: '',
    description: '',
    address: '',
    landmark: '',
    amenities: [] as string[],
    pricing: JSON.parse(JSON.stringify(INITIAL_PRICING)) as SpacePricing,
    carSlots: 1,
    bikeSlots: 0
  });

  const sanitizeInt = (val: string): number => {
    const digits = val.replace(/[^0-9]/g, '');
    const cleaned = digits.replace(/^0+(?=\d)/, '');
    return cleaned === '' ? 0 : parseInt(cleaned, 10);
  };

  useEffect(() => {
    if (!user) return;

    const qSpaces = query(collection(db, 'spaces'), where('providerId', '==', user.uid));
    const unsubscribeSpaces = onSnapshot(qSpaces, (snapshot) => {
      const results: ParkingSpace[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as ParkingSpace);
      });
      setSpaces(results);
      setLoading(false);
    }, (error) => {
      console.error("Spaces listener error:", error);
      setLoading(false);
    });

    const qBookings = query(
      collection(db, 'bookings'),
      where('providerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeBookings = onSnapshot(qBookings, (snapshot) => {
      const results: Booking[] = [];
      snapshot.forEach(doc => results.push({ id: doc.id, ...doc.data() } as Booking));
      setBookings(results);

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const booking = change.doc.data() as any;
          const createdAtMs = booking.createdAt?.toMillis ? booking.createdAt.toMillis() : booking.createdAt;
          if (createdAtMs && createdAtMs > sessionStartTime.current) {
            notify(`New Booking! ${booking.seekerName || 'A customer'} reserved a slot.`, 'success');
          }
        }
      });
    });

    return () => {
      unsubscribeSpaces();
      unsubscribeBookings();
    };
  }, [user]);

  const activeBookingsCount = useMemo(() => bookings.filter(b => b.status === 'confirmed').length, [bookings]);
  const recentBookingsList = useMemo(() => bookings.slice(0, 5), [bookings]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMagicDescription = async () => {
    if (!newSpace.title) {
      notify("Please enter a space name first.", "info");
      return;
    }
    setAiLoading(true);
    const nid = notify("Gemini is crafting description...", "info");
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Write a catchy 2-sentence description for: "${newSpace.title}". Amenities: ${newSpace.amenities.join(', ')}. Focus on safety.`;
      const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });
      if (response.text) {
        setNewSpace(prev => ({ ...prev, description: response.text.trim() }));
        updateNotify(nid, { type: 'success', message: "Description enhanced!" });
      }
    } catch (err) {
      updateNotify(nid, { type: 'error', message: "AI description failed." });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const actionLabel = editingSpaceId ? "Updating" : "Publishing";
    const nid = notify(`${actionLabel} space...`, "info", ["Uploading Photo", "Saving Data", "Confirming"]);
    try {
      let imageUrl = imagePreview || '';
      if (selectedFile) {
        const storageRef = ref(storage, `spaces/${user.uid}/${Date.now()}_${selectedFile.name}`);
        const uploadResult = await uploadBytes(storageRef, selectedFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const spaceData = {
        ...newSpace,
        totalSlots: newSpace.carSlots + newSpace.bikeSlots,
        imageUrl: imageUrl,
        providerId: user.uid,
        isAvailable: (newSpace.carSlots + newSpace.bikeSlots) > 0,
      };

      if (editingSpaceId) {
        await updateDoc(doc(db, 'spaces', editingSpaceId), spaceData);
        updateNotify(nid, { type: 'success', message: 'Space Updated!', currentStep: 2 });
      } else {
        await addDoc(collection(db, 'spaces'), {
          ...spaceData,
          createdAt: serverTimestamp()
        });
        updateNotify(nid, { type: 'success', message: 'Space Published!', currentStep: 2 });
      }
      
      setShowAddModal(false);
      resetForm();
    } catch (err: any) {
      console.error(err);
      updateNotify(nid, { type: 'error', message: `Failed to ${editingSpaceId ? 'update' : 'publish'}.` });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setNewSpace({
      title: '', description: '', address: '', landmark: '', amenities: [], pricing: JSON.parse(JSON.stringify(INITIAL_PRICING)), carSlots: 1, bikeSlots: 0
    });
    setSelectedFile(null);
    setImagePreview(null);
    setEditingSpaceId(null);
  };

  const handleEditClick = (space: ParkingSpace) => {
    setEditingSpaceId(space.id);
    setNewSpace({
      title: space.title,
      description: space.description,
      address: space.address,
      landmark: space.landmark || '',
      amenities: space.amenities,
      pricing: space.pricing ? JSON.parse(JSON.stringify(space.pricing)) : JSON.parse(JSON.stringify(INITIAL_PRICING)),
      carSlots: space.carSlots,
      bikeSlots: space.bikeSlots
    });
    setImagePreview(space.imageUrl || null);
    setShowAddModal(true);
  };

  const deleteSpace = async (id: string) => {
    if (confirm('Delete this listing?')) {
      try { await deleteDoc(doc(db, 'spaces', id)); } catch (err) { notify("Deletion failed.", "error"); }
    }
  };

  const toggleAmenity = (amenity: string) => {
    setNewSpace(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity) ? prev.amenities.filter(a => a !== amenity) : [...prev.amenities, amenity]
    }));
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const updatePrice = (vehicle: 'car' | 'bike', tier: 'hourly' | 'daily' | 'monthly', value: string) => {
    const num = sanitizeInt(value);
    setNewSpace(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [vehicle]: {
          ...prev.pricing[vehicle],
          [tier]: num
        }
      }
    }));
  };

  return (
    <div className="py-10 w-full animate-fade-in-up">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 mb-12">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">Partner Dashboard</h1>
          <p className="text-slate-500 text-xl font-medium">Manage assets and track performance globally.</p>
        </div>
        <button onClick={() => { resetForm(); setShowAddModal(true); }} className="flex items-center justify-center gap-4 bg-yellow-400 text-slate-900 px-10 py-6 rounded-[2rem] font-black hover:bg-yellow-500 transition-all shadow-2xl shadow-yellow-400/30 active:scale-[0.98] w-full lg:w-auto text-lg uppercase tracking-widest">
          <Plus size={24} /> NEW LISTING
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4 group hover:border-yellow-200 transition-all shadow-sm">
          <div className="p-6 bg-yellow-50 text-yellow-600 rounded-[2rem] group-hover:scale-110 transition-transform"><Briefcase size={40} /></div>
          <div>
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Listings</p>
            <p className="text-5xl font-black text-slate-900 mt-2">{spaces.length}</p>
          </div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4 group hover:border-yellow-200 transition-all shadow-sm">
          <div className="p-6 bg-green-50 text-green-600 rounded-[2rem] group-hover:scale-110 transition-transform"><Shield size={40} /></div>
          <div>
            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Active Bookings</p>
            <p className="text-5xl font-black text-slate-900 mt-2">{activeBookingsCount}</p>
          </div>
        </div>
        <div className="bg-slate-900 p-10 rounded-[3rem] flex flex-col items-center justify-center text-center gap-4 group hover:scale-[1.02] transition-all shadow-2xl">
           <div className="p-6 bg-yellow-400/20 text-yellow-400 rounded-[2rem] group-hover:scale-110 transition-transform"><Zap size={40} fill="currentColor" /></div>
           <div className="text-white">
              <p className="text-[12px] font-black opacity-40 uppercase tracking-widest">Grid Reach</p>
              <p className="text-5xl font-black mt-2">100%</p>
           </div>
        </div>
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 flex flex-col items-center justify-center text-center gap-4 group hover:border-yellow-200 transition-all shadow-sm">
           <div className="p-6 bg-blue-50 text-blue-600 rounded-[2rem] group-hover:scale-110 transition-transform"><History size={40} /></div>
           <div>
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Total Bookings</p>
              <p className="text-5xl font-black text-slate-900 mt-2">{bookings.length}</p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
        <div className="xl:col-span-3">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800 uppercase tracking-tighter">
            <MapPin className="text-yellow-400" size={32} /> Your Spaces
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-80 bg-white border border-slate-100 rounded-[3rem] animate-pulse"></div>)}
            </div>
          ) : spaces.length === 0 ? (
            <div className="text-center py-40 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 hover:border-yellow-200 transition-colors group cursor-pointer" onClick={() => setShowAddModal(true)}>
               <div className="w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><Plus className="text-yellow-400" size={40} /></div>
               <p className="text-slate-500 font-bold text-2xl">No listings yet. Start earning today!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-10">
              {spaces.map(space => (
                <div key={space.id} className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden group hover:border-yellow-300 transition-all hover:shadow-2xl flex flex-col">
                  <div className="h-60 bg-slate-100 relative overflow-hidden">
                     <img src={space.imageUrl || `https://picsum.photos/seed/${space.id}/600/300`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                     <div className="absolute top-6 right-6 flex flex-col gap-2 items-end">
                       <div className="px-5 py-2 bg-white/95 rounded-full text-xs font-black border flex items-center gap-2 shadow-xl"><Car size={14} className="text-yellow-500" /> {space.carSlots}</div>
                       <div className="px-5 py-2 bg-white/95 rounded-full text-xs font-black border flex items-center gap-2 shadow-xl"><Bike size={14} className="text-blue-500" /> {space.bikeSlots}</div>
                     </div>
                  </div>
                  <div className="p-10 flex-1 flex flex-col">
                    <h3 className="font-black text-3xl mb-2 truncate text-slate-900 leading-none">{space.title}</h3>
                    <p className="text-slate-400 text-sm font-medium mb-8 truncate">{space.address}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex flex-wrap gap-2">
                        {space.amenities.map(a => <AmenityTag key={a} name={a} />)}
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEditClick(space)} className="p-4 text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-[1.5rem] transition-all"><Edit2 size={22} /></button>
                        <button onClick={() => deleteSpace(space.id)} className="p-4 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-[1.5rem] transition-all"><Trash2 size={22} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="xl:col-span-1">
          <h2 className="text-2xl font-black mb-8 flex items-center gap-4 text-slate-800 uppercase tracking-tighter">
            <Shield className="text-green-500" size={32} /> Recent Activity
          </h2>
          <div className="space-y-6">
            {recentBookingsList.length === 0 ? (
              <div className="p-16 bg-white rounded-[4rem] border border-slate-100 text-center text-slate-400 font-bold text-lg">No recent activity detected.</div>
            ) : (
              recentBookingsList.map(booking => (
                <div key={booking.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm group hover:border-yellow-400 transition-all">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(booking.createdAt)}</span>
                     <span className="bg-yellow-50 text-yellow-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">₹{booking.totalAmount}</span>
                  </div>
                  <h4 className="font-black text-slate-900 mb-6 truncate text-lg leading-none">{booking.spaceTitle}</h4>
                  <div className="flex items-center gap-5 text-sm border-t border-slate-50 pt-6">
                     <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><UserIcon size={24} /></div>
                     <div className="flex-1 min-w-0">
                        <p className="font-black text-slate-900 truncate leading-none mb-1">{booking.seekerName}</p>
                        <p className="text-slate-400 text-xs font-medium">{booking.seekerPhone}</p>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;