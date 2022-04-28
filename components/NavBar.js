import Link from 'next/link';
import { useContext } from 'react';
import { UserContext } from '../lib/context';

//top nav bar
export default function NavBar() {
    //Consume the context
    const { user, username } = useContext(UserContext);

    return (
        <nav className='navbar'>
            <ul>
                <li>
                    <Link href="/">
                        <button className='btn-logo'>NEXT</button>
                    </Link>
                </li>
                {
                    //user signed in
                    username && (
                        <>
                            <li className='push-left'>
                                <Link href="/admin">
                                    <button className='btn-blue'>
                                        Write posts
                                    </button>
                                </Link>
                            </li>
                            <li>
                                <Link href={`/${username}`}>
                                    <img src={user?.photoURL} />
                                </Link>
                            </li>
                        </>
                    )
                }
                {
                    //user not signed in
                    !username && (
                        <li>
                            <Link href="enter">
                                <button className='btn-blue'>
                                    Log In
                                </button>
                            </Link>
                        </li>
                    )
                }
            </ul>
        </nav>
    )
}
