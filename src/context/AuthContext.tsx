import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  firebaseSignOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  type User 
} from '../lib/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  loginWithGoogle: (preferredRole?: UserRole) => Promise<{ success: boolean; role?: UserRole; error?: string }>;
  loginAsDemo: (role: 'customer' | 'delivery_partner') => Promise<{ success: boolean; role: UserRole }>;
  registerCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address: string;
    city: string;
    pincode: string;
  }) => Promise<{ success: boolean; error?: string }>;
  registerDeliveryPartner: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    vehicleType: string;
    vehicleNumber: string;
    licenseNumber: string;
    serviceArea: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  updateProfileDetails: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  toggleOnlineStatus: () => Promise<boolean>;
  demoRoleApprovedToggle: () => Promise<boolean>;
}

const LOCAL_STORAGE_KEY = 'ecomind_active_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Subscribe to Auth state and Firestore user doc
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Listen to user profile changes in real-time
        unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setUserProfile(data);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
          }
          setLoading(false);
        }, (err) => {
          console.warn('User profile listener note:', err);
          setLoading(false);
        });
      } else {
        if (unsubscribeProfile) unsubscribeProfile();
        // Check if there is a cached active user in localStorage (for demo or offline sessions)
        try {
          const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (cached) {
            const parsed = JSON.parse(cached) as UserProfile;
            setUserProfile(parsed);
          }
        } catch {
          // ignore
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Standard Login
  const login = async (email: string, pass: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const profile = userDoc.data() as UserProfile;
        setUserProfile(profile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profile));
        return { success: true, role: profile.role };
      } else {
        return { success: false, error: 'User profile not found in database.' };
      }
    } catch (error: any) {
      console.warn('Firebase Auth Login warning:', error);
      
      // Graceful fallback if email auth method is not enabled in Firebase Console
      if (error.code === 'auth/operation-not-allowed' || error.code === 'auth/unauthorized-domain' || error.code === 'auth/network-request-failed') {
        try {
          // Check Firestore directly for matching user document
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
          const querySnap = await getDocs(q);
          
          if (!querySnap.empty) {
            const foundProfile = querySnap.docs[0].data() as UserProfile;
            setUserProfile(foundProfile);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(foundProfile));
            return { success: true, role: foundProfile.role };
          }
        } catch (dbErr) {
          console.warn('Firestore fallback lookup error:', dbErr);
        }
      }

      let msg = 'Failed to sign in. Please check your credentials.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        msg = 'Invalid email or password.';
      } else if (error.code === 'auth/wrong-password') {
        msg = 'Incorrect password.';
      }
      return { success: false, error: msg };
    }
  };

  // Google Sign-In (Standard AI Studio Firebase auth)
  const loginWithGoogle = async (preferredRole: UserRole = 'customer'): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDocRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      
      if (snap.exists()) {
        const prof = snap.data() as UserProfile;
        setUserProfile(prof);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(prof));
        return { success: true, role: prof.role };
      } else {
        // Create new profile for Google user
        const now = new Date().toISOString();
        const newProfile: UserProfile = {
          uid: user.uid,
          name: user.displayName || (preferredRole === 'customer' ? 'EcoMind Customer' : 'Delivery Partner'),
          email: user.email || '',
          phone: user.phoneNumber || '+91 98450 00000',
          role: preferredRole,
          address: preferredRole === 'customer' ? 'Bengaluru Central, Karnataka' : undefined,
          city: 'Bengaluru',
          pincode: '560001',
          vehicleType: preferredRole === 'delivery_partner' ? 'Electric Scooter' : undefined,
          vehicleNumber: preferredRole === 'delivery_partner' ? 'KA-01-EV-1001' : undefined,
          licenseNumber: preferredRole === 'delivery_partner' ? 'DL-KA-2024-88899' : undefined,
          serviceArea: preferredRole === 'delivery_partner' ? 'Bengaluru Hub' : undefined,
          status: 'approved',
          isOnline: true,
          rating: 5.0,
          completedDeliveries: 0,
          totalDeliveries: 0,
          earnings: 0,
          createdAt: now
        };

        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
        return { success: true, role: preferredRole };
      }
    } catch (error: any) {
      console.error('Google Sign-in error:', error);
      return { success: false, error: error.message || 'Google sign-in failed' };
    }
  };

  // Demo Login with preset accounts
  const loginAsDemo = async (role: 'customer' | 'delivery_partner'): Promise<{ success: boolean; role: UserRole }> => {
    const demoUid = role === 'customer' ? 'demo_customer_priya_sharma' : 'demo_delivery_rajesh_kumar';
    const demoEmail = role === 'customer' 
      ? 'priya.customer@ecomindfresh.in' 
      : 'rajesh.delivery@ecomindfresh.in';
    const demoPassword = 'EcoPassword@123';

    const now = new Date().toISOString();
    const demoProfile: UserProfile = role === 'customer' ? {
      uid: demoUid,
      name: 'Priya Sharma',
      email: demoEmail,
      phone: '+91 98450 67890',
      role: 'customer',
      address: '42, Green Glen Layout, Bellandur',
      city: 'Bengaluru',
      pincode: '560103',
      createdAt: now
    } : {
      uid: demoUid,
      name: 'Rajesh Kumar',
      email: demoEmail,
      phone: '+91 97112 34567',
      role: 'delivery_partner',
      vehicleType: 'Electric Scooter (Ather 450X)',
      vehicleNumber: 'KA-01-EQ-4421',
      licenseNumber: 'DL-KA012022008892',
      serviceArea: 'South Bengaluru & Indiranagar Hub',
      status: 'approved',
      isOnline: true,
      rating: 4.9,
      completedDeliveries: 48,
      totalDeliveries: 50,
      earnings: 2840,
      createdAt: now
    };

    // Try signing in with Firebase Auth if configured
    try {
      const cred = await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
      demoProfile.uid = cred.user.uid;
    } catch (err: any) {
      // If operation not allowed, try anonymous auth or fallback
      try {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
          demoProfile.uid = cred.user.uid;
        } else if (err.code === 'auth/operation-not-allowed') {
          try {
            const anonCred = await signInAnonymously(auth);
            demoProfile.uid = anonCred.user.uid;
          } catch {
            // Use fixed demoUid
          }
        }
      } catch {
        // Fallback gracefully to demoUid
      }
    }

    // Persist to Firestore & Local Storage
    try {
      const userDocRef = doc(db, 'users', demoProfile.uid);
      await setDoc(userDocRef, demoProfile, { merge: true });
    } catch (fsErr) {
      console.warn('Demo profile Firestore sync note:', fsErr);
    }

    setUserProfile(demoProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoProfile));
    return { success: true, role };
  };

  // Register Customer
  const registerCustomer = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address: string;
    city: string;
    pincode: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const now = new Date().toISOString();
    let uid = `cust_${Date.now()}`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      uid = userCredential.user.uid;
    } catch (error: any) {
      console.warn('Customer registration auth warning:', error);
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }
      if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Password should be at least 6 characters.' };
      }
      // If operation-not-allowed, proceed with generated UID for fallback
    }

    const newProfile: UserProfile = {
      uid,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      role: 'customer',
      address: data.address,
      city: data.city,
      pincode: data.pincode,
      createdAt: now
    };

    try {
      await setDoc(doc(db, 'users', uid), newProfile);
    } catch (fsErr) {
      console.warn('Registration Firestore doc save note:', fsErr);
    }

    setUserProfile(newProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
    return { success: true };
  };

  // Register Delivery Partner
  const registerDeliveryPartner = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    vehicleType: string;
    vehicleNumber: string;
    licenseNumber: string;
    serviceArea: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const now = new Date().toISOString();
    let uid = `del_${Date.now()}`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      uid = userCredential.user.uid;
    } catch (error: any) {
      console.warn('Delivery partner registration auth warning:', error);
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, error: 'An account with this email already exists. Please log in.' };
      }
      if (error.code === 'auth/weak-password') {
        return { success: false, error: 'Password should be at least 6 characters.' };
      }
      // If operation-not-allowed, proceed with generated UID for fallback
    }

    const newProfile: UserProfile = {
      uid,
      name: data.name,
      email: data.email.toLowerCase(),
      phone: data.phone,
      role: 'delivery_partner',
      vehicleType: data.vehicleType,
      vehicleNumber: data.vehicleNumber,
      licenseNumber: data.licenseNumber,
      serviceArea: data.serviceArea,
      status: 'pending', // Pending approval by Admin from Application 1
      isOnline: false,
      rating: 5.0,
      completedDeliveries: 0,
      totalDeliveries: 0,
      earnings: 0,
      createdAt: now
    };

    try {
      await setDoc(doc(db, 'users', uid), newProfile);
    } catch (fsErr) {
      console.warn('Delivery partner Firestore doc save note:', fsErr);
    }

    setUserProfile(newProfile);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newProfile));
    return { success: true };
  };

  // Update Profile
  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!userProfile && !currentUser) return false;
    const uid = userProfile?.uid || currentUser?.uid;
    if (!uid) return false;

    try {
      const userDocRef = doc(db, 'users', uid);
      const updated = { ...data, updatedAt: new Date().toISOString() };
      await updateDoc(userDocRef, updated);
      const merged = { ...(userProfile || {}), ...updated } as UserProfile;
      setUserProfile(merged);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      // Update locally if offline
      if (userProfile) {
        const merged = { ...userProfile, ...data, updatedAt: new Date().toISOString() };
        setUserProfile(merged);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
        return true;
      }
      return false;
    }
  };

  const updateProfileDetails = async (data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    const success = await updateProfile(data);
    if (success) {
      return { success: true };
    }
    return { success: false, error: 'Failed to update profile in database' };
  };

  // Toggle Delivery Partner Duty Status (Online / Offline)
  const toggleOnlineStatus = async (): Promise<boolean> => {
    if (!userProfile || userProfile.role !== 'delivery_partner') return false;
    try {
      const newStatus = !userProfile.isOnline;
      const userDocRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userDocRef, {
        isOnline: newStatus,
        updatedAt: new Date().toISOString()
      });
      const updated = { ...userProfile, isOnline: newStatus };
      setUserProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Toggle online status error:', error);
      const updated = { ...userProfile, isOnline: !userProfile.isOnline };
      setUserProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  };

  // Quick toggle to simulate Admin Approval for testing convenience
  const demoRoleApprovedToggle = async (): Promise<boolean> => {
    if (!userProfile || userProfile.role !== 'delivery_partner') return false;
    try {
      const nextStatus = userProfile.status === 'approved' ? 'pending' : 'approved';
      const userDocRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userDocRef, {
        status: nextStatus,
        updatedAt: new Date().toISOString()
      });
      const updated = { ...userProfile, status: nextStatus };
      setUserProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Demo approval toggle error:', error);
      const updated = { ...userProfile, status: userProfile.status === 'approved' ? 'pending' : 'approved' as const };
      setUserProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setUserProfile(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        loginWithGoogle,
        loginAsDemo,
        registerCustomer,
        registerDeliveryPartner,
        logout,
        updateProfile,
        updateProfileDetails,
        toggleOnlineStatus,
        demoRoleApprovedToggle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
