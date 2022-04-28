import styles from '../../styles/Admin.module.css';
import AuthCheck from '../../components/AuthCheck';
import ImageUploader from '../../components/ImageUploader'
import { firestore, auth, svrTimestamp } from '../../lib/firebase';
import { useRouter } from 'next/router';
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

import { useDocumentData } from 'react-firebase-hooks/firestore';


export default function AdminPostEdit(props) {
    return (
        <AuthCheck>
            <PostManager />
        </AuthCheck>
    );
}

//delete, fetch, view the post.
function PostManager() {
    const [preview, setPreview] = useState(false);

    //get an instance of the router
    const router = useRouter();
    const { slug } = router.query;

    const postRef = doc(firestore, `users/${auth.currentUser.uid}/posts/${slug}`);

    const [post] = useDocumentData(postRef);

    return (
        <main className={styles.container}>
            {post && (
                <>
                    <section>
                        <h1>
                            {post.title}
                        </h1>
                        <p>ID: {post.slug}</p>
                        <PostForm postRef={postRef} defaultValues={post} preview={preview} />
                    </section>

                    <aside>
                        <h3>Tools</h3>
                        <button onClick={() => setPreview(!preview)}>
                            {preview ? 'Edit' : 'Preview'}
                        </button>
                        <Link href={`/${post.username}/${post.slug}`}>
                            <button className="btn-blue">
                                Live View
                            </button>
                        </Link>
                        <DeletePostButton postRef={postRef} />
                    </aside>
                </>
            )}
        </main>
    )
}

function PostForm({ defaultValues, postRef, preview }) {

    //pass an object to the useForm for initial config
    //default values comes form the post fetched form firestore
    //mode onChange specify that every change on the form should re-render and revalidate the form

    //some helper functions are returned form the hook to manage the form
    const { register, watch, handleSubmit,
        formState: {errors, isDirty, isValid}, reset } = useForm({ defaultValues, mode: 'onChange' });
    

    

    //watch, wathches the changes made to an element and update the corresponding state
    //ref register to register an element to react-hook-form

    //reset, resets the form field passed as argmuments

    const updatePost = async ({content, published}) => {
        await updateDoc(postRef,
            {
                content,
                published,
                updatedAt: svrTimestamp()
            })

        reset({ content, published });

        toast.success('Post successfully updated');
    }

    return (
        <form onSubmit={handleSubmit(updatePost)}>
            {preview && (
                <div className="card">
                    <ReactMarkdown>{watch('content')}</ReactMarkdown>
                </div>
            )}

            <div className={preview ? styles.hidden : styles.controls}>

                <ImageUploader/>

                <textarea
                    name="content"
                    {...register("content",
                        {
                            maxLength: { value: 20000, message: 'content is too long' },
                            minLength: { value: 10, message: 'content is too short' },
                            required: { value: true, message: 'content is required' },
                        })}
                ></textarea>

                {errors.content && <p className="text-danger">{errors.content.message}</p>}

                <fieldset>
                    <input className={styles.checkbox} name="published" type="checkbox" {...register('published')}/>
                    <label>Published</label>
                </fieldset>

                <button type="submit" className="btn-green" disabled={!isDirty || !isValid}>
                    Save Changes
                </button>
            </div>
        </form>
    );

}

function DeletePostButton({ postRef }) {
    const router = useRouter();

    const deletePost = async () => {
        const doIt = confirm('are you sure!');
        if (doIt) {
            await deleteDoc(postRef)
            router.push('/admin');
            toast('post annihilated ', { icon: '🗑️' });
        }
    };

    return (
        <button className="btn-red" onClick={deletePost}>
            Delete
        </button>
    );
}