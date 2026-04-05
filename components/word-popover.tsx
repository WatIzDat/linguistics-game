import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import {
    Popover,
    PopoverContent,
    PopoverHeader,
    PopoverTrigger,
} from "./ui/popover";
import Form from "next/form";
import { FieldGroup, Field, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";

export default function WordPopover({
    onSubmit,
    side,
}: {
    onSubmit: (initialWord: string, targetWord: string) => any;
    side?: "left" | "top" | "right" | "bottom";
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost">
                    <PlusIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent side={side}>
                <PopoverHeader className="font-bold mb-2">
                    add word
                </PopoverHeader>
                <Form
                    action={(e) => {
                        onSubmit(
                            e.get("initialWord")?.toString() ?? "",
                            e.get("targetWord")?.toString() ?? "",
                        );
                    }}
                >
                    <FieldGroup className="gap-4">
                        <Field orientation="horizontal">
                            <FieldLabel htmlFor="initialWord" className="w-1/2">
                                initial word
                            </FieldLabel>
                            <Input id="initialWord" name="initialWord" />
                        </Field>
                        <Field orientation="horizontal">
                            <FieldLabel htmlFor="targetWord" className="w-1/2">
                                target word
                            </FieldLabel>
                            <Input id="targetWord" name="targetWord" />
                        </Field>
                        <Field>
                            <Button type="submit">add</Button>
                        </Field>
                    </FieldGroup>
                </Form>
            </PopoverContent>
        </Popover>
    );
}
