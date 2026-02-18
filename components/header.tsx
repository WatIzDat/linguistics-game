"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Level } from "@/lib/level";

export default function Header({
    levelNum,
    level,
    levelCompleted,
}: {
    levelNum: number;
    level: Level;
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
                <header className="flex flex-col items-center text-lg">
                    <h1 className="font-bold text-4xl">Level {levelNum}</h1>
                    <p>{level.name}</p>
                    <p>
                        <span className="font-bold">Goal:</span>{" "}
                        {level.initialWord} → {level.targetWord}
                    </p>
                </header>
                <div className="flex gap-4 text-lg">
                    {/* // <Button
                        //     className="bg-blue-500"
                        //     onClick={() => (location.href = `/${levelNum + 1}`)}
                        // >
                        //     Next
                        // </Button> */}
                    <Link
                        className={`text-3xl p-2 ${levelCompleted ? "visible" : "invisible"}`}
                        href={`/${levelNum + 1}`}
                    >
                        next
                    </Link>
                </div>
            </div>
        </div>
    );
}
