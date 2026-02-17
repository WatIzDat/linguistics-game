import LevelPage from "@/components/level";
import { Level } from "@/lib/level";

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

    return <LevelPage level={level} levelNum={Number.parseInt(levelNum)} />;
}
