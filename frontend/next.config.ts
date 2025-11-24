import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
    output: "standalone",
    turbopack: {
        root: path.resolve(__dirname, ".."),
        rules: {
            "*.css?raw": {
                loaders: ['raw-loader'],
                as: "*.js",
            }
        }
    }
}

export default nextConfig;