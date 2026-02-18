import Link from "next/link";

export default async function Home() {
    const numLevels = 15;

    return (
        <main className="flex flex-col gap-6 h-screen w-screen items-center justify-center p-12 text-3xl">
            <header className="text-center">
                <h1 className="text-9xl font-light mb-6">chain→ling</h1>
                <p className="font-extralight">
                    the puzzle game about sound change
                </p>
            </header>
            <Link href="/1">play</Link>
            <div className="mt-6">
                <h2 className="font-extralight mb-6">levels</h2>
                <div className="grid grid-cols-4 grid-rows-4 gap-6">
                    {[...Array(numLevels)].map((_, i) => (
                        <Link key={i} href={`/${i + 1}`}>
                            {i + 1}
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    );
}
