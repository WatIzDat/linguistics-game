import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
};

module.exports = {
    async rewrites() {
        return [
            {
                source: "/stats.js",
                destination: "https://cloud.umami.is/script.js",
            },
        ];
    },
};

export default nextConfig;
