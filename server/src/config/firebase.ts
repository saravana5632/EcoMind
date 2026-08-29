import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import fs from 'fs';
import path from 'path';
import { ENV } from './env';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let isInitialized = false;

function loadFirebaseConfig() {
  try {
    const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Firebase] Could not read firebase-applet-config.json:', err);
  }
  return {
    projectId: ENV.FIREBASE_PROJECT_ID,
    firestoreDatabaseId: ENV.FIREBASE_DATABASE_ID,
    storageBucket: ENV.FIREBASE_STORAGE_BUCKET,
  };
}

export function initializeFirebase(): { app: FirebaseApp; db: Firestore; auth: Auth } {
  if (isInitialized && app && db) {
    return { app, db, auth };
  }

  const config = loadFirebaseConfig();
  const existingApps = getApps();

  if (existingApps.length > 0) {
    app = existingApps[0]!;
  } else {
    app = initializeApp(config);
  }

  const dbId = config.firestoreDatabaseId || ENV.FIREBASE_DATABASE_ID;
  if (dbId && dbId !== '(default)') {
    db = getFirestore(app, dbId);
  } else {
    db = getFirestore(app);
  }

  auth = getAuth(app);
  isInitialized = true;
  console.log(`[Firebase] Connected to Cloud Firestore database: ${dbId || '(default)'}`);
  return { app, db, auth };
}

export function getDb(): Firestore {
  if (!db) initializeFirebase();
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) initializeFirebase();
  return auth;
}

export function getFirebaseStorage(): any {
  return null;
}

export default { initializeFirebase, getDb, getFirebaseAuth, getFirebaseStorage };
