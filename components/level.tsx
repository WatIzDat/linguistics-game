"use client";

import { Rule, applyRule, applyRules, formatRule } from "@/lib/rule";
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
    CSSProperties,
    Fragment,
    MouseEventHandler,
    forwardRef,
    useCallback,
    useMemo,
} from "react";
import { Button } from "./ui/button";
import { CollisionPriority } from "@dnd-kit/abstract";
import { Level, NUM_LEVELS } from "@/lib/level";
import { clearTimeout, setTimeout } from "timers";
import { motion } from "motion/react";
import { InfoIcon, PlusIcon, RotateCcwIcon, TrashIcon } from "lucide-react";
import { Howl, Howler } from "howler";
import { isNumeric } from "@/lib/utils";
import { isEqual, max } from "lodash-es";
import {
    HybridTooltip,
    HybridTooltipContent,
    HybridTooltipTrigger,
} from "./ui/hybrid-tooltip";
import Word from "./word";
import { usePrevious } from "@/lib/hooks";
import RulePopover from "./rule-popover";
import WordPopover from "./word-popover";

const SortableButton = forwardRef(
    (
        {
            children,
            sortableId,
            index,
            group,
            className,
            onClick,
            ...props
        }: {
            children: React.ReactNode;
            sortableId: number;
            index: number;
            group: string;
            className?: string;
            onClick?: MouseEventHandler<HTMLButtonElement>;
        } & React.ComponentProps<"button">,
        forwardedRef,
    ) => {
        const { ref: sortableRef, isDragging } = useSortable({
            id: sortableId,
            index,
            type: "item",
            accept: "item",
            group,
        });

        const mergedRef = useCallback(
            (node: Element | null) => {
                sortableRef(node);

                if (typeof forwardedRef === "function") {
                    forwardedRef(node);
                } else if (forwardedRef) {
                    forwardedRef.current = node;
                }
            },
            [forwardedRef],
        );

        return (
            <Button
                ref={mergedRef}
                className={className}
                data-dragging={isDragging}
                onClick={onClick}
                {...props}
            >
                {children}
            </Button>
        );
    },
);

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

