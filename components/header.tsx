"use client";

import Link from "next/link";
import { Button } from "./ui/button";

export default function Header({
    levelNum,
    levelCompleted,
}: {
    levelNum: number;
    levelCompleted: boolean;
}) {
    return (
        <div>
            <div className="flex items-center justify-between px-12 pt-12">
                <nav className="flex gap-4 text-lg">
                    <Link className="text-5xl p-2 font-light" href="/">
                        chain→ling
                    </Link>
                </nav>
                <div className="flex gap-4 text-lg">
                    {levelCompleted && (
                        // <Button
                        //     className="bg-blue-500"
                        //     onClick={() => (location.href = `/${levelNum + 1}`)}
                        // >
                        //     Next
                        // </Button>
                        <Link
                            className="text-3xl p-2"
                            href={`/${levelNum + 1}`}
                        >
                            next
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
