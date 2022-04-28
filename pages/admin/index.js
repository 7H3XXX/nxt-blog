import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import PostFeed from '../../components/PostFeed';

import { firestore, auth, svrTimestamp } from '../../lib/firebase';

import { useContext, useState } from 'react';
import { UserContext } from '../../lib/context';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import toast from 'react-hot-toast';

import { collection, doc, orderBy, query, setDoc } from 'firebase/firestore';

export default function AdminPostsPage(props) {
    return (
        <main>
            <AuthCheck>
                <PostList />
                <CreateNewPost />
            </AuthCheck>
        </main>
    );
}

function PostList() {

    //firestore.collection('users').doc(auth.currentUser.uid).collection('posts');
    const ref = collection(firestore, `users/${auth.currentUser.uid}/posts`);
    const q = query(ref, orderBy('createdAt'));
    //useCollection hook to read a collection in realtime
    const [querySnapshot] = useCollection(q);

    //See also useCollectionData()
    const posts = querySnapshot?.docs.map((doc) => doc.data());

    return (
        <>
            <h1>Manage your posts.</h1>
            <PostFeed posts={posts} admin/>
        </>
    )
}

function CreateNewPost() {

    const router = useRouter();
    const { username } = useContext(UserContext);
    const [title, setTitle] = useState('')

    //Ensure slug is URL safe
    const slug = encodeURI(kebabCase(title));
    //check the length of the post's title
    const isValid = title.length > 3 && title.length < 100;


    const createPost = async (e) => {
        e.preventDefault();

        const uid = auth.currentUser.uid;
        //get a reference to an unexisting doc to create a new one
        const ref = doc(firestore, `users/${uid}/posts/${slug}`);
        
        //give all fields a default value
        const data = {
            title,
            slug,
            uid,
            username,
            published: false,
            content: '# hello world',
            createdAt: svrTimestamp(),
            updatedAt: svrTimestamp(),
            heartCount: 0
        }
        //Setting the doc in firestore
        await setDoc(ref, data);

        toast.success('Post created!');
        //Navigate to the edit post page
        router.push(`/admin/${slug}`);

    }

    return (
        <form onSubmit={createPost}>
            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Article!"
                className={styles.input}
            />
            <p>
                <strong>Slug:</strong> {slug}
            </p>
            <button type="submit" disabled={!isValid} className="btn-green">
                Create New Post
            </button>
        </form>
    )
}

