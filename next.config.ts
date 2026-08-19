import type { NextConfig } from "next";
// Validate environment at build/boot: a missing required var throws here and
// fails the build before anything ships (SLV-057).
import "./src/lib/env";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
