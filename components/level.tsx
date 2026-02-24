"use client";

import { Rule, applyRules, formatRule } from "@/lib/rule";
import { move } from "@dnd-kit/helpers";
import { DragDropProvider, useDraggable, useDroppable } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import {
    useState,
    useEffect,
    Dispatch,
    SetStateAction,
    useRef,
    RefObject,
    CSSProperties,
    Fragment,
} from "react";
import { Button } from "./ui/button";
import { CollisionPriority } from "@dnd-kit/abstract";
import { Level, NUM_LEVELS } from "@/lib/level";
import { clearTimeout, setTimeout } from "timers";
import {
    closestCenter,
    pointerIntersection,
    directionBiased,
} from "@dnd-kit/collision";
import { motion } from "motion/react";

function SortableButton({
    ref,
    children,
    id,
    index,
    group,
    className,
    style,
}: {
    ref?: RefObject<Element | null>;
    children: React.ReactNode;
    id: number;
    index: number;
    group: string;
    className?: string;
    style?: CSSProperties;
}) {
    const { ref: sortableRef, isDragging } = useSortable({
        id,
        index,
        type: "item",
        accept: "item",
        group,
        // collisionDetector: pointerIntersection,
    });

    // function refs(node: Element | null) {
    //     sortableRef(node);

    //     if (ref) {
    //         ref.current = node;
    //     }
    // }

    return (
        <Button
            ref={sortableRef}
            className={className}
            style={style}
            data-dragging={isDragging}
        >
            {children}
        </Button>
    );
}

// function UnsortableButton({
//     children,
//     id,
//     className,
//     style,
// }: {
//     children: React.ReactNode;
//     id: number;
//     className?: string;
//     style?: CSSProperties;
// }) {
//     const { ref } = useDraggable({ id });

//     return (
//         <Button ref={ref} className={className} style={style}>
//             {children}
//         </Button>
//     );
// }

function Column({
    ref,
    style,
    children,
    id,
    className,
}: {
    ref?: RefObject<Element | null>;
    style?: CSSProperties;
    children: React.ReactNode;
    id: string;
    className?: string;
}) {
    const { ref: sortableRef } = useDroppable({
        id,
        type: "column",
        accept: "item",
        collisionPriority: CollisionPriority.Low,
    });

    function refs(node: Element | null) {
        sortableRef(node);

        if (ref) {
            ref.current = node;
        }
    }

    return (
        <div className={className} ref={refs} style={style}>
            {children}
        </div>
    );
}

// function Slot({ index }: { index: number }) {
//     const { ref } = useDroppable({
//         id: `slot-${index}`,
//         type: "column",
//         accept: "item",
//         collisionPriority: CollisionPriority.High,
//         // collisionDetector: ,
//     });

