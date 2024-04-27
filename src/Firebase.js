// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth"
import { GoogleAuthProvider } from "firebase/auth";
import { GithubAuthProvider } from "firebase/auth";
import { FacebookAuthProvider } from "firebase/auth";
import { OAuthProvider } from "firebase/auth";

import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage";
import { getDatabase, onValue, ref, set } from "firebase/database";

import { firebase } from "@firebase/app";
import "@firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyD1j7slqYZ3g0AuLllOyBfrZGapptVs4pE",
//   authDomain: "chat-3c10a.firebaseapp.com",
//   databaseURL: "https://chat-3c10a-default-rtdb.firebaseio.com",
//   projectId: "chat-3c10a",
//   storageBucket: "chat-3c10a.appspot.com",
//   messagingSenderId: "403187488526",
//   appId: "1:403187488526:web:ac36d8f24b6fbf3b54295f"
// };

const firebaseConfig = {
  apiKey: "AIzaSyA-yqLVpG2uZnkiTKpsi7eTWQKajpC1oUY",
  authDomain: "whatsapp-a3731.firebaseapp.com",
  projectId: "whatsapp-a3731",
  storageBucket: "whatsapp-a3731.appspot.com",
  messagingSenderId: "567604796434",
  appId: "1:567604796434:web:976cd6987edb68e5fd4ccb"
};

// const firebaseConfig = {
//   apiKey: "AIzaSyA9a35tXxnbm1E3TMN7edzw03HEG9cjFGY",
//   authDomain: "hosting-c26ea.firebaseapp.com",
//   databaseURL: "https://hosting-c26ea-default-rtdb.firebaseio.com",
//   projectId: "hosting-c26ea",
//   storageBucket: "hosting-c26ea.appspot.com",
//   messagingSenderId: "492233370812",
//   appId: "1:492233370812:web:f4d7d98bd15b40f50db4b9"
// };


// Initialize Firebase
const app = initializeApp(firebaseConfig);



const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const providerGit = new GithubAuthProvider();
const providerFacebook = new FacebookAuthProvider();
const providerMicrosoft = new OAuthProvider('microsoft.com');


const storage = getStorage(app);
const firestore = getFirestore(app);
const db = getFirestore(app);
const realdb = getDatabase(app);

export { auth, provider, providerGit, providerFacebook, providerMicrosoft, db, storage, firestore, realdb };


