"use client";

import LevelLayout from "@/components/level-layout";
import { Level } from "@/lib/level";
import { decompressString } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const searchParams = useSearchParams();

    const levelCode = searchParams.get("code");

    const [level, setLevel] = useState<Level>();

    useEffect(() => {
        async function func() {
            setLevel(JSON.parse(await decompressString(levelCode!)));
        }
        func();
    }, []);

    // if (!levelCode) {
    //     console.error("code search param doesn't exist");

    //     return;
    // }

    // const level: Level = JSON.parse(levelCode);

    // return <LevelLayout editor={false} level={level} levelNum="custom level" />;

    return (
        level && (
            <LevelLayout editor={false} level={level} levelNum="custom level" />
        )
    );
}
