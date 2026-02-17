"use client";

import { Rule, applyRules, formatRule } from "@/lib/rule";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { CollisionPriority } from "@dnd-kit/abstract";
import { Level } from "@/lib/level";

function SortableButton({
    children,
    id,
    index,
    group,
    className,
}: {
    children: React.ReactNode;
    id: number;
    index: number;
    group: string;
    className?: string;
}) {
    const { ref, isDragging } = useSortable({
        id,
        index,
        type: "item",
        accept: "item",
        group,
    });

    return (
        <Button ref={ref} className={className} data-dragging={isDragging}>
            {children}
        </Button>
    );
}

function Column({
    children,
    id,
    className,
}: {
    children: React.ReactNode;
    id: string;
    className?: string;
}) {
    const { ref } = useDroppable({
        id,
        type: "column",
        accept: "item",
        collisionPriority: CollisionPriority.Low,
    });

    return (
        <div className={className} ref={ref}>
            {children}
        </div>
    );
}

export default function LevelPage({ level }: { level: Level }) {
    // const rules = [
    //     { id: 0, rule: { pattern: "p", replacement: "f" } },
    //     { id: 1, rule: { pattern: "t", replacement: "d" } },
    // ];

    const rules = level.rules.map((rule, i) => ({ id: i, rule }));

    const [items, setItems] = useState<{
        [k: string]: { id: number; rule: Rule }[];
    }>({
        bank: rules,
        solution: [],
    });

    const initialWord = level.initialWord;
    const targetWord = level.targetWord;

    const [word, setWord] = useState(initialWord);

    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const newWord = applyRules(
            items.solution.map((x) => x.rule),
            initialWord,
        );

        setWord(newWord);

        setSuccess(newWord === targetWord);
    }, [items]);

    return (
        <DragDropProvider
            onDragOver={(event) => {
                setItems((items) => move(items, event));
            }}
        >
            <main className="flex h-screen w-screen flex-col items-center justify-between bg-yellow-50 sm:items-start">
                <div className="h-1/2 w-full flex items-center justify-center">
                    <Column
                        id="solution"
                        className="h-full w-1/2 flex flex-col items-center justify-center gap-4"
                    >
                        {items.solution.map((rule, i) => (
                            <SortableButton
                                key={rule.id}
                                id={rule.id}
                                index={i}
                                group="solution"
                                className="h-1/4 w-1/3"
                            >
                                {formatRule(rule.rule)}
                            </SortableButton>
                        ))}
                    </Column>
                    <div
                        className={`h-full w-1/2 flex items-center justify-center text-9xl font-bold ${success && "text-green-500"}`}
                    >
                        {word}
                    </div>
                </div>
                <Column
                    id="bank"
                    className="h-1/2 w-full flex gap-4 items-center justify-center"
                >
                    {items.bank.map((rule, i) => (
                        <SortableButton
                            key={rule.id}
                            id={rule.id}
                            index={i}
                            group="bank"
                            className="h-1/4 w-1/6"
                        >
                            {formatRule(rule.rule)}
                        </SortableButton>
                    ))}
                </Column>
            </main>
        </DragDropProvider>
    );
}
