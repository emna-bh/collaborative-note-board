// This file is for testing purposes only.
// It demonstrates how to get a token from the Firebase Auth Emulator using the Firebase Client SDK. 
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInWithEmailAndPassword } from 'firebase/auth';

const app = initializeApp({
  apiKey: 'demo-api-key',
  authDomain: 'demo-project.firebaseapp.com',
  projectId: 'demo-no-project',
});

const auth = getAuth(app);

// 👇 connect to emulator
connectAuthEmulator(auth, 'http://127.0.0.1:9099');

async function run() {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    '', // email here
    '' // password here
  );

  const token = await userCredential.user.getIdToken();
  console.log(token);
}

run().catch(console.error);