import Link from "next/link";
import ReactMarkdown from 'react-markdown';

export default function PostContent({post}) {

    //convert timestamp in the good format
    const createdAt = typeof post?.createdAt === 'number' ? new Date(post.createdAt) : post.createdAt.toDate();
    
    return (
        <div className="card">
            <h1>{post?.title}</h1>
            <span className="text-sm">
                Written by {' '}
                <Link href={`/${post.username}/`}>
                    <a className="text-info">@{post.username}</a>
                </Link>{' '}
                on {createdAt.toDateString()}
            </span>
            {/* Render the post content in regular HTML form  */}
            <ReactMarkdown>{post?.content}</ReactMarkdown>
        </div>
    );
}