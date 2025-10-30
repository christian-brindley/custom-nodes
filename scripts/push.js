import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import qs from "qs";
import "dotenv/config";
import jose from "node-jose";
import fs from "fs";
import path from "path";

const JWT_VALIDITY_SECONDS = 180;

async function getToken(tenantUrl, clientConfig) {
  const tokenEndpoint = `${tenantUrl}/am/oauth2/access_token`;
  try {
    const payload = {
      iss: clientConfig.jwtIssuer,
      sub: clientConfig.jwtIssuer,
      aud: tokenEndpoint,
      jti: uuidv4(),
      exp: Math.floor(new Date().getTime() / 1000) + JWT_VALIDITY_SECONDS,
    };

    const key = await jose.JWK.asKey(JSON.parse(clientConfig.privateKey));

    const jwt = await jose.JWS.createSign(
      { alg: "RS256", compact: true, fields: {} },
      { key, reference: false }
    )
      .update(JSON.stringify(payload))
      .final();

    const formData = {
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      client_id: clientConfig.clientId,
      scope: clientConfig.scope,
      assertion: jwt,
    };

    const request = {
      method: "post",
      url: tokenEndpoint,
      data: qs.stringify(formData),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    const response = await axios(request);

    return response.data.access_token;
  } catch (err) {
    console.error(`Exception processing request to ${tokenEndpoint}: ${err}`);
    process.exit(1);
  }
}

async function pushNodeConfig(tenantUrl, nodeConfig, accessToken) {
  const endpoint = `${tenantUrl}/am/json/node-designer/node-type/${nodeConfig._id}`;

  const existingNode = await axios({
    method: "get",
    url: endpoint,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  }).catch(function (error) {
    return null;
  });

  const response = await axios({
    method: "put",
    url: endpoint,
    headers: {
      authorization: `Bearer ${accessToken}`,
      [existingNode ? "if-match" : "if-none-match"]: "*",
      "accept-api-version": "protocol=2.0,resource=1.0",
    },
    data: nodeConfig,
  }).catch(function (error) {
    console.error("Error pushing node:", error);
    process.exit(1);
  });
}

const packageName = process.argv[2];
if (!packageName) {
  console.error("Usage: push <name>");
  process.exit(1);
}

const distDir = `packages/${packageName}/dist`;

if (!fs.existsSync(distDir)) {
  console.error(`No distribution directory ${distDir}`);
  process.exit(1);
}

const bundleFiles = fs
  .readdirSync(distDir)
  .filter((file) => path.extname(file).toLowerCase() === ".json")
  .map((file) => path.join(distDir, file));

if (bundleFiles.length === 0) {
  console.error(`No bundle file in ${distDir}`);
  process.exit(1);
}

if (bundleFiles.length > 1) {
  console.error(`Multiple bundle files in ${distDir}`);
  process.exit(1);
}

const bundle = JSON.parse(fs.readFileSync(bundleFiles[0], "utf8"));

const nodeConfig = Object.values(bundle.nodeTypes)[0];

const clientConfig = {
  clientId: process.env.SERVICE_ACCOUNT_CLIENT_ID,
  jwtIssuer: process.env.SERVICE_ACCOUNT_ID,
  privateKey: process.env.SERVICE_ACCOUNT_KEY,
  scope: process.env.SERVICE_ACCOUNT_SCOPE,
};

const tenantUrl = process.env.TENANT_BASE_URL;

console.log("Getting access token");
const accessToken = await getToken(tenantUrl, clientConfig);

console.log("Pushing", packageName);
pushNodeConfig(tenantUrl, nodeConfig, accessToken);
