import { execSync } from "child_process";

const packageName = process.argv[2];
if (!packageName) {
  console.error("Usage: deploy <name>");
  process.exit(1);
}

try {
  execSync(`node scripts/bundle.js ${packageName}`, { stdio: "inherit" });
  execSync(`node scripts/push.js ${packageName}`, { stdio: "inherit" });
} catch (err) {
  console.error("Deployment failed:", err.message);
  process.exit(1);
}
