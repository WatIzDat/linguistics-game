/// <reference types="umami-browser" />
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TouchProvider } from "@/components/ui/hybrid-tooltip";
import Head from "next/head";
import Script from "next/script";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "chain→ling | the puzzle game about sound change",
    description: "the puzzle game about sound change",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            {/* <Head>
                <script
                    defer
                    src="https://cloud.umami.is/script.js"
                    data-website-id="aeab8953-5869-4dd3-b0a9-ddc9cc82cfd4"
                ></script>
            </Head> */}

            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <TouchProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                </TouchProvider>
                {
                    <Script
                        defer
                        src="/stats.js"
                        data-website-id="aeab8953-5869-4dd3-b0a9-ddc9cc82cfd4"
                        strategy="beforeInteractive"
                    />
                }
            </body>
        </html>
    );
}
