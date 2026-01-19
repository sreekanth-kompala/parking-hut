import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, Search, Home as HomeIcon, ChevronLeft, X } from 'lucide-react';
import { auth, db } from '../firebase';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';

interface AuthProps {
  onCancel?: () => void;
  initialMode?: 'login' | 'signup';
}

const Auth: React.FC<AuthProps> = ({ onCancel, initialMode = 'login' }) => {
  const { notify, updateNotify } = useAuth();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [signupStep, setSignupStep] = useState<'role' | 'details'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    
    if (!isLogin) {
      if (!name) errors.name = "Full Name is required";
      if (!phone) {
        errors.phone = "Phone Number is required";
      } else if (!/^\+?[0-9]{10,15}$/.test(phone)) {
        errors.phone = "Enter a valid phone number";
      }
      if (!confirmPassword) errors.confirmPassword = "Please confirm your password";
      if (password && confirmPassword && password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    if (!isLogin && !selectedRole) {
      setError("Please select a role to continue.");
      return;
    }

    setLoading(true);
    const steps = isLogin ? ["Authenticating"] : ["Validating Info", "Creating Account", "Finalizing"];
    const nid = notify(isLogin ? "Signing in..." : "Setting up your account...", "info", steps, 0);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        updateNotify(nid, { type: 'success', message: "Welcome back!", currentStep: 0 });
      } else {
        updateNotify(nid, { currentStep: 0, message: "Checking phone availability..." });
        const phoneCheckQuery = query(collection(db, 'users'), where('phone', '==', phone));
        const phoneCheckSnapshot = await getDocs(phoneCheckQuery);
        
        if (!phoneCheckSnapshot.empty) {
          throw new Error("The phone number already exists");
        }

        updateNotify(nid, { currentStep: 1, message: "Creating your profile..." });
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        
        await updateProfile(user, { displayName: name });
        
        updateNotify(nid, { currentStep: 2, message: "Saving your preferences..." });
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email,
          name,
          phone,
          role: selectedRole as UserRole,
          createdAt: serverTimestamp()
        });

        updateNotify(nid, { type: 'success', message: "Account created!", currentStep: 2 });
      }
    } catch (err: any) {
      console.error('Auth Error:', err);
      let msg = "Authentication failed.";
      if (err.code === "auth/invalid-credential") msg = "Invalid email or password.";
      else if (err.code === "auth/email-already-in-use") msg = "Email already registered.";
      else if (err.message) msg = err.message;
      
      setError(msg);
      updateNotify(nid, { type: 'error', message: msg });
    } finally {
      setLoading(false); 
    }
  };

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    setSignupStep('details');
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Fixed: Made children optional in the prop type to avoid TS errors when passing via nested JSX
  const AuthCard = ({ children, title, subtitle, showBack, onBack }: { children?: React.ReactNode, title: string, subtitle: string, showBack?: boolean, onBack?: () => void }) => (
    <div className="w-full max-w-[440px] bg-white p-10 md:p-12 rounded-[3.5rem] shadow-2xl border border-slate-100 relative animate-in zoom-in duration-300">
      {onCancel && (
        <button onClick={onCancel} className="absolute top-10 right-10 p-2 text-slate-400 hover:text-slate-900 transition-colors z-10">
          <X size={28} />
        </button>
      )}
      {showBack && (
        <button onClick={onBack} className="absolute top-10 left-10 p-2 text-slate-400 hover:text-slate-900 transition-colors z-10">
          <ChevronLeft size={28} />
        </button>
      )}
      
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400 text-slate-900 rounded-[1.8rem] shadow-xl shadow-yellow-400/20 mb-6">
          <span className="text-4xl font-black">P</span>
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-slate-900 leading-none mb-2">Parking Hut</h1>
        <p className="text-slate-400 font-medium">{subtitle}</p>
      </div>
      
      {children}
    </div>
  );

  if (isLogin) {
    return (
      <AuthCard title="Parking Hut" subtitle="Welcome back to your space">
        <form noValidate onSubmit={handleAuth} className="space-y-6">
          <div className={fieldErrors.email ? "animate-shake" : ""}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              disabled={loading}
              onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
              className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none transition-all text-slate-900 font-bold ${
                fieldErrors.email ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-100 focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400'
              }`}
              placeholder="name@example.com"
            />
          </div>

          <div className={fieldErrors.password ? "animate-shake" : ""}>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Password</label>
            <input
              type="password"
              value={password}
              disabled={loading}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
              className={`w-full px-5 py-4 bg-slate-50 border rounded-2xl outline-none transition-all text-slate-900 font-bold ${
                fieldErrors.password ? 'border-red-400 focus:ring-2 focus:ring-red-100' : 'border-slate-100 focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400'
              }`}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm font-black flex items-center gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-[1.5rem] shadow-xl shadow-yellow-400/30 transition-all active:scale-[0.98] disabled:opacity-50 text-lg uppercase tracking-widest"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
          <button
            disabled={loading}
            onClick={() => setIsLogin(false)}
            className="text-yellow-600 font-black hover:text-yellow-700 transition-colors uppercase tracking-widest text-xs"
          >
            Don't have an account? Sign Up
          </button>
        </div>
      </AuthCard>
    );
  }

  if (signupStep === 'role') {
    return (
      <AuthCard title="Welcome!" subtitle="How would you like to use Parking Hut?">
        <div className="space-y-4">
          <button 
            disabled={loading}
            onClick={() => handleRoleSelection('seeker')}
            className="w-full flex items-center gap-5 p-6 bg-slate-50 border-2 border-transparent hover:border-yellow-400 hover:bg-yellow-50 transition-all rounded-[2rem] group text-left"
          >
            <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-slate-900 group-hover:scale-110 transition-transform shadow-lg shadow-yellow-400/20">
              <Search size={28} strokeWidth={3} />
            </div>
            <div>
              <span className="block font-black text-xl text-slate-900">I'm a Seeker</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">I want to book</span>
            </div>
          </button>

          <button 
            disabled={loading}
            onClick={() => handleRoleSelection('provider')}
            className="w-full flex items-center gap-5 p-6 bg-slate-50 border-2 border-transparent hover:border-slate-900 hover:bg-slate-900/5 transition-all rounded-[2rem] group text-left"
          >
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-slate-900/10">
              <HomeIcon size={28} strokeWidth={2.5} />
            </div>
            <div>
              <span className="block font-black text-xl text-slate-900">I'm a Provider</span>
              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">I want to list</span>
            </div>
          </button>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-50 text-center">
           <button disabled={loading} onClick={() => setIsLogin(true)} className="text-slate-400 font-black hover:text-slate-600 transition-colors uppercase tracking-widest text-xs">
              Back to Sign In
           </button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard 
      title="Final Steps" 
      subtitle={`Join our community as a ${selectedRole}`}
      showBack={!loading}
      onBack={() => setSignupStep('role')}
    >
      <form noValidate onSubmit={handleAuth} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
          <input
            type="text"
            value={name}
            disabled={loading}
            onChange={(e) => { setName(e.target.value); clearFieldError('name'); }}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 font-bold"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</label>
          <input
            type="tel"
            value={phone}
            disabled={loading}
            onChange={(e) => { setPhone(e.target.value); clearFieldError('phone'); }}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 font-bold"
            placeholder="+011-XXXX-XXXX"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            disabled={loading}
            onChange={(e) => { setEmail(e.target.value); clearFieldError('email'); }}
            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 font-bold"
            placeholder="name@example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              disabled={loading}
              onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); }}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 font-bold"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Confirm</label>
            <input
              type="password"
              value={confirmPassword}
              disabled={loading}
              onChange={(e) => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-yellow-400/10 focus:border-yellow-400 font-bold"
              placeholder="••••••••"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-black flex items-center gap-3">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black rounded-[1.5rem] shadow-xl shadow-yellow-400/30 transition-all active:scale-[0.98] disabled:opacity-50 text-lg uppercase tracking-widest mt-4"
        >
          {loading ? 'Creating Account...' : 'Finish Signup'}
        </button>
      </form>
    </AuthCard>
  );
};
  
export default Auth;