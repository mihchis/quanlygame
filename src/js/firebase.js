// Module: Firebase Manager
// Handles Authentication and Cloud Sync using dynamic ESM CDN imports

import { state } from './state.js';

let app = null;
let auth = null;
let db = null;
let currentUser = null;

// Dynamically import Firebase libraries from the Google CDN
export async function initFirebase() {
  try {
    const config = await window.api.getFirebaseConfig();
    if (!config.apiKey) {
      console.warn('Cấu hình Firebase trống trong file .env. Hoạt động ở chế độ Offline-only.');
      return null;
    }

    // Dynamic ESM imports
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
    const { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
    const { getFirestore, doc, setDoc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');

    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);

    console.log('Firebase SDK initialized successfully from Google CDN.');
    return { app, auth, db };
  } catch (err) {
    console.error('Lỗi khi khởi tạo Firebase:', err);
    return null;
  }
}

export async function onAuthChanged(callback) {
  if (!auth) {
    console.error('Firebase Auth chưa được khởi tạo!');
    return;
  }
  const { onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    callback(user);
  });
}

export function getAuthInstance() {
  return auth;
}

export function getFirestoreInstance() {
  return db;
}

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(user) {
  currentUser = user;
}

// ─── Authentication API ──────────────────────────────────────────────────────

export async function signUp(email, password) {
  if (!auth) throw new Error('Firebase Auth chưa được khởi tạo!');
  const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  currentUser = userCredential.user;
  return userCredential.user;
}

export async function signIn(email, password) {
  if (!auth) throw new Error('Firebase Auth chưa được khởi tạo!');
  const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  currentUser = userCredential.user;
  return userCredential.user;
}

export async function signOutUser() {
  if (!auth) return;
  const { signOut } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js');
  await signOut(auth);
  currentUser = null;
}

// ─── Cloud Sync API ──────────────────────────────────────────────────────────

export async function syncGamesToCloud(games) {
  if (!db || !currentUser) return false;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, {
      games: games || [],
      updatedAt: Date.now()
    }, { merge: true });
    console.log(`Đã đồng bộ hóa ${games.length} game lên Firestore cho user: ${currentUser.email}`);
    return true;
  } catch (err) {
    console.error('Lỗi khi đồng bộ dữ liệu lên Firestore:', err);
    return false;
  }
}

export async function fetchGamesFromCloud() {
  if (!db || !currentUser) return null;
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const userDocRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log(`Đã nạp ${data.games ? data.games.length : 0} game từ Firestore.`);
      return data.games || [];
    }
    return [];
  } catch (err) {
    console.error('Lỗi khi nạp dữ liệu từ Firestore:', err);
    return null;
  }
}

// ─── Avatar Cloud Sync ───────────────────────────────────────────────────────

export async function saveAvatarToCloud(base64Avatar) {
  if (!db || !currentUser) return false;
  try {
    const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const userDocRef = doc(db, 'users', currentUser.uid);
    await setDoc(userDocRef, {
      avatar: base64Avatar
    }, { merge: true });
    console.log('Đã lưu avatar lên Firestore.');
    return true;
  } catch (err) {
    console.error('Lỗi khi lưu avatar lên Firestore:', err);
    return false;
  }
}

export async function fetchAvatarFromCloud() {
  if (!db || !currentUser) return null;
  try {
    const { doc, getDoc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
    const userDocRef = doc(db, 'users', currentUser.uid);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.avatar || null;
    }
    return null;
  } catch (err) {
    console.error('Lỗi khi nạp avatar từ Firestore:', err);
    return null;
  }
}

