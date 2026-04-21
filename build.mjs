import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";

// Clean previous build
if (existsSync("dist")) {
  rmSync("dist", { recursive: true });
}

// Compile TypeScript
execSync("npx tsc --project tsconfig.json", { stdio: "inherit" });

console.log("Build complete → dist/");
