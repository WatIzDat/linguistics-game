"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function PlayLink() {
    const [currentLevel, setCurrentLevel] = useState<string | null>(null);

    useEffect(() => {
        setCurrentLevel(localStorage.getItem("level"));
    }, []);

    return <Link href={currentLevel ? `/${currentLevel}` : "/1"}>play</Link>;
}
