import * as dotenv from 'dotenv';
dotenv.config();

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const projectId = process.env.FIREBASE_PROJECT_ID;

if (!getApps().length) {
  initializeApp({
    projectId,
  });
}

export const firebaseAuth = getAuth();
