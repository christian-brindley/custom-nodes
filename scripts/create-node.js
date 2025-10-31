#!/usr/bin/env node
import fs from "fs";
import path from "path";

function buildFromTemplate(templateFile, outFile, packageName) {
  let template;
  try {
    template = fs.readFileSync(templateFile, "utf8");
  } catch (err) {
    console.error(`Failed to read template: ${err.message}`);
    process.exit(1);
  }
  const content = template.replaceAll("{{name}}", packageName);
  try {
    fs.writeFileSync(outFile, content, "utf8");
    console.log(`Created file: ${outFile}`);
  } catch (err) {
    console.error(`Failed to write file: ${err.message}`);
    process.exit(1);
  }
}

const packageName = process.argv[2];
if (!packageName) {
  console.error("Usage: create-node <name>");
  process.exit(1);
}

if (!/^[a-z-]+$/.test(packageName)) {
  console.error(
    "Invalid name: only lower case characters and hyphens allowed."
  );
  process.exit(1);
}

const packageDir = `packages/${packageName}`;

if (fs.existsSync(packageDir)) {
  console.error(`Error: package already exists in ${packageDir}`);
  process.exit(1);
}

const srcDir = path.join(packageDir, "src");

fs.mkdirSync(srcDir, { recursive: true });

const TEMPLATE_DIR = "templates";
const SCRIPT_TEMPLATE = "node-script.ts.template";
const NODE_CONFIG_TEMPLATE = "node-config.json.template";
const PACKAGE_TEMPLATE = "package.json.template";
const TSCONFIG_TEMPLATE = "tsconfig.json.template";

buildFromTemplate(
  path.join(TEMPLATE_DIR, PACKAGE_TEMPLATE),
  path.join(packageDir, "package.json"),
  packageName
);

buildFromTemplate(
  path.join(TEMPLATE_DIR, NODE_CONFIG_TEMPLATE),
  path.join(packageDir, "node-config.json"),
  packageName.replaceAll(/-/g, "")
);

fs.copyFileSync(
  path.join(TEMPLATE_DIR, TSCONFIG_TEMPLATE),
  path.join(packageDir, "tsconfig.json")
);

fs.copyFileSync(
  path.join(TEMPLATE_DIR, SCRIPT_TEMPLATE),
  path.join(srcDir, `${packageName}.ts`)
);
