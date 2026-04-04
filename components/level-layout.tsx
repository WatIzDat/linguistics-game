"use client";

import { Level } from "@/lib/level";
import Header from "./header";
import LevelPage from "./level";
import { useEffect, useState } from "react";
import { Rule } from "@/lib/rule";

export default function LevelLayout({
    editor,
    level,
    levelNum,
}:
    | {
          editor: false;
          level: Level;
          levelNum: string;
      }
    | {
          editor: true;
          level?: undefined;
          levelNum?: undefined;
      }) {
    const [completed, setCompleted] = useState(false);
    const [verified, setVerified] = useState(false);
    const [exportedLevel, setExportedLevel] = useState<Level>();
    const [importedLevel, setImportedLevel] = useState<Level>();

    useEffect(() => {
        const storedRules = localStorage.getItem("editorRules");
        const storedWordConfigs = localStorage.getItem("editorWordConfigs");
        const storedVerified = localStorage.getItem("verified");

        const rulesArr: { id: number; rule: Rule }[] = storedRules
            ? JSON.parse(storedRules)
            : [];
        const wordConfigsArr: {
            id: number;
            initialWord: string;
            targetWord: string;
        }[] = storedWordConfigs ? JSON.parse(storedWordConfigs) : [];

        const level: Level = {
            name: "new level",
            rules: rulesArr.map((r) => r.rule),
            words: wordConfigsArr.map((w) => ({
                initialWord: w.initialWord,
                targetWord: w.targetWord,
            })),
        };

        setImportedLevel(level);

        if (storedVerified) {
            setVerified(storedVerified === "true" ? true : false);
        }
    }, []);

    return (
        <div className="grid grid-rows-[auto_1fr] min-h-svh">
            {editor ? (
                <Header
                    editor={true}
                    levelNum={"editor"}
                    levelName={"make your own level!"}
                    levelVerified={verified}
                    exportedLevel={exportedLevel}
                    setLevel={setImportedLevel}
                />
            ) : (
                <Header
                    editor={false}
                    levelNum={levelNum}
                    levelName={level.name}
                    levelCompleted={completed}
                />
            )}
            {editor ? (
                importedLevel ? (
                    <LevelPage
                        editor={true}
                        setVerified={(verified) => {
                            setVerified(verified);

                            localStorage.setItem(
                                "verified",
                                verified ? "true" : "false",
                            );
                        }}
                        setExportedLevel={setExportedLevel}
                        level={importedLevel}
                        saveLevel={true}
                    />
                ) : (
                    <LevelPage
                        editor={true}
                        setExportedLevel={setExportedLevel}
                        saveLevel={false}
                    />
                )
            ) : (
                <LevelPage
                    editor={false}
                    levelNum={levelNum}
                    level={level}
                    setCompleted={setCompleted}
                />
            )}
        </div>
    );
}
