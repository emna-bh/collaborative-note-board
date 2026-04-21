import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;

const globalForFirebase = globalThis as typeof globalThis & {
  __firebaseAuthEmulatorConnected?: boolean;
};

if (
  typeof window !== 'undefined' &&
  authEmulatorUrl &&
  !globalForFirebase.__firebaseAuthEmulatorConnected
) {
  connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
  globalForFirebase.__firebaseAuthEmulatorConnected = true;
}

export default app;
