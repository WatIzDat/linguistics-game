"use client";

import LevelLayout from "@/components/level-layout";
import { Level } from "@/lib/level";
import { decompressString } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ImportedLevel() {
    const searchParams = useSearchParams();

    const levelCode = searchParams.get("code");

    const [level, setLevel] = useState<Level>();

    useEffect(() => {
        async function func() {
            setLevel(JSON.parse(await decompressString(levelCode!)));
        }
        func();
    }, []);

    return (
        level && (
            <LevelLayout editor={false} level={level} levelNum="custom level" />
        )
    );
}

export default function Page() {
    return (
        <Suspense
            fallback={
                <LevelLayout
                    editor={false}
                    level={{ name: "new level", rules: [], words: [] }}
                    levelNum="custom level"
                    skeleton
                />
            }
        >
            <ImportedLevel />
        </Suspense>
    );
}
