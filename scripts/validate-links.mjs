import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(await readFile(path.join(root, "content/site.json"), "utf8"));
const pageEntries = Object.values(site.pages);
const declaredRoutes = new Set(pageEntries.map((page) => page.path));
const errors = [];

async function sourceFiles(directory, matcher = /\.(?:tsx|ts)$/) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(absolute, matcher));
    else if (matcher.test(entry.name)) files.push(absolute);
  }
  return files;
}

const pageFiles = await sourceFiles(path.join(root, "app"), /^page\.tsx$/);
const appRoutes = new Set(pageFiles.map((file) => {
  const relative = path.relative(path.join(root, "app"), path.dirname(file));
  return relative === "" ? "/" : `/${relative.split(path.sep).filter((part) => !part.startsWith("(")).join("/")}`;
}));

if (declaredRoutes.size !== pageEntries.length) errors.push("Page metadata contains duplicate paths.");
for (const route of declaredRoutes) if (!appRoutes.has(route)) errors.push(`Declared page has no App Router page.tsx: ${route}`);
for (const route of appRoutes) if (!declaredRoutes.has(route) && !route.includes("[")) errors.push(`App Router page is missing metadata: ${route}`);
for (const item of site.navigation) if (!appRoutes.has(item.href)) errors.push(`Navigation target has no App Router page: ${item.href}`);
for (const page of pageEntries) if (!site.navigation.some((item) => item.href === page.path)) errors.push(`Page is absent from navigation: ${page.path}`);

const files = [...await sourceFiles(path.join(root, "app")), ...await sourceFiles(path.join(root, "components"))];
const ids = new Set();
const links = [];
for (const file of files) {
  const source = await readFile(file, "utf8");
  for (const match of source.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(match[1]);
  for (const match of source.matchAll(/\bhref=["']([^"']+)["']/g)) links.push({ href: match[1], file: path.relative(root, file) });
}
for (const { href, file } of links) {
  if (href.startsWith("#") && !ids.has(href.slice(1))) errors.push(`${file} links to missing fragment ${href}`);
  if (href.startsWith("/") && !href.startsWith("//")) {
    const pathname = href.split(/[?#]/)[0] || "/";
    if (!appRoutes.has(pathname) && pathname !== "/opengraph-image") errors.push(`${file} links to missing route ${pathname}`);
  }
}

if (errors.length) {
  console.error("Internal link validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log(`Validated ${appRoutes.size} App Router pages, ${site.navigation.length} navigation entries, and ${links.length} literal internal links across ${files.length} source files.`);
