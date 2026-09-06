import { readFile } from "node:fs/promises";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const root = new URL("../", import.meta.url);
const [site, schema] = await Promise.all([
  readFile(new URL("content/site.json", root), "utf8").then(JSON.parse),
  readFile(new URL("content/site.schema.json", root), "utf8").then(JSON.parse),
]);

const ajv = new Ajv2020({ allErrors: true, strict: true });
addFormats(ajv);
const validate = ajv.compile(schema);
if (!validate(site)) {
  console.error("Site content does not match content/site.schema.json:");
  for (const error of validate.errors ?? []) console.error(`- ${error.instancePath || "/"} ${error.message}`);
  process.exit(1);
}

console.log("Validated content/site.json against content/site.schema.json.");
