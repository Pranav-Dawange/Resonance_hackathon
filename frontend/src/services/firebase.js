// ============================================
// DermaAI SkinVision — Firebase Configuration
// Placeholder config for anonymous sessions
// ============================================

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

// ⚠️ Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'your-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'your-project-id',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'your-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:000:web:000',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Anonymous session ID (generated once per browser session)
function getSessionId() {
  let sessionId = sessionStorage.getItem('skinvision_session');
  if (!sessionId) {
    sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('skinvision_session', sessionId);
  }
  return sessionId;
}

/**
 * Save a scan result to Firestore
 */
export async function saveScan(scanData) {
  try {
    const sessionId = getSessionId();
    const docRef = await addDoc(collection(db, 'scans'), {
      sessionId,
      timestamp: new Date(),
      ...scanData,
    });
    return docRef.id;
  } catch (error) {
    console.error('Failed to save scan:', error);
    return null;
  }
}

/**
 * Upload scan image to Firebase Storage
 */
export async function uploadScanImage(base64Image, scanId) {
  try {
    const imageRef = ref(storage, `scans/${scanId}.jpg`);
    await uploadString(imageRef, base64Image, 'data_url');
    return await getDownloadURL(imageRef);
  } catch (error) {
    console.error('Failed to upload image:', error);
    return null;
  }
}

/**
 * Get scan history for current session
 */
export async function getScanHistory(limitCount = 20) {
  try {
    const sessionId = getSessionId();
    const q = query(
      collection(db, 'scans'),
      where('sessionId', '==', sessionId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp,
    }));
  } catch (error) {
    console.error('Failed to fetch scan history:', error);
    return [];
  }
}

/**
 * Get a specific scan by ID
 */
export async function getScan(scanId) {
  try {
    const docSnap = await getDoc(doc(db, 'scans', scanId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch scan:', error);
    return null;
  }
}

export { db, storage, getSessionId };
