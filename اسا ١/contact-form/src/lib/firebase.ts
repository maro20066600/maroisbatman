import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCHRTyqg53UzCjsqbUtZ8csfkf1G9_f9V0",
  authDomain: "yly-link-a8aca.firebaseapp.com",
  projectId: "yly-link-a8aca",
  storageBucket: "yly-link-a8aca.firebasestorage.app",
  messagingSenderId: "78476729983",
  appId: "1:78476729983:web:0ea7cc239b99e0e684a94a",
  measurementId: "G-YGZEKJPDPQ",
  databaseURL: "https://yly-link-a8aca-default-rtdb.firebaseio.com" // Adding databaseURL for Realtime Database
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Realtime Database
const database = getDatabase(app);

export { database, analytics }; 