"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Level, NUM_LEVELS } from "@/lib/level";
import { compressString, decompressString, isNumeric } from "@/lib/utils";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import Form from "next/form";
import { Field, FieldGroup, FieldLabel } from "./ui/field";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";

export default function Header({
    editor,
    levelNum,
    levelName,
    levelCompleted,
    levelVerified,
    exportedLevel,
    setLevel,
}:
    | {
          editor: false;
          levelNum: string;
          levelName: string;
          levelCompleted: boolean;
          levelVerified?: undefined;
          exportedLevel?: undefined;
          setLevel?: undefined;
      }
    | {
          editor: true;
          levelNum: string;
          levelName: string;
          levelCompleted?: undefined;
          levelVerified: boolean;
          exportedLevel: Level | undefined;
          setLevel: Dispatch<SetStateAction<Level | undefined>>;
      }) {
    const levelNumInt = isNumeric(levelNum) ? Number.parseInt(levelNum) : null;

    const router = useRouter();

    const [newExportedLevel, setNewExportedLevel] = useState(exportedLevel);

    useEffect(() => {
        if (!exportedLevel) {
            setNewExportedLevel(undefined);
            return;
        }

        if (!newExportedLevel) {
            setNewExportedLevel(exportedLevel);
            return;
        }

        setNewExportedLevel({ ...exportedLevel, name: newExportedLevel.name });
    }, [exportedLevel]);

    const [levelCode, setLevelCode] = useState("");

    useEffect(() => {
        async function func() {
            setLevelCode(
                await compressString(JSON.stringify(newExportedLevel)),
            );
        }
        func();
    }, [newExportedLevel]);

    const [isCodeCopied, setIsCodeCopied] = useState(false);

    return (
        <div>
            <div className="flex flex-col lg:grid lg:grid-cols-3 items-center justify-between px-4 pt-4 lg:px-12 lg:pt-12">
                <nav className="flex gap-4 text-lg">
                    <Link className="text-5xl p-2 font-light" href="/">
                        chain→ling
                    </Link>
                </nav>
                <header className="flex flex-col items-center text-lg">
                    <h1 className="font-bold text-4xl">
                        {levelNumInt === null ? "" : "Level "}
                        {levelNum}
                    </h1>
                    <p className="text-center">{levelName}</p>
                </header>
                <div className="flex flex-row-reverse gap-4 text-lg">
                    {editor ? (
                        <>
                            <Dialog>
                                <DialogTrigger
                                    className={`text-3xl px-2 pt-2 lg:pb-2 ${levelVerified ? "block lg:visible" : "hidden lg:invisible"}`}
                                >
                                    export
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>export level</DialogTitle>
                                    </DialogHeader>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();

                                            setIsCodeCopied(true);

                                            navigator.clipboard.writeText(
                                                levelCode,
                                            );
                                        }}
                                        className="grid gap-4"
                                    >
                                        <FieldGroup>
                                            <Field orientation="horizontal">
                                                <FieldLabel htmlFor="name">
                                                    name
                                                </FieldLabel>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    defaultValue="new level"
                                                    onChange={(e) => {
                                                        if (!newExportedLevel)
                                                            return;

                                                        setNewExportedLevel({
                                                            ...newExportedLevel,
                                                            name: e.target
                                                                .value,
                                                        });

                                                        setIsCodeCopied(false);
                                                    }}
                                                />
                                            </Field>
                                            <code className="h-24 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono overflow-auto">
                                                {levelCode}
                                            </code>
                                        </FieldGroup>
                                        <DialogFooter>
                                            {isCodeCopied ? (
                                                <DialogClose asChild>
                                                    <Button>done</Button>
                                                </DialogClose>
                                            ) : (
                                                <Button type="submit">
                                                    copy
                                                </Button>
                                            )}
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <Dialog>
                                <DialogTrigger
                                    className={`text-3xl px-2 pt-2 lg:pb-2`}
                                >
                                    import
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>import level</DialogTitle>
                                    </DialogHeader>
                                    <Form
                                        action={(e) => {
                                            const action = e.get("action");
                                            const levelCode = e
                                                .get("levelCode")
                                                ?.toString()!;

                                            if (action === "import") {
                                                router.push(
                                                    "level?code=" +
                                                        encodeURIComponent(
                                                            levelCode,
                                                        ),
                                                );
                                            } else if (action === "edit") {
                                                decompressString(
                                                    levelCode,
                                                ).then((code) =>
                                                    setLevel(JSON.parse(code)),
                                                );
                                            }
                                        }}
                                        className="grid gap-4"
                                    >
                                        <FieldGroup>
                                            <Field>
                                                <Textarea
                                                    className="h-24 rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono overflow-auto resize-none"
                                                    placeholder="paste level code here"
                                                    name="levelCode"
                                                />
                                            </Field>
                                        </FieldGroup>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button
                                                    type="submit"
                                                    name="action"
                                                    value="edit"
                                                >
                                                    edit
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                type="submit"
                                                name="action"
                                                value="import"
                                            >
                                                import
                                            </Button>
                                        </DialogFooter>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </>
                    ) : (
                        levelNumInt !== null && (
                            <Link
                                className={`text-3xl px-2 pt-2 lg:pb-2 ${levelCompleted ? "block lg:visible" : "hidden lg:invisible"}`}
                                href={
                                    levelNumInt === NUM_LEVELS
                                        ? "/end"
                                        : `/${levelNumInt + 1}`
                                }
                            >
                                next
                            </Link>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
