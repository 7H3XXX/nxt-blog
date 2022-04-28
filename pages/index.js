import PostFeed from '../components/PostFeed'
import { useState } from 'react'
import {startAfter, collectionGroup, getDocs, Timestamp, query, where, orderBy, limit} from '@firebase/firestore'
import { firestore, postToJSON } from '../lib/firebase'
import Loader from '../components/Loader'

//Max number of post to grab per request
const LIMIT = 1;

//collectionGroup grab any subcollection (no matter where it's nested in a tree of document) that has a name of post.
export async function getServerSideProps() {

  const q = query(collectionGroup(firestore, 'posts'), where('published', '==', true), orderBy('createdAt', 'desc'), limit(LIMIT));

  const posts = (await getDocs(q)).docs.map(postToJSON);

  return {
    props: {
      posts
    }
  }
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor = typeof last.createdAt === 'number' ? Timestamp.fromMillis(last.createdAt) : last.createdAt;
    
    //get the posts published ordered by createdAt 
    const q = query(collectionGroup(firestore, 'posts'), where('published', '==', true), orderBy('createdAt', 'desc'), startAfter(cursor), limit(LIMIT));

    const newPosts = (await getDocs(q)).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if(newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  }

  return (
    <main>
      <PostFeed posts={posts}/>
      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button> }
      <Loader show={loading}></Loader>
      {postsEnd && 'You have reached the end!'}
    </main>
  )
}
