import type { NextConfig } from "next";

const path = require("path");

const nextConfig: NextConfig = {
  sassOptions: {
    silenceDeprecations: ["color-functions", "global-builtin", "import"],
  },
  output: "export",
  trailingSlash: true,
};

export default nextConfig;
