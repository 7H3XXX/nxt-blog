import Link from "next/link";

export default function Custom404() {
    return (
        <main>
            <h1>404 - That page does not seems to exist</h1>
            {/* <img src="../public/google.png" alt="Google" /> */}
            <Link href="/">
                <button className="btn-blue">Go home</button>
            </Link>
        </main>
    );
}