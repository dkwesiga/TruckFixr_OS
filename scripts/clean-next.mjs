import { rmSync } from "node:fs";
import { join } from "node:path";

const target = join(process.cwd(), ".next");

rmSync(target, { recursive: true, force: true });
console.log("Removed generated .next directory.");
