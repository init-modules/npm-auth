import { readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(scriptDir, "..", "dist");
const directive = '"use client";\n';

// TODO: remove this script when the package entry points are split into clean server/client
// entries (index.ts → server.ts + client.ts). Until then this stamps dist chunks that would
// crash RSC when transpilePackages pulls them in during server-side rendering.
//
// A chunk needs "use client" only when loading it server-side actually crashes RSC.
// Crash conditions:
//   1. Module-level `createContext(...)` — RSC react has no createContext export.
//   2. Importing a third-party React library that itself runs module-level React evaluation
//      (e.g. tiptap, dnd-kit, radix-ui — they define `class extends React.Component` or
//      call createContext at module top level inside their own dist).
// `import { useState } from "react"` is safe to load: destructured names are just undefined
// in RSC and only error if called. Function bodies don't run on import.
// Packages that ship "use client" themselves (sonner, lucide-react) are safe and excluded.
const moduleLevelCrashSignals = [
	/^(?:const|let|var)\s+\w+\s*=\s*createContext\s*\(/m,
	/^import\s+[^;]*\bfrom\s+["']@tiptap\//m,
	/^import\s+[^;]*\bfrom\s+["']@dnd-kit\//m,
	/^import\s+[^;]*\bfrom\s+["']@radix-ui\//m,
	/^import\s+[^;]*\bfrom\s+["']framer-motion["']/m,
	/^import\s+[^;]*\bfrom\s+["']react-dnd\b/m,
];

const needsUseClient = (source) =>
	moduleLevelCrashSignals.some((pattern) => pattern.test(source));

const files = await readdir(distDir);
let stampedCount = 0;
for (const file of files) {
	if (!file.startsWith("chunk-") || !file.endsWith(".js")) continue;
	const filePath = path.join(distDir, file);
	const source = await readFile(filePath, "utf8");
	if (source.startsWith('"use client"')) continue;
	if (!needsUseClient(source)) continue;
	await writeFile(filePath, directive + source);
	stampedCount += 1;
}
console.log(`Stamped "use client" on ${stampedCount} dist file(s).`);
