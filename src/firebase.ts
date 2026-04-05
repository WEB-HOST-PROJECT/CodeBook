// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBmcgr-lqiUX_1sqgVI2Uh38bz7G0aSnqU",
    authDomain: "student-test-app-1111.firebaseapp.com",
    projectId: "student-test-app-1111",
    storageBucket: "student-test-app-1111.firebasestorage.app",
    messagingSenderId: "1045480174559",
    appId: "1:1045480174559:web:3f40c7c08ea816c32d0a6a",
    measurementId: "G-JJQ6M1DGR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
