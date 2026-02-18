"use client";

import { Level } from "@/lib/level";
import Header from "./header";
import LevelPage from "./level";
import { useState } from "react";

export default function LevelLayout({
    level,
    levelNum,
}: {
    level: Level;
    levelNum: string;
}) {
    const [completed, setCompleted] = useState(false);

    return (
        <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header
                levelNum={Number.parseInt(levelNum)}
                level={level}
                levelCompleted={completed}
            />
            <LevelPage level={level} setCompleted={setCompleted} />
        </div>
    );
}
