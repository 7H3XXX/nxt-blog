import UserProfile from '../../components/UserProfile'
import PostFeed from '../../components/PostFeed'
import { getUserWithUsername } from '../../lib/firebase';
import { postToJSON } from '../../lib/firebase';
import { collection, getDocs, query as queries, where, limit, orderBy } from '@firebase/firestore'

//This fucntion will be run on the server anytime this page is requested
//always async
export async function getServerSideProps ({query}) {

    const {username} = query; //we can the username from the URL accessible via the query object

    const userDoc = await getUserWithUsername(username);

    if(!userDoc){
        return {
            notFound: true
        }
    }

    let user = null;
    let posts = null;

    //retrieve all posts a user has authored.
    if(userDoc){
        user = userDoc.data();
        const q = queries(collection(userDoc.ref, 'posts'), where('published', '==', true), orderBy('createdAt', 'desc'), limit(5));

        posts = (await getDocs(q)).docs.map(postToJSON); //cause the certain fields like the firestore timestamp are not JSON friendly so we have to convert those.
    }


    return {
        props:{
            user, posts //will be passed to the page as props
        }
    }
}

export default function UserProfilePage({user,posts}) {
    return (
        <main>
            <UserProfile user={user}/>
            <PostFeed posts={posts}/>
        </main>
    );
}