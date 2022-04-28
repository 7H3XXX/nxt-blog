// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getAuth, GoogleAuthProvider } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
import { collection, getDocs, query, where, limit, serverTimestamp } from '@firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "AUTH_DOMAIN_OF_YOUR_APP",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "DOMAIN_OF_YOUR_STORAGE_BUCKET",
    messagingSenderId: "MESSAGING_SENDER_ID",
    appId: "APP_ID"
};

// Initialize Firebase
// Here is important to wrap it in a condition
// To avoid an error if this method is called twice
const app = initializeApp(firebaseConfig);


// Export firebase SDK we want to work with
export const auth = getAuth(app);
// Sign In with google, Provider
export const googleAuthProvider = new GoogleAuthProvider();

export const firestore = getFirestore(app);
export const storage = getStorage(app);
export const svrTimestamp = serverTimestamp;

//Helper functions

/**
 * Gets a users/uid document with username
 * @param {string} username
 */

export async function getUserWithUsername(username) {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('username', '==', username), limit(1));
    const userDoc = (await getDocs(q)).docs[0];
    return userDoc;
}

/**
 * Converts a firestore document to JSON
 * @param {DocumentSnapshot} doc
 */

export function postToJSON(doc) {
    const data = doc.data();
    return {
        ...data,
        //Gotcha! firestore timestamp not serializable
        createdAt: data.createdAt.toMillis(),
        updatedAt: data.updatedAt.toMillis()
    };
}