//     return (
//         <div
//             ref={ref}
//             className="row-start-1 col-start-1 size-full bg-input rounded-xl text-center content-center text-muted-foreground select-none"
//             // style={{
//             //     gridRowStart: (index % 5) + 1,
//             //     gridColumnStart: index / 5 + 1,
//             // }}
//         >
//             {index}
//         </div>
//     );
// }

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
        bank: { id: number; rule: Rule }[];
        solution: { id: number; rule: Rule }[];
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

    const [timelineHeaderVisible, setTimelineHeaderVisible] = useState(true);

    useEffect(() => {
        setTimelineHeaderVisible(items.solution.length <= 0);

        const newWord = applyRules(
            items.solution.filter((x) => x !== null).map((x) => x.rule),
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

    // const [ruleButtonHeight, setRuleButtonHeight] = useState(0);
    // const ruleButtonRef = useRef<HTMLElement | null>(null);

    // useEffect(() => {
    //     setRuleButtonHeight(ruleButtonRef.current?.clientHeight!);
    // });

    // const [timelineHeight, setTimelineHeight] = useState(0);
    // const timelineRef = useRef<HTMLDivElement | null>(null);

    // useEffect(() => {
    //     setTimelineHeight(timelineRef.current?.clientHeight!);
    // });

    // const snapshot = useRef(structuredClone(items));

    return (
        <DragDropProvider
            onDragOver={(event) => {
                setItems((items) => move(items, event));
            }}
        >
            <main className="min-h-0 grid grid-cols-2 lg:grid-rows-[auto_auto_auto_auto] grid-rows-[1fr_auto] gap-4 lg:gap-12 bg-background p-4 lg:p-12 sm:items-start">
                {/* <div className="h-1/2 w-full flex items-center justify-center"> */}
                <motion.div
                    // ref={timelineRef}
                    layout
                    className="col-start-1 col-end-2 row-start-2 row-end-3 lg:row-start-1 lg:row-end-3 flex flex-col lg:flex-row gap-4 h-full bg-secondary rounded-4xl"
                >
                    <h2
                        className={`text-3xl font-semibold text-center lg:text-left lg:ml-6 mt-6 lg:absolute ${timelineHeaderVisible ? "lg:visible" : "lg:invisible"}`}
                    >
                        Timeline
                    </h2>
                    {/* <div
                        className="size-full grid grid-rows-5 gap-4 p-4"
                        style={{
                            gridTemplateColumns: `repeat(${Math.ceil(
                                level.rules.length / 5,
                            )}, 1fr)`,
                        }}
                    >
                        {rules.map(
                            (rule, i) => (
                                <div
                                    key={rule.id}
                                    className="grid grid-rows-1 grid-cols-1"
                                    style={{
                                        gridRowStart: (i % 5) + 1,
                                        gridColumnStart: i / 5 + 1,
                                    }}
                                >
                                    <Slot index={i} />
                                    {items.solution[i] !== null && (
                                        <SortableButton
                                            // ref={i === 0 ? ruleButtonRef : undefined}
                                            // key={items.solution[i].id}
                                            id={items.solution[i].id}
                                            index={
                                                items.solution
                                                    .slice(0, i)
                                                    .filter(
                                                        (rule) => rule !== null,
                                                    ).length
                                            }
                                            group="solution"
                                            className="row-start-1 col-start-1 size-full p-2 md:p-4 lg:p-6 text-lg select-none"
                                            // style={{
                                            //     gridRowStart: (i % 5) + 1,
                                            //     gridColumnStart: i / 5 + 1,
                                            // }}
                                        >
                                            {formatRule(items.solution[i].rule)}
                                        </SortableButton>
                                    )}
                                </div>
                            ),
                            // : (
                            //     <Slot index={i} key={`slot-${rule.id}`} />
                            // ),
                        )}
                    </div> */}

                    <Column
                        id="solution"
                        className="lg:h-full w-full h-[50svh] flex flex-col gap-1 xl:gap-4 p-4 items-center lg:place-items-center lg:grid lg:grid-rows-5 lg:grid-flow-col overflow-auto"
                        style={{
                            gridTemplateColumns: `repeat(${Math.ceil(
                                level.rules.length / 5,
                            )}, 1fr)`,
                        }}
                    >
                        {items.solution.map((rule, i) => (
                            <SortableButton
                                // ref={i === 0 ? ruleButtonRef : undefined}
                                key={rule.id}
                                id={rule.id}
                                index={i}
                                group="solution"
                                className="size-fit lg:size-full text-xs md:text-sm md:p-4 lg:text-base xl:text-lg select-none"
                                // className="size-fit p-2 md:p-4 lg:p-6 text-base lg:text-lg select-none"
                                // style={{
                                //     gridRowStart: (i % 5) + 1,
                                //     gridColumnStart: i / 5 + 1,
                                // }}
                            >
                                {formatRule(rule.rule)}
                            </SortableButton>
                        ))}
                    </Column>
                </motion.div>
                <motion.div
                    layout
                    className={`col-start-1 col-end-3 row-start-1 row-end-2 lg:row-end-3 lg:col-start-2 flex flex-col gap-4 h-full items-center justify-center text-5xl lg:text-9xl font-bold ${success && "text-green-500"}`}
                >
                    {word}
                    <div className="text-lg font-normal">
                        <span className="font-bold">Goal:</span>{" "}
                        {level.initialWord} → {level.targetWord}
                    </div>
                </motion.div>
                {/* </div> */}
                <motion.div
                    layout
                    className="col-start-2 lg:col-start-1 col-end-3 row-start-2 lg:row-start-3 row-end-3 flex flex-col gap-4 h-full bg-secondary rounded-4xl min-h-0 overflow-auto"
                >
                    <h2 className="text-3xl font-semibold text-center lg:text-left lg:ml-6 mt-6">
                        Changes
                    </h2>
                    <Column
                        id="bank"
                        className="h-full w-full flex flex-col lg:flex-row flex-nowrap lg:flex-wrap overflow-auto gap-1 md:gap-2 lg:gap-4 p-4 items-center lg:justify-center"
                    >
                        {items.bank.map((rule, i) => (
                            <SortableButton
                                // ref={i === 0 ? ruleButtonRef : undefined}
                                key={rule.id}
                                id={rule.id}
                                index={i}
                                group="bank"
                                className="size-fit md:p-4 lg:p-6 text-xs md:text-sm lg:text-base xl:text-lg select-none"
                            >
                                {formatRule(rule.rule)}
                            </SortableButton>
                        ))}
                    </Column>
                </motion.div>
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
