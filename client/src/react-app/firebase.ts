// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAVo6tbFPQ-P1h3f2L-2Q6pK6WrE1KZCRo",
  authDomain: "pi-shield.firebaseapp.com",
  projectId: "pi-shield",
  storageBucket: "pi-shield.firebasestorage.app",
  messagingSenderId: "840919588992",
  appId: "1:840919588992:web:53ff25ab21c11aec19c665",
  measurementId: "G-1MP55FF02B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

export { app, auth, analytics };