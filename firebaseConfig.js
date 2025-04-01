import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPEikBSME7dwgHxOpcu06BPD_1ARoNAUk",
  authDomain: "waldgrave-profiles.firebaseapp.com",
  projectId: "waldgrave-profiles",
  storageBucket: "waldgrave-profiles.firebasestorage.app",
  messagingSenderId: "203808800578",
  appId: "1:203808800578:web:72d980d7ebf198928dd2db",
  measurementId: "G-H1CKD1N7NY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
