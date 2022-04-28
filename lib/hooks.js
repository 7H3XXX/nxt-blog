import { firestore, auth } from '../lib/firebase';
import { doc, onSnapshot } from "firebase/firestore";
import { useState, useEffect } from 'react';
import { useAuthState } from "react-firebase-hooks/auth";

export default function useUserData() {
    //get the user from firebase
    const [user] = useAuthState(auth);
    const [username, setUsername] = useState(null);

    //When the user object changes, fetch a new document from firestore db
    //and listen to updates to that doc in real time
    useEffect(() => {
        //to turn off realtime subscription
        let unsubscribe;

        if (user) {
            //make a reference to the firestore users collection with the doc that matches that user's user id
            //------ const ref = firestore.collection('users').doc(user.uid);
            //define our real time subscription as the unsubscribe variable
            //onSnapshot returns a function that when called unsubscribe from that data
            //onSnapshot that a callback function that will provide the latest version document version of the db
            //When the doc updates the callback will run with the latest data 
            //----- unsubscribe = ref.onSnapshot((doc) => {
                //getting that data we will set the username state variable with his corresponding set method
            //------    setUsername(doc.data()?.username);
            //----- });

            unsubscribe = onSnapshot(doc(firestore, "users", user.uid), (doc) => {
                setUsername(doc.data()?.username);
            }, (error) => {console.log(error.message)})
        } else {
            //if we dont have a user set username to null
            setUsername(null);
        }
        //when the user doc is no longer needed just unsubscribe
        return unsubscribe;
    }, [user])

    return {user, username};
}