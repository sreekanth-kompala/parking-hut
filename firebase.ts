
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD92qeOqo1v5NkgPvv5_Cn1o-SeRdunY24",
  authDomain: "parkspace-share-pro.firebaseapp.com",
  projectId: "parkspace-share-pro",
  storageBucket: "parkspace-share-pro.firebasestorage.app",
  messagingSenderId: "158847640433",
  appId: "1:158847640433:web:d2dde5985daded10694cd0",
  measurementId: "G-KXK2EHHW9L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
