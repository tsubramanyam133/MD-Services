import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDGF-hCL1LPmiAioi_XePNZfLEr0DIghPw",
  authDomain: "md-services-e3000.firebaseapp.com",
  projectId: "md-services-e3000",
  storageBucket: "md-services-e3000.firebasestorage.app",
  messagingSenderId: "842562794201",
  appId: "1:842562794201:web:aeae4ffdf74884754184c8",
  measurementId: "G-MDCXLHD77X"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
storage.maxUploadRetryTime = 6000; // Fail fast after 6 seconds of retrying uploads
storage.maxOperationRetryTime = 6000; // Fail fast after 6 seconds of retrying other operations

// Cloudinary configuration for free video uploads (no credit card required)
// To get these: Sign up at https://cloudinary.com, create an unsigned upload preset in settings.
export const cloudinaryConfig = {
  cloudName: "",       // e.g. "dxyz12345"
  uploadPreset: ""     // e.g. "unsigned_preset_name"
};