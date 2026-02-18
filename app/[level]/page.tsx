import Header from "@/components/header";
import LevelPage from "@/components/level";
import LevelLayout from "@/components/level-layout";
import { Button } from "@/components/ui/button";
import { Level } from "@/lib/level";
import Link from "next/link";

export default async function Page({
    params,
}: {
    params: Promise<{ level: string }>;
}) {
    const { level: levelNum } = await params;

    const response = await fetch(
        `http://localhost:3000/levels/level${levelNum}.json`,
    );

    const level: Level = await response.json();

    console.log(level);

    return <LevelLayout level={level} levelNum={levelNum} />;
}
