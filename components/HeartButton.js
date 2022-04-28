import { firestore, auth } from '../lib/firebase';
import { doc, writeBatch, increment } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';

// Allows user to heart or like a post
export default function HeartButton({postRef}) {
    // Listen to heart document for currently logged in user
    const heartRef = doc(postRef, `hearts/${auth.currentUser.uid}`);
    const [heartDoc] = useDocument(heartRef);
    
    // Create a user-to-post relationship
    const addHeart = async () => {
        const uid = auth.currentUser.uid;
        const batch = writeBatch(firestore);

        //update the hearCount of a post doc
        batch.update(postRef, {heartCount: increment(1)});
        //update the hearts subcollection related to a post adding the uid who hearted the post
        batch.set(heartRef, {uid});

        await batch.commit();
    }

    const removeHeart = async () => {
        const batch = writeBatch(firestore);

        //update the heart count of a post doc
        batch.update(postRef, {heartCount: increment(-1)});
        //delete the uid in hearts subcollection of the user who hearted the post
        batch.delete(heartRef);

        await batch.commit();
    }

    //If heartDoc exist display Unheart else Heart
    return heartDoc?.exists() ? (
        <button onClick={removeHeart}>💔 Unheart</button>
    ) : (
        <button onClick={addHeart}>💗 Heart</button>
    );
}
