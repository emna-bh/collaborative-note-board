import * as dotenv from 'dotenv';
dotenv.config();

import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export const firestoreDb = getFirestore();
