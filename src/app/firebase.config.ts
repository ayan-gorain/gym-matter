import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDtwG6OMz3eAk05Jj0FMQoWtqVGr3MzWzQ",
    authDomain: "gym-matter.firebaseapp.com",
    projectId: "gym-matter",
    storageBucket: "gym-matter.firebasestorage.app",
    messagingSenderId: "636123202254",
    appId: "1:636123202254:web:ab9d293cc8d9c0a57b469f",
    measurementId: "G-EF844NJXRT"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
