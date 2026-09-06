import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prisma = path.join(root, "node_modules", ".bin", "prisma");
const generated = execFileSync(prisma, ["migrate", "diff", "--from-empty", "--to-schema-datamodel", "prisma/schema.prisma", "--script"], { cwd: root, encoding: "utf8" });
const committed = await readFile(path.join(root, "prisma/migrations/20260906101500_initial_platform/migration.sql"), "utf8");

function statements(sql) {
  return sql
    .replace(/^--.*$/gm, "")
    .split(";")
    .map((statement) => statement.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .sort();
}

const expected = statements(generated);
const actual = statements(committed);
const missing = expected.filter((statement) => !actual.includes(statement));
const extra = actual.filter((statement) => !expected.includes(statement));
if (missing.length || extra.length) {
  console.error("Committed initial migration differs from the current Prisma schema.");
  for (const statement of missing) console.error(`Missing: ${statement}`);
  for (const statement of extra) console.error(`Extra: ${statement}`);
  process.exit(1);
}
console.log(`Validated ${actual.length} migration statements against the current Prisma schema.`);
