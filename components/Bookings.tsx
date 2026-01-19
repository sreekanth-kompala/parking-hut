
import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Booking } from '../types';
import { Calendar, MapPin, Clock, Phone, User as UserIcon, Car, Bike, History, Zap } from 'lucide-react';

const Bookings: React.FC = () => {
  const { profile, user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) {
      setLoading(false);
      return;
    }
    
    const roleField = profile.role === 'provider' ? 'providerId' : 'seekerId';
    
    // Using onSnapshot for real-time updates to status and counts
    const q = query(
      collection(db, 'bookings'), 
      where(roleField, '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results: Booking[] = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as Booking);
      });
      setBookings(results);
      setLoading(false);
    }, (error) => {
      console.error("Booking fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile]);

  const formatDate = (timestamp: any) => {
    // Robust date handling for Firestore Timestamps or numeric Date.now() values
    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Derived Statistics
  const activeCount = useMemo(() => bookings.filter(b => b.status === 'confirmed').length, [bookings]);
  const totalCount = bookings.length;

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
         <h1 className="text-3xl font-extrabold text-slate-900">Your Activity</h1>
         <p className="text-slate-500">Track your {profile?.role === 'provider' ? 'earnings' : 'reservations'}.</p>
      </div>

      {/* Stats Summary Section */}
      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-slate-900 p-5 rounded-3xl text-white shadow-lg flex items-center gap-4">
              <div className="w-10 h-10 bg-yellow-400/20 text-yellow-400 rounded-xl flex items-center justify-center">
                 <Zap size={20} fill="currentColor" />
              </div>
              <div>
                 <p className="text-2xl font-black leading-none">{activeCount}</p>
                 <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Active</p>
              </div>
           </div>
           <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                 <History size={20} />
              </div>
              <div>
                 <p className="text-2xl font-black text-slate-900 leading-none">{totalCount}</p>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">History</p>
              </div>
           </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white border border-slate-100 rounded-3xl animate-pulse"></div>)}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
           <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} />
           </div>
           <h3 className="text-lg font-bold text-slate-900 mb-1">No bookings found</h3>
           <p className="text-slate-500">Your upcoming parking activity will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {bookings.map(booking => (
             <div key={booking.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start gap-4 group hover:border-yellow-400 transition-all relative">
                <div className="p-4 bg-yellow-50 text-yellow-600 rounded-2xl group-hover:bg-yellow-400 group-hover:text-slate-900 transition-colors border border-yellow-100 flex-shrink-0">
                   {booking.vehicleType === 'car' ? <Car size={28} /> : <Bike size={28} />}
                </div>
                <div className="flex-1 min-w-0 w-full">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="font-extrabold text-lg text-slate-900 truncate group-hover:text-yellow-700 transition-colors">
                        {booking.spaceTitle || 'Parking Space'}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        booking.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                         {booking.status}
                      </span>
                   </div>
                   <div className="flex items-center text-slate-500 text-sm mb-4 gap-1">
                      <MapPin size={14} className="text-yellow-500" />
                      <span className="truncate">{booking.spaceAddress || 'Location details'}</span>
                   </div>

                   {profile?.role === 'provider' && (
                     <div className="mb-4 p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                        <div className="flex items-center gap-2 text-xs">
                           <UserIcon size={14} className="text-slate-400" />
                           <span className="font-bold text-slate-700 truncate">{booking.seekerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                           <Phone size={14} className="text-slate-400" />
                           <span className="text-slate-500 font-medium">{booking.seekerPhone}</span>
                        </div>
                     </div>
                   )}

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-tight flex items-center gap-1">
                         <Clock size={12} /> {formatDate(booking.startTime)}
                      </div>
                      <div className="font-black text-slate-900 group-hover:text-yellow-600 transition-colors">
                         ₹{booking.totalAmount.toFixed(2)}
                      </div>
                   </div>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default Bookings;
