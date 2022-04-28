import styles from '../../styles/Post.module.css'
import PostContent from '../../components/PostContent';
import { UserContext } from '../../lib/context';
import { useContext } from 'react';
import { collectionGroup, doc, getDoc, getDocs } from 'firebase/firestore';
import { firestore, getUserWithUsername, postToJSON } from '../../lib/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore'
import Link from 'next/link';
import HeartButton from '../../components/HeartButton';
import AuthCheck from '../../components/AuthCheck'

//ISR
export const getStaticProps = async ({ params }) => {
    
    const {username, slug} = params
    const userDoc = await getUserWithUsername(username);

    let post;
    let path;

    if (userDoc) {
        const postRef = doc(firestore, `${userDoc.ref.path}/posts/${slug}`)
        post = postToJSON(await getDoc(postRef));

        //Will make it easy to refetch this data on the client side when we want to hydrate it to realtime data
        path = postRef.path;
    }
    return {
        props: {
            post, path
        },
        revalidate: 100
        //Tells Next to regenerate this page when new request come in
    }
    
    }
//Determine which pages will be statically generated (when using getStaticProps with dynamic routes)
export const getStaticPaths = async () => {

    //
    const snapshot = await getDocs(collectionGroup(firestore, 'posts'));

    const paths = snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        return {
            params: { username, slug } //Will be in the URL of a page
        }
    })
    return {
        //must be in this format
        //paths: [
        //{ params: {username, slug}}
        //]
        paths, //paths to the pages to render
        fallback: 'blocking' //When a user navigate to a page that has not been rendered yet, fallback to SSR, then the page can be page in a CDN
    }
}
//Hydrating from server rendered content to realtime data
export default function Post(props) {
    const postRef = doc(firestore, props.path);
    const [realtimePost] = useDocumentData(postRef); //Realtime feed from the document

    const post = realtimePost || props.post //get the realtime data if not get the server rendered data

    const { user: currentUser } = useContext(UserContext);

    return (
        <main className={styles.container}>
            <section>
                <PostContent post={post} />
            </section>

            <aside className='card'>
                <p><strong>{post.heartCount || 0} ❤️</strong></p>

                <AuthCheck
                fallback={
                    <Link href='/enter'>
                            <button>❤️ Sign Up</button>
                    </Link>
                }
                >
                    <HeartButton postRef={postRef}/>
                    {currentUser?.uid === post.uid && (
                        <Link href={`/admin/${post.slug}`}>
                            <button className="btn-blue">Edit Post</button>
                        </Link>
                    )}
                </AuthCheck>
            </aside>
        </main>
    );
}