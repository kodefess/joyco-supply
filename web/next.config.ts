import path from "node:path";
import type { NextConfig } from "next";

// web/ berada di dalam repo netnot yang punya lockfile & proxy.ts sendiri.
// Kunci root ke folder ini supaya Next tidak ikut memungut file app induk.
const root = path.resolve(__dirname);

const nextConfig: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default nextConfig;
