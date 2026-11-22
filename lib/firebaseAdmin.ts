import 'server-only';
import { getApps, cert, initializeApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;

const readEnv = (...keys: string[]) => {
  for (const key of keys) {
    const value = process.env[key];
    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

const getPrivateKey = () => {
  const base64 = readEnv(
    'FIREBASE_ADMIN_PRIVATE_KEY_BASE64',
    'FIREBASE_PRIVATE_KEY_BASE64',
    'GOOGLE_PRIVATE_KEY_BASE64'
  );
  if (base64) {
    return Buffer.from(base64, 'base64').toString('utf8');
  }
  const rawPrivateKey = readEnv(
    'FIREBASE_ADMIN_PRIVATE_KEY',
    'FIREBASE_PRIVATE_KEY',
    'GOOGLE_PRIVATE_KEY'
  );
  return rawPrivateKey?.replace(/\\n/g, '\n');
};

const initAdminApp = () => {
  if (adminApp) return adminApp;
  if (getApps().length) {
    adminApp = getApps()[0];
    return adminApp;
  }

  const projectId = readEnv(
    'FIREBASE_ADMIN_PROJECT_ID',
    'FIREBASE_PROJECT_ID',
    'GOOGLE_CLOUD_PROJECT',
    'GCLOUD_PROJECT',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
  );
  const clientEmail = readEnv(
    'FIREBASE_ADMIN_CLIENT_EMAIL',
    'FIREBASE_CLIENT_EMAIL',
    'GOOGLE_CLIENT_EMAIL'
  );
  const privateKey = getPrivateKey();

  if (!projectId || !clientEmail || !privateKey) {
    const missing: string[] = [];
    if (!projectId) missing.push('projectId');
    if (!clientEmail) missing.push('clientEmail');
    if (!privateKey) missing.push('privateKey');
    throw new Error(`Faltan variables Firebase Admin: ${missing.join(', ')}`);
  }

  adminApp = initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  return adminApp;
};

export const getAdminAuth = () => getAuth(initAdminApp());
export const getAdminDb = () => getFirestore(initAdminApp());
