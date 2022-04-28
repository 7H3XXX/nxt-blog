// Import the functions you need from the SDKs you need
import { initializeApp } from "@firebase/app";
import { getAuth, GoogleAuthProvider } from "@firebase/auth";
import { getFirestore } from "@firebase/firestore";
import { getStorage } from "@firebase/storage";
import { collection, getDocs, query, where, limit, serverTimestamp } from '@firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyA20C-AiW7YJp_uEbh0Quc0VxjSkTU9qrQ",
    authDomain: "fir-next-5d2d2.firebaseapp.com",
    projectId: "fir-next-5d2d2",
    storageBucket: "fir-next-5d2d2.appspot.com",
    messagingSenderId: "736994226151",
    appId: "1:736994226151:web:deccc2b0e4c167a92fd742"
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