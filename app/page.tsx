"use client";

import { Button } from "@/components/ui/button";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { useEffect, useState } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { applyRules, formatRule, Rule } from "@/lib/rule";

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

// const Placeholder = () => {
//     const { ref } = useSortable({
//         id: "placeholder",
//         index: 0,
//         type: "item",
//         accept: "item",
//         group: "solution",
//     });
//     return (
//         <div
//             className="text-gray-400 text-center"
//             // id="placeholder"
//             ref={ref}
//         >
//             Drop here
//         </div>
//     );
// };

export default function Home() {
    const rules = [
        { id: 0, rule: { pattern: "p", replacement: "f" } },
        { id: 1, rule: { pattern: "t", replacement: "d" } },
    ];

    const [items, setItems] = useState<{
        [k: string]: { id: number; rule: Rule }[];
    }>({
        bank: [rules[0]],
        solution: [rules[1]],
    });

    const initialWord = "pater";

    const [word, setWord] = useState(initialWord);

    useEffect(() => {
        setWord(
            applyRules(
                items.solution.map((x) => x.rule),
                initialWord,
            ),
        );
    }, [items]);

    // const { ref: bankRef } = useDroppable({
    //     id: "bank",
    //     // type: "column",
    //     // accept: "item",
    //     collisionPriority: CollisionPriority.Low,
    // });

    // const { ref: solutionRef } = useDroppable({
    //     id: "solution",
    //     // type: "column",
    //     // accept: "item",
    //     collisionPriority: CollisionPriority.Low,
    // });

    return (
        <DragDropProvider
            onDragOver={(event) => {
                // console.log(event.operation.target?.id);
                console.log(items);
                setItems((items) => move(items, event));
            }}
        >
            <main className="flex h-screen w-screen flex-col items-center justify-between bg-yellow-50 sm:items-start">
                <div className="h-1/2 w-full flex items-center justify-center">
                    <Column
                        id="solution"
                        className="h-full w-1/2 flex flex-col items-center justify-center gap-4"
                    >
                        {/* {items.solution.length > 0 ? ( */}
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
                        {/* ) : (
                            <Placeholder />
                        )} */}
                    </Column>
                    <div className="h-full w-1/2 flex items-center justify-center text-9xl font-bold">
                        {word}
                    </div>
                </div>
                <Column
                    id="bank"
                    className="h-1/2 w-full flex gap-4 items-center justify-center"
                >
                    {/* <Button ref={draggableRef} className="h-[50%] w-1/6">
                    {"p -> f"}
                </Button>
                <Button ref={draggableRef} className="h-[50%] w-1/6">
                    {"a -> e"}
                </Button> */}
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
