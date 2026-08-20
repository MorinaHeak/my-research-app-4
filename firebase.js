import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC5Mhpu03UwSubTwImBT1pb2w-a2U3k6Yg",
  authDomain: "my-research-app-4.firebaseapp.com",
  projectId: "my-research-app-4",
  storageBucket: "my-research-app-4.firebasestorage.app",
  messagingSenderId: "163582513522",
  appId: "1:163582513522:web:db407eba02158c0d7b8deb",
  measurementId: "G-X34G6BXDR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Safely initialize Analytics only in browser environments
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export default app;