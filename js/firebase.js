/* =========================================
   SUNSHINE'S LUXURY HAIR
   FIREBASE CONFIGURATION
========================================= */


/* =========================================
   FIREBASE APP
========================================= */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";


/* =========================================
   FIRESTORE
========================================= */

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================
   FIREBASE AUTHENTICATION
========================================= */

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


/* =========================================
   FIREBASE CONFIGURATION
========================================= */

const firebaseConfig = {

    apiKey: "AIzaSyA1yCDYHjLMBwcIU389eZ5169cuMAM2zHw",

    authDomain:
        "sunshines-luxury-hair-d5c8d.firebaseapp.com",

    projectId:
        "sunshines-luxury-hair-d5c8d",

    storageBucket:
        "sunshines-luxury-hair-d5c8d.firebasestorage.app",

    messagingSenderId:
        "523892505846",

    appId:
        "1:523892505846:web:733faad2f3fe067d5540d7"

};


/* =========================================
   INITIALIZE FIREBASE
========================================= */

const app = initializeApp(firebaseConfig);


/* =========================================
   INITIALIZE FIRESTORE
========================================= */

const db = getFirestore(app);


/* =========================================
   INITIALIZE AUTHENTICATION
========================================= */

const auth = getAuth(app);


/* =========================================
   EXPORT EVERYTHING NEEDED
========================================= */

export {

    /* Firebase */
    app,

    /* Firestore */
    db,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,

    /* Authentication */
    auth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut

};