export default function LevelPage({
    editor,
    level,
    levelNum,
    setCompleted,
    setVerified,
    setExportedLevel,
    saveLevel,
}:
    | {
          editor: false;
          level: Level;
          levelNum: string;
          setCompleted: Dispatch<SetStateAction<boolean>>;
          setVerified?: undefined;
          setExportedLevel?: undefined;
          saveLevel?: undefined;
      }
    | {
          editor: true;
          level?: Level | undefined;
          levelNum?: undefined;
          setCompleted?: undefined;
          setVerified?: Dispatch<SetStateAction<boolean>>;
          setExportedLevel: Dispatch<SetStateAction<Level | undefined>>;
          saveLevel: boolean;
      }) {
    if (editor) {
        useEffect(() => {
            if (!level) {
                return;
            }

            const newRules = level.rules.map((rule, i) => ({ id: i, rule }));

            replaceRulesRef!.current = true;
            setRules!(newRules);

            replaceWordsRef!.current = true;
            setWordConfigs!(
                level.words.map((w, i) => ({
                    id: i,
                    initialWord: w.initialWord,
                    targetWord: w.targetWord,
                })),
            );
            setItems({ bank: newRules, solution: [] });
        }, [level]);
    }

    const [rules, setRules] = editor
        ? useState<{ id: number; rule: Rule }[]>([])
        : [level.rules.map((rule, i) => ({ id: i, rule })), null];

    const maxRuleIdRef = editor ? useRef(0) : null;

    const [items, setItems] = useState<{
        bank: { id: number; rule: Rule }[];
        solution: { id: number; rule: Rule }[];
    }>({
        bank: rules,
        solution: [],
    });

    const replaceRulesRef = editor ? useRef(true) : null;

    if (editor) {
        const prevRules = usePrevious(rules);

        useEffect(() => {
            if (saveLevel)
                localStorage.setItem("editorRules", JSON.stringify(rules));

            if (rules.length === 0 && wordConfigs.length === 0) {
                setDeleteMode!(false);
            }

            if (replaceRulesRef!.current) {
                setItems({
                    bank: rules,
                    solution: [],
                });

                replaceRulesRef!.current = false;

                maxRuleIdRef!.current =
                    max(rules.map((r) => r.id)) ?? maxRuleIdRef!.current;

                return;
            }

            const addedRules = rules.filter(
                (rule) => !prevRules?.map((r) => r.id).includes(rule.id),
            );
            const removedRules = prevRules?.filter(
                (rule) => !rules.map((r) => r.id).includes(rule.id),
            );

            maxRuleIdRef!.current =
                max(addedRules.map((r) => r.id)) ?? maxRuleIdRef!.current;

            if (
                setVerified &&
                removedRules &&
                removedRules?.length > 0 &&
                !success
            ) {
                setVerified(false);
            }

            setItems({
                bank: [
                    ...items.bank
                        .filter(
                            (rule) =>
                                !removedRules
                                    ?.map((r) => r.id)
                                    .includes(rule.id),
                        )
                        .map((rule) => rules.find((r) => r.id === rule.id)!),
                    ...addedRules,
                ],
                solution: [
                    ...items.solution
                        .filter(
                            (rule) =>
                                !removedRules
                                    ?.map((r) => r.id)
                                    .includes(rule.id),
                        )
                        .map((rule) => rules.find((r) => r.id === rule.id)!),
                ],
            });
        }, [rules]);
    }

    const [wordConfigs, setWordConfigs] = editor
        ? useState<{ id: number; initialWord: string; targetWord: string }[]>(
              [],
          )
        : [
              level.words.map((w, i) => ({
                  id: i,
                  initialWord: w.initialWord,
                  targetWord: w.targetWord,
              })),
              null,
          ];

    const [words, setWords] = useState<{ id: number; word: string }[]>(
        wordConfigs.map((w, i) => ({ id: i, word: w.initialWord })),
    );

    const maxWordIdRef = editor ? useRef(0) : null;

    const [affectedIndices, setAffectedIndices] = useState<number[][]>([]);

    const [viewedRuleIndex, setViewedRuleIndex] = useState<number | null>(null);

    const [success, setSuccess] = useState(false);

    if (editor) {
        useEffect(() => {
            async function func() {
                setExportedLevel!({
                    name: "new level",
                    words: wordConfigs.map((w) => ({
                        initialWord: w.initialWord,
                        targetWord: w.targetWord,
                    })),
                    rules: rules.map((r) => r.rule),
                });
            }
            func();
        }, [rules, wordConfigs]);

        useEffect(() => {
            if (setVerified && success) {
                setVerified(true);
            }
        }, [success]);
    }

    const isFirstSuccessRef = useRef(true);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [timelineHeaderVisible, setTimelineHeaderVisible] = useState(true);

    const pickupSounds = [new Howl({ src: ["sounds/cursor1.mp3"] })];

    const dropSounds = [
        new Howl({ src: ["sounds/swipe1.mp3"], volume: 0.5 }),
        new Howl({ src: ["sounds/swipe2.mp3"], volume: 0.5 }),
    ];

    const swapSound = new Howl({ src: ["sounds/cursor2.mp3"] });

    const successSound = new Howl({ src: ["sounds/success.mp3"] });

    Howler.volume(0.5);

    const prevItems = usePrevious(items);

    const levelNumInt = editor
        ? null
        : isNumeric(levelNum)
          ? Number.parseInt(levelNum)
          : null;

    useEffect(
        () => {
            setTimelineHeaderVisible(items.solution.length <= 0);

            let newWords = wordConfigs.map((w) => ({
                id: w.id,
                word: w.initialWord,
            }));

            newWords =
                viewedRuleIndex === null
                    ? newWords.map((w, i) => ({
                          id: w.id,
                          word: applyRules(
                              items.solution.map((x) => x.rule),
                              wordConfigs[i].initialWord,
                          ),
                      }))
                    : newWords.map((w, i) => ({
                          id: w.id,
                          word: applyRules(
                              items.solution
                                  .slice(0, viewedRuleIndex + 1)
                                  .map((x) => x.rule),
                              wordConfigs[i].initialWord,
                          ),
                      }));

            setWords(newWords);

            if (!isEqual(items, prevItems)) {
                swapSound.play();
            }

            let allEqual = true;

            for (let i = 0; i < newWords.length; i++) {
                if (newWords[i].word !== wordConfigs[i].targetWord) {
                    allEqual = false;

                    break;
                }
            }

            if (allEqual && newWords.length > 0) {
                if (timeoutRef.current !== null) {
                    clearTimeout(timeoutRef.current);
                }

                timeoutRef.current = setTimeout(() => {
                    setSuccess(true);

                    if (!editor) {
                        setCompleted(true);
                    }

                    if ((editor && !success) || isFirstSuccessRef.current) {
                        successSound.play();
                    }

                    isFirstSuccessRef.current = false;

                    if (levelNumInt !== null) {
                        if (levelNumInt === NUM_LEVELS) {
                            localStorage.removeItem("level");
                        } else {
                            localStorage.setItem(
                                "level",
                                (levelNumInt + 1).toString(),
                            );
                        }
                    }
                }, 1000);
            } else {
                setSuccess(false);

                if (timeoutRef.current !== null) {
                    clearTimeout(timeoutRef.current);

                    timeoutRef.current = null;
                }
            }

            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
            };
        },
        editor
            ? [items, viewedRuleIndex, wordConfigs]
            : [items, viewedRuleIndex],
    );

    const wordRefs = useRef<Array<HTMLDivElement | null>>(
        [...Array(wordConfigs.length)].map((_) => null),
    );
    const measureRefs = useRef<Array<HTMLDivElement | null>>(
        [...Array(wordConfigs.length)].map((_) => null),
    );

    const isWordOverflowingRef = useRef(
        [...Array(wordConfigs.length)].map((_) => false),
    );
    const [isWordOverflowing, setIsWordOverflowing] = useState(
        [...Array(wordConfigs.length)].map((_) => false),
    );

    const replaceWordsRef = editor ? useRef(false) : null;

    if (editor) {
        useMemo(() => {
            setWords(
                wordConfigs.map((w) => ({
                    id: w.id,
                    word: w.initialWord,
                })),
            );
        }, [wordConfigs]);

        useEffect(() => {
            maxWordIdRef!.current =
                max(wordConfigs.map((w) => w.id)) ?? maxWordIdRef!.current;

            if (setVerified && !success && !replaceWordsRef!.current) {
                setVerified(false);
            }

            if (replaceWordsRef!.current) {
                replaceWordsRef!.current = false;
            }

            wordRefs.current = [...Array(wordConfigs.length)].map((_) => null);
            measureRefs.current = [...Array(wordConfigs.length)].map(
                (_) => null,
            );

            isWordOverflowingRef.current = [...Array(wordConfigs.length)].map(
                (_) => false,
            );

            setIsWordOverflowing(
                [...Array(wordConfigs.length)].map((_) => false),
            );

            if (rules.length === 0 && wordConfigs.length === 0) {
                setDeleteMode!(false);
            }

            if (saveLevel)
                localStorage.setItem(
                    "editorWordConfigs",
                    JSON.stringify(wordConfigs),
                );
        }, [wordConfigs, success]);
    }

    useEffect(() => {
        const cleanup = wordRefs.current.map((ref, i) => {
            const el = ref;
            const measure = measureRefs.current[i];

            if (!el || !measure) {
                return () => {};
            }

            let timeout: ReturnType<typeof setTimeout>;

            const check = (i: number) => {
                clearTimeout(timeout!);
                timeout = setTimeout(() => {
                    const isOverflowing =
                        measure.scrollWidth > el.clientWidth - 50;

                    if (isWordOverflowingRef.current[i] !== isOverflowing) {
                        isWordOverflowingRef.current[i] = isOverflowing;
                        setIsWordOverflowing((prev) =>
                            prev.map((_, j) =>
                                j === i ? isOverflowing : prev[j],
                            ),
                        );
                    }
                }, 50);
            };

            const observer = new ResizeObserver(() => check(i));
            observer.observe(el);
            check(i);

            return () => {
                observer.disconnect();
                clearTimeout(timeout);
            };
        });

        return () => cleanup.forEach((c) => c());
    }, [words]);

    const [deleteMode, setDeleteMode] = editor ? useState(false) : [null, null];

    return (
        <DragDropProvider
            onDragStart={(event) => {
                pickupSounds[
                    Math.floor(Math.random() * pickupSounds.length)
                ].play();
            }}
            onDragEnd={(event) => {
                dropSounds[
                    Math.floor(Math.random() * dropSounds.length)
                ].play();
            }}
            onDragOver={(event) => {
                setItems((items) => move(items, event));
            }}
        >
            <main className="min-h-0 grid grid-cols-2 lg:max-2xl:grid-cols-[2fr_1fr] grid-rows-[1fr_auto] gap-4 lg:gap-12 bg-background p-4 lg:p-12 sm:items-start">
                <motion.div
                    layout
                    className="col-start-1 col-end-2 row-start-2 row-end-3 lg:row-start-1 lg:row-end-2 flex flex-col lg:flex-row gap-4 h-full min-h-0 overflow-auto bg-secondary rounded-4xl"
                    onClick={(event) => {
                        if (viewedRuleIndex !== null) {
                            setViewedRuleIndex(null);
                        }
                    }}
                >
                    <div className="flex flex-col justify-center lg:justify-between">
                        <h2
                            className={`text-3xl font-semibold text-center lg:text-left lg:ml-6 mt-6 lg:absolute 2xl:static ${timelineHeaderVisible ? "lg:visible" : "lg:invisible"} 2xl:visible`}
                        >
                            Timeline
                        </h2>
                        <Button
                            className="ml-6 mb-6 max-2xl:hidden"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                                setItems({
                                    bank: rules,
                                    solution: [],
                                })
                            }
                        >
                            <RotateCcwIcon />
                        </Button>
                    </div>
                    <Column
                        id="solution"
                        className="lg:h-full w-full h-[50svh] flex flex-col gap-1 xl:gap-4 p-4 items-center lg:place-items-center lg:grid lg:grid-rows-5 lg:grid-flow-col overflow-auto"
                        style={{
                            gridTemplateColumns: `repeat(${Math.ceil(
                                rules.length / 5,
                            )}, 1fr)`,
                        }}
                    >
                        {items.solution.map((rule, i) => (
                            <SortableButton
                                key={rule.id}
                                sortableId={rule.id}
                                index={i}
                                group="solution"
                                className={`h-fit lg:h-full w-full text-xs md:text-sm md:p-4 lg:text-base xl:text-xl select-none ${viewedRuleIndex !== null && i <= viewedRuleIndex ? "bg-muted-foreground" : ""} ${viewedRuleIndex !== null && i === viewedRuleIndex ? "border-white border-4" : ""} ${deleteMode && "bg-red-500"} `}
                                onClick={(event) => {
                                    event.stopPropagation();

                                    if (deleteMode) {
                                        setRules!(
                                            rules.filter(
                                                (r) => r.id !== rule.id,
                                            ),
                                        );

                                        return;
                                    }

                                    setViewedRuleIndex(
                                        viewedRuleIndex === i ? null : i,
                                    );
                                }}
                            >
                                {formatRule(rule.rule)}
                            </SortableButton>
                        ))}
                    </Column>
                </motion.div>
                <motion.div
                    layout
                    className={`relative overflow-auto transition-colors col-start-1 col-end-3 row-start-1 row-end-2 lg:col-start-2 flex lg:max-2xl:flex-col lg:max-2xl:flex-nowrap ${isWordOverflowing.includes(true) ? "flex-col flex-nowrap" : "flex-wrap"} ${words.length === 2 && !editor && "flex-col"} h-full items-center justify-center text-5xl ${words.length === 2 && "lg:text-7xl"} ${words.length > 2 ? "2xl:text-9xl" : "lg:text-9xl"} font-bold ${success && "text-green-500"}`}
                >
                    {words.map((word, wordIndex) => (
                        <Fragment key={word.id}>
                            <Word
                                word={word.word}
                                wordIndex={wordIndex}
                                refs={wordRefs}
                                affectedIndices={affectedIndices}
                                // level={level}
                                wordConfigs={wordConfigs}
                                deleteMode={deleteMode}
                                deleteWord={() =>
                                    setWordConfigs!(
                                        wordConfigs.filter(
                                            (w) => w.id !== word.id,
                                        ),
                                    )
                                }
                            />
                            <Word
                                word={word.word}
                                wordIndex={wordIndex}
                                refs={measureRefs}
                                affectedIndices={affectedIndices}
                                // level={level}
                                wordConfigs={wordConfigs}
                                measure
                            />
                        </Fragment>
                    ))}
                    {editor && (
                        <div className="flex items-center justify-center size-1/2">
                            <WordPopover
                                side="top"
                                onSubmit={(initialWord, targetWord) => {
                                    setWordConfigs!([
                                        ...wordConfigs,
                                        {
                                            id: maxWordIdRef!.current + 1,
                                            initialWord,
                                            targetWord,
                                        },
                                    ]);
                                }}
                            />
                        </div>
                    )}
                    <Button
                        className="ml-6 mb-6 2xl:hidden absolute top-0 right-0"
                        size="icon"
                        variant="ghost"
                        onClick={() =>
                            setItems({
                                bank: rules,
                                solution: [],
                            })
                        }
                    >
                        <RotateCcwIcon />
                    </Button>
                    {!editor && (levelNumInt === null || levelNumInt >= 5) && (
                        <HybridTooltip>
                            <div className="sticky mt-auto bottom-0">
                                <HybridTooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        // className="md:hidden ml-6"
                                        className="md:hidden ml-6 mt-6 absolute bottom-0 right-0"
                                    >
                                        <InfoIcon />
                                    </Button>
                                </HybridTooltipTrigger>
                            </div>
                            <HybridTooltipContent
                                className="w-fit bg-black text-white"
                                side="left"
                            >
                                <p>V: a, e, i, o, and u</p>
                                <p>C: everything else</p>
                            </HybridTooltipContent>
                        </HybridTooltip>
                    )}
                </motion.div>
                <motion.div
                    layout
                    className="col-start-2 lg:col-start-1 col-end-3 row-start-2 row-end-3 flex flex-col gap-4 h-full bg-secondary rounded-4xl min-h-50 overflow-auto"
                >
                    <div
                        className={`${editor ? "flex max-lg:flex-col max-lg:gap-4" : "md:grid md:grid-cols-3"} lg:flex lg:justify-between`}
                    >
                        <h2 className="col-start-2 text-3xl font-semibold text-center lg:text-left lg:ml-6 mt-6">
                            Changes
                        </h2>
                        {editor ? (
                            <div className="max-lg:flex max-lg:justify-center">
                                <Button
                                    variant="ghost"
                                    className="lg:mr-6 lg:mt-6"
                                    onClick={() => setDeleteMode!(!deleteMode)}
                                >
                                    <TrashIcon />
                                </Button>
                                <RulePopover
                                    type="add"
                                    side="left"
                                    onSubmit={(
                                        pattern,
                                        replacement,
                                        environmentBefore,
                                        environmentAfter,
                                    ) =>
                                        setRules!([
                                            ...rules,
                                            {
                                                id: maxRuleIdRef!.current + 1,
                                                rule: {
                                                    pattern: pattern,
                                                    replacement: replacement,
                                                    environment:
                                                        environmentBefore ||
                                                        environmentAfter
                                                            ? `${environmentBefore} _ ${environmentAfter}`
                                                            : null,
                                                },
                                            },
                                        ])
                                    }
                                >
                                    <Button
                                        variant="ghost"
                                        className="max-sm:hidden lg:mr-6 lg:mt-6"
                                    >
                                        <PlusIcon />
                                    </Button>
                                </RulePopover>
                                <RulePopover
                                    type="add"
                                    side="top"
                                    onSubmit={(
                                        pattern,
                                        replacement,
                                        environmentBefore,
                                        environmentAfter,
                                    ) =>
                                        setRules!([
                                            ...rules,
                                            {
                                                id: maxRuleIdRef!.current + 1,
                                                rule: {
                                                    pattern: pattern,
                                                    replacement: replacement,
                                                    environment:
                                                        environmentBefore ||
                                                        environmentAfter
                                                            ? `${environmentBefore} _ ${environmentAfter}`
                                                            : null,
                                                },
                                            },
                                        ])
                                    }
                                >
                                    <Button
                                        variant="ghost"
                                        className="sm:hidden lg:mr-6 lg:mt-6"
                                    >
                                        <PlusIcon />
                                    </Button>
                                </RulePopover>
                            </div>
                        ) : (
                            (levelNumInt === null || levelNumInt >= 5) && (
                                <HybridTooltip>
                                    <HybridTooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="max-md:hidden mr-6 mt-6 ml-auto"
                                        >
                                            <InfoIcon />
                                        </Button>
                                    </HybridTooltipTrigger>
                                    <HybridTooltipContent
                                        className="w-fit bg-black text-white"
                                        side="top"
                                    >
                                        <p>V: a, e, i, o, and u</p>
                                        <p>C: everything else</p>
                                    </HybridTooltipContent>
                                </HybridTooltip>
                            )
                        )}
                    </div>
                    <Column
                        id="bank"
                        className="h-full w-full flex flex-col lg:flex-row flex-nowrap lg:flex-wrap overflow-auto gap-1 md:gap-2 lg:gap-4 p-4 items-center lg:justify-center"
                    >
                        {items.bank.map((rule, i) =>
                            editor ? (
                                <RulePopover
                                    key={rule.id}
                                    type="edit"
                                    side="top"
                                    customTrigger={(onClick) => (
                                        <SortableButton
                                            sortableId={rule.id}
                                            index={i}
                                            group="bank"
                                            className={`w-full h-fit lg:size-fit md:p-4 lg:p-6 text-xs md:text-sm lg:text-base xl:text-lg select-none ${deleteMode && "bg-red-500"}`}
                                            onClick={
                                                deleteMode
                                                    ? () =>
                                                          setRules!(
                                                              rules.filter(
                                                                  (r) =>
                                                                      r.id !==
                                                                      rule.id,
                                                              ),
                                                          )
                                                    : onClick
                                            }
                                            onPointerOver={() =>
                                                setAffectedIndices(
                                                    words.map(
                                                        (w) =>
                                                            applyRule(
                                                                rule.rule,
                                                                w.word,
                                                            )[1],
                                                    ),
                                                )
                                            }
                                            onPointerLeave={() =>
                                                setAffectedIndices([])
                                            }
                                        >
                                            {formatRule(rule.rule)}
                                        </SortableButton>
                                    )}
                                    onSubmit={(
                                        pattern,
                                        replacement,
                                        environmentBefore,
                                        environmentAfter,
                                    ) =>
                                        setRules!(
                                            rules.map((r) =>
                                                r.id === rule.id
                                                    ? {
                                                          ...rule,
                                                          rule: {
                                                              pattern: pattern,
                                                              replacement:
                                                                  replacement,
                                                              environment:
                                                                  environmentBefore ||
                                                                  environmentAfter
                                                                      ? `${environmentBefore} _ ${environmentAfter}`
                                                                      : null,
                                                          },
                                                      }
                                                    : r,
                                            ),
                                        )
                                    }
                                />
                            ) : (
                                <SortableButton
                                    key={rule.id}
                                    sortableId={rule.id}
                                    index={i}
                                    group="bank"
                                    className={`w-full h-fit lg:size-fit md:p-4 lg:p-6 text-xs md:text-sm lg:text-base xl:text-lg select-none ${deleteMode && "bg-red-500"}`}
                                    onPointerOver={() =>
                                        setAffectedIndices(
                                            words.map(
                                                (w) =>
                                                    applyRule(
                                                        rule.rule,
                                                        w.word,
                                                    )[1],
                                            ),
                                        )
                                    }
                                    onPointerLeave={() =>
                                        setAffectedIndices([])
                                    }
                                >
                                    {formatRule(rule.rule)}
                                </SortableButton>
                            ),
                        )}
                    </Column>
                </motion.div>
            </main>
        </DragDropProvider>
    );
}
