import type { NextConfig } from "next";
// Validate environment at build/boot: a missing required var throws here and
// fails the build before anything ships (SLV-057).
import "./src/lib/env";

const nextConfig: NextConfig = {
  // Enables the `use cache` directive + tag-based invalidation (SLV-092).
  cacheComponents: true,
};

export default nextConfig;
