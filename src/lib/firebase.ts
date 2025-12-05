import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyByK_ThFgqoIz7CIaC1rOX7i2A8HojxRTc",
  authDomain: "personalmanager-d3cb4.firebaseapp.com",
  projectId: "personalmanager-d3cb4",
  storageBucket: "personalmanager-d3cb4.firebasestorage.app",
  messagingSenderId: "375882014578",
  appId: "1:375882014578:web:313b5b24c0b52cfd58c7eb",
  measurementId: "G-FPHQLSLNX8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
