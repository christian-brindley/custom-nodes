import esbuild, { build } from "esbuild";
import { transformAsync } from "@babel/core";

import fs from "fs";
import path from "path";
import { CompactSign, importJWK } from "jose";
import * as acorn from "acorn";
import "dotenv/config";

const PACKAGES_DIR = "packages";
const DIST_DIR = "dist";
const NODE_OUTCOMES_VAR = "nodeOutcomes";

function base64urlEncode(buffer) {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function prepareOutDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function getNodeOutcomes(script, varName) {
  const ast = acorn.parse(script, {
    ecmaVersion: "latest",
    sourceType: "script",
  });

  let values = null;

  for (const node of ast.body) {
    if (
      node.type === "VariableDeclaration" &&
      node.declarations[0].id.name === varName
    ) {
      const init = node.declarations[0].init;
      if (init && init.type === "ObjectExpression") {
        values = init.properties.map((prop) => {
          if (prop.value.type === "Literal") {
            return prop.value.value;
          }
        });
      }
    }
  }
  return values;
}

async function signDetachedJwt(payload, privateJwkJson, alg = "RS256") {
  const privateJwk = JSON.parse(privateJwkJson);
  const key = await importJWK(privateJwk, alg);

  const header = {
    kid: privateJwk.kid,
    alg,
    typ: "JWT",
    b64: false,
    crit: ["b64"],
  };

  const payloadBuffer = Buffer.from(JSON.stringify(payload), "utf8");
  const encodedHeader = base64urlEncode(JSON.stringify(header));
  const sign = new CompactSign(payloadBuffer).setProtectedHeader(header);
  const jwsFull = await sign.sign(key);

  const [, , signature] = jwsFull.split(".");
  return `${encodedHeader}..${signature}`;
}

async function buildImport(node, version, sign, signerKey) {
  return {
    meta: {
      amVersion: null,
      exportDate: new Date().toISOString(),
      origin: null,
      exportedBy: null,
      resourceVersion: "1.0",
      nodeVersion: version,
      signature: sign ? await signDetachedJwt(node, signerKey) : null,
    },
    nodeTypes: { [node._id]: node },
  };
}

/**
 * Bundles a single package.
 */
async function bundlePackage(pkgName) {
  const pkgPath = path.join(PACKAGES_DIR, pkgName);
  const srcFile = path.join(pkgPath, "src", `${pkgName}.ts`);
  const configFile = path.join(pkgPath, "node-config.json");
  const packageFile = path.join(pkgPath, "package.json");
  const pkg = JSON.parse(fs.readFileSync(packageFile, "utf8"));

  const outDir = path.join(PACKAGES_DIR, pkgName, DIST_DIR);
  prepareOutDir(outDir);
  const outFile = path.join(outDir, `${pkgName}.${pkg.version}.json`);

  console.log(`Bundling node: ${pkgName}`);
  console.log(` Output: ${outFile}`);

  // const result = await esbuild.build({
  //   entryPoints: [srcFile],
  //   bundle: true,
  //   platform: "node",
  //   format: "cjs",
  //   target: ["ES5"],
  //   write: false,
  // });

  // Step 1: Bundle with esbuild (modern JS)
  const result = await esbuild.build({
    entryPoints: [srcFile],
    bundle: true,
    target: "es2017", // modern target for esbuild
    format: "cjs", // CommonJS
    platform: "neutral",
    write: false,
  });

  let script = result.outputFiles[0].text;

  // Step 2: Transpile to ES5 using Babel
  const babelResult = await transformAsync(script, {
    presets: [
      [
        "@babel/preset-env",
        {
          targets: {
            ie: "11", // ES5-compatible target (works in Rhino)
          },
          modules: "commonjs", // convert ES modules to CommonJS
        },
      ],
    ],
    sourceType: "script",
  });

  script = babelResult?.code ?? script; // use transformed code

  // console.log(script);

  const nodeOutcomes = getNodeOutcomes(script, NODE_OUTCOMES_VAR);
  if (!nodeOutcomes) {
    throw new Error(
      `No node outcomes declaration in script: expecting ${NODE_OUTCOMES_VAR}`,
    );
  }

  let node = JSON.parse(fs.readFileSync(configFile, "utf8"));
  node.script = script;
  node.tags.push(`version_${pkg.version.replaceAll(/\./g, "_")}`);
  node.outcomes = nodeOutcomes;
  const signerJwk = process.env.SIGNER_KEY;
  const sign = process.env.SIGN === "true";
  const importJson = await buildImport(node, pkg.version, sign, signerJwk);
  fs.writeFileSync(outFile, JSON.stringify(importJson, null, 2), "utf8");
}

/**
 * Main script logic.
 */
async function main() {
  const arg = process.argv[2];

  if (arg) {
    // Single package mode
    await bundlePackage(arg);
  } else {
    // Build all packages under /packages
    const allPackages = fs
      .readdirSync(PACKAGES_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory() && d.name !== "dist")
      .map((d) => d.name);

    for (const pkgName of allPackages) {
      await bundlePackage(pkgName);
    }
  }
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
