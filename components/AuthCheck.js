//If the user is authenticated this component display its children
//If not it redirect the user to the sign in page.
import Link from 'next/link'
import { useContext } from 'react';
import { UserContext } from '../lib/context'

export default function AuthCheck(props) {
    const {username} = useContext(UserContext);

    return username ?
        props.children :
        props.fallback || <Link href="/enter"> You must be signed in </Link>;
}