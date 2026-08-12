import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the ngrok tunnel used for local cron-job.org testing hit dev-only
  // Next.js endpoints (HMR, etc.) without being blocked as cross-origin.
  allowedDevOrigins: ["sasquatch-rickety-imaging.ngrok-free.dev"],
};

export default nextConfig;
