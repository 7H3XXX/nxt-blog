import { useContext, useState, useEffect, useCallback } from "react";
import { UserContext } from "../lib/context";
import { signInWithPopup } from "@firebase/auth";
import { doc, getDoc, writeBatch } from "firebase/firestore";
import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import debounce from "lodash.debounce"

// To land on /enter
export default function EnterPage(props) {

    //Consuming the context
    const { user, username } = useContext(UserContext);

    //user signed out SignInButton
    //user signed in, but missing a username show the UsernameForm
    // user signed in, has a username show the SignOutButton
    return (
        <main>
            {
                user ?
                    username ? <SignOutButton /> : <UsernameForm />
                    : <SignInButton />
            }
        </main>
    );
}

// Sign in with Google Button
function SignInButton() {
    //Sign in with google function, can be wrap in a try catch.
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleAuthProvider);
    }
    return (<>
        <button className="btn-google" onClick={
            signInWithGoogle
        }>
            <img src={"/google.png"} /> Sign In with Google
        </button>
    </>

    );
}
// Sign out
function SignOutButton() {
    //auth.signOut remove the JSONWEBTOKEN sotred on the browser which manage the authentication state on the frontend
    return <button onClick={() => auth.signOut()}>Sign Out</button>
}
// Username Input
function UsernameForm() {
    const [formValue, setFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user, username } = useContext(UserContext)

    //Everytime the username changes run the checkUsername function
    useEffect(() => {
        checkUsername(formValue);
    }, [formValue])


    //on input change
    const onChange = (e) => {

        //force form value typed to match the correct format
        const val = e.target.value.toLowerCase();
        const rgex = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

        if (val.length < 3) {
            setFormValue(val);
            setLoading(false);
            setIsValid(false);
        }

        if (rgex.test(val)) {
            setFormValue(val);
            setLoading(true);
            setIsValid(false);
        }
    }

    //check if the username is valid
    //useCallback allow the async function to be debounced because of memoization
    //After every render a new function is created and cannot be debounced
    //useCallback allow the function to stay in place between render hence she can be debounced
    const checkUsername = useCallback(
        //debounce allow us to minimize the reads by firing uo the function when the user stops typing, after 500ms
        debounce(async (username) => {
            //check if the lenght of the username typed is greater or equal to 3
            if (username.length >= 3) {
                //check if the username exists by getting a document in the usernames collection

                //******Wrap in a try catch */
                const ref = doc(firestore, `usernames/${username}`);
                const exists = await getDoc(ref);
                setIsValid(!exists.exists());
                setLoading(false);
            }
        }, 500), []
    );

    const onSubmit = async (e) => {
        //*****************Wrap in a try catch */
        e.preventDefault();

        //get the refs for both documents
        //to add (set) a new user
        const userDoc = doc(firestore, `users/${user.uid}`);
        const usernameDoc = doc(firestore, `usernames/${formValue}`);

        //Commit both docs using batch operations
        const batch = writeBatch(firestore);

        batch.set(userDoc, { username: formValue, photoURL: user.photoURL, displayName: user.displayName });
        batch.set(usernameDoc, { uid: user.uid });

        await batch.commit();
    }

    return (
        !username && (
            <section>
                <h3>Choose Username</h3>
                <form onSubmit={onSubmit}>
                    <input name="username" placeholder="myname" value={formValue} onChange={onChange} />
                    <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
                    <button type="submit" className="btn-green" disabled={!isValid}>
                        Choose
                    </button>

                    <h3>Debug State</h3>
                    <div>
                        Username: {formValue}
                        <br />
                        Loading: {loading.toString()}
                        <br />
                        Username Valid: {isValid.toString()}
                    </div>
                </form>
            </section>
        )
    );
}

//Check availability text
function UsernameMessage({ username, isValid, loading }) {
    if (loading) {
        return <p>Checking...</p>;
    } else if (isValid) {
        return <p className="text-success">{username} is available!</p>;
    } else if (username && !isValid) {
        return <p className="text-danger">That username is taken!</p>;
    } else {
        return <p></p>;
    }
}