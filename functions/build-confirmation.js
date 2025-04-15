/* eslint-disable no-undef */
const esbuild = require("esbuild");
const { sassPlugin } = require("esbuild-sass-plugin");

esbuild
  .build({
    entryPoints: ["../src/components/RsvpConfirmation/RsvpConfirmation.jsx"], // Entry point is now in src
    bundle: true,
    outfile: "dist/RsvpConfirmation.js", // Output to the shared directory
    platform: "node",
    format: "cjs",
    plugins: [sassPlugin()],
    external: ["firebase-admin", "firebase-functions"],
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
    inject: ["./react-shim.js"],
  })
  .catch(() => process.exit(1));
