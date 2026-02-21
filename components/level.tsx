"use client";

import { Rule, applyRules, formatRule } from "@/lib/rule";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDroppable } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
    useState,
    useEffect,
    Dispatch,
    SetStateAction,
    useRef,
    RefObject,
} from "react";
import { Button } from "./ui/button";
import { CollisionPriority } from "@dnd-kit/abstract";
import { Level, NUM_LEVELS } from "@/lib/level";
import { clearTimeout, setTimeout } from "timers";

function SortableButton({
    ref,
    children,
    id,
    index,
    group,
    className,
}: {
    ref?: RefObject<Element | null>;
    children: React.ReactNode;
    id: number;
    index: number;
    group: string;
    className?: string;
}) {
    const { ref: sortableRef, isDragging } = useSortable({
        id,
        index,
        type: "item",
        accept: "item",
        group,
    });

    function refs(node: Element | null) {
        sortableRef(node);

        if (ref) {
            ref.current = node;
        }
    }

    return (
        <Button ref={refs} className={className} data-dragging={isDragging}>
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

export default function LevelPage({
    level,
    levelNum,
    setCompleted,
}: {
    level: Level;
    levelNum: number;
    setCompleted: Dispatch<SetStateAction<boolean>>;
}) {
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
    // const [completed, setCompleted] = useState(false);

    const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const newWord = applyRules(
            items.solution.map((x) => x.rule),
            initialWord,
        );

        setWord(newWord);

        if (newWord === targetWord) {
            setTimeoutID(
                setTimeout(() => {
                    setSuccess(true);

                    setCompleted(true);

                    if (levelNum === NUM_LEVELS) {
                        localStorage.removeItem("level");
                    } else {
                        localStorage.setItem(
                            "level",
                            (levelNum + 1).toString(),
                        );
                    }
                }, 1000),
            );
        } else {
            setSuccess(false);

            if (timeoutID) {
                clearTimeout(timeoutID);

                setTimeoutID(null);
            }
        }
    }, [items]);

    const [ruleButtonHeight, setRuleButtonHeight] = useState(0);
    const ruleButtonRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        setRuleButtonHeight(ruleButtonRef.current?.clientHeight!);
    });

    const [timelineHeight, setTimelineHeight] = useState(0);
    const timelineRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        setTimelineHeight(timelineRef.current?.clientHeight!);
    });

    return (
        <DragDropProvider
            onDragOver={(event) => {
                setItems((items) => move(items, event));
            }}
        >
            <main className="grid grid-cols-2 grid-rows-4 gap-4 lg:gap-12 bg-background p-4 lg:p-12 sm:items-start">
                {/* <div className="h-1/2 w-full flex items-center justify-center"> */}
                <div className="col-start-1 col-end-2 row-start-2 row-end-5 lg:row-start-1 lg:row-end-3 flex flex-col gap-4 lg:flex-row h-full bg-secondary rounded-4xl">
                    <h2 className="text-3xl font-semibold text-center lg:ml-6 mt-6">
                        Timeline
                    </h2>
                    <Column
                        id="solution"
                        className={`h-full max-h-[${timelineHeight}px] w-full grid grid-rows-[repeat(auto-fill,${ruleButtonHeight}px)] grid-cols-2 place-items-center`}
                    >
                        {items.solution.map((rule, i) => (
                            <SortableButton
                                ref={i === 0 ? ruleButtonRef : undefined}
                                key={rule.id}
                                id={rule.id}
                                index={i}
                                group="solution"
                                className="size-fit p-2 md:p-4 lg:p-6 text-lg select-none gr"
                            >
                                {formatRule(rule.rule)}
                            </SortableButton>
                        ))}
                    </Column>
                </div>
                <div
                    className={`col-start-1 col-end-3 row-start-1 row-end-2 lg:row-end-3 lg:col-start-2 flex flex-col gap-4 h-full items-center justify-center text-5xl lg:text-9xl font-bold ${success && "text-green-500"}`}
                >
                    {word}
                    <div className="text-lg font-normal">
                        <span className="font-bold">Goal:</span>{" "}
                        {level.initialWord} → {level.targetWord}
                    </div>
                </div>
                {/* </div> */}
                <div className="col-start-2 lg:col-start-1 col-end-3 row-start-2 lg:row-start-3 row-end-5 flex flex-col gap-4 h-full bg-secondary rounded-4xl">
                    <h2 className="text-3xl font-semibold text-center lg:text-left lg:ml-6 mt-6">
                        Changes
                    </h2>
                    <Column
                        id="bank"
                        className="h-full w-full flex flex-col lg:flex-row flex-wrap overflow-scroll gap-4 items-center justify-center"
                    >
                        {items.bank.map((rule, i) => (
                            <SortableButton
                                ref={i === 0 ? ruleButtonRef : undefined}
                                key={rule.id}
                                id={rule.id}
                                index={i}
                                group="bank"
                                className="size-fit p-2 md:p-4 lg:p-6 text-lg select-none"
                            >
                                {formatRule(rule.rule)}
                            </SortableButton>
                        ))}
                    </Column>
                </div>
                {/* {completed && (
                    <Button
                        className="ml-auto bg-blue-500 w-20 h-12"
                        onClick={() => (location.href = `/${levelNum + 1}`)}
                    >
                        Next
                    </Button>
                )} */}
            </main>
        </DragDropProvider>
    );
}
