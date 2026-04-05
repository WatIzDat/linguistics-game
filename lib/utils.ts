import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function isNumeric(str: string) {
    return (
        !isNaN(str as any) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
        !isNaN(parseFloat(str))
    ); // ...and ensure strings of whitespace fail
}

export async function compressString(str: string) {
    const stream = new Blob([str]).stream();
    const compressionStream = new CompressionStream("deflate");
    const compressedStream = stream.pipeThrough(compressionStream);

    const response = new Response(compressedStream);
    const array = new Uint8Array(await response.arrayBuffer());

    return Buffer.from(array).toString("base64");
}

export async function decompressString(str: string) {
    const buffer = Buffer.from(str, "base64");
    const stream = new Blob([buffer]).stream();

    const decompressionStream = new DecompressionStream("deflate");
    const decompressedStream = stream.pipeThrough(decompressionStream);

    const response = new Response(decompressedStream);

    const text = await response.text();

    return text;
}
