# custom-nodes

Helper tools for building and distributing Ping AM custom nodes.

## Introduction

This repository includes tools for developing and distributing custom nodes for Ping AM v8+ and PingOne Advanced Identity Cloud. Refer to the [Ping documentation](https://docs.pingidentity.com/pingoneaic/latest/journeys/node-designer.html) for further details on custom nodes.

## Building an example node

Build an example node which displays a message via a text output callback - i.e. a form field on a journey page. The node is configured with:

- The fixed message text to display
- The message level: Info, Warning or Error.

### Step 1: Clone the repo and install dependencies

```
git clone https://github.com/christian-brindley/custom-nodes
cd custom-nodes
npm i
```

### Step 2: Create a node

Create a new node `display-message`:

```
git checkout -b node-display-message
npm run create display-message
```

This creates the following directory structure

```
packages
└── display-message
    ├── node-config.json
    ├── package.json
    ├── src
    │   └── display-message.ts
    └── tsconfig.json
```

### Step 3: Configure the node

Update `node-config.json` with the basic configuration. Update the following properties:

- `displayName` - The name shown in the journey designer
- `description` - A description for the node
- `properties` - The node's configurable properties

Leave all other properties as their defaults.

Example `node-config.json`:

```
{
  "_id": "displaymessage-1",
  "displayName": "Display Message",
  "description": "Display a message in a form field",
  "errorOutcome": false,
  "inputs": [],
  "outcomes": [],
  "outputs": [],
  "properties": {
    "message": {
      "description": "Message to display",
      "multivalued": false,
      "required": true,
      "title": "Message",
      "type": "String"
    },
    "level": {
      "title": "Level",
      "description": "Message level",
      "type": "STRING",
      "required": true,
      "options": {
        "INFO": "INFO",
        "WARNING": "WARNING",
        "ERROR": "ERROR"
      },
      "multivalued": false,
      "defaultValue": "INFO"
    }
  },
  "serviceName": "displaymessage",
  "tags": []
}
```

### Step 4: Add the node logic

Update `display-message.ts` with the node logic - e.g.

```
import { execNode } from "@imports/common/node-base";
import { MESSAGE_LEVEL } from "@imports/common/constants";

const nodeOutcomes = {
  COMPLETED: "completed",
};

execNode(() => {
  if (callbacks.isEmpty()) {
    callbacksBuilder.textOutputCallback(
      MESSAGE_LEVEL[properties.level as keyof typeof MESSAGE_LEVEL],
      properties.message
    );
    return;
  }
  action.goTo(nodeOutcomes.COMPLETED);
}, nodeOutcomes.COMPLETED);
```

### Step 5: Build and deploy

There are two ways you can deploy the node into your Ping environment

- Build a JSON import file and import manually via the Ping admin console

- Push the node directly into the Ping environment via REST

#### Importing manually

```
npm run build display-message
```

This creates an import file `packages/display-message/dist/display-message.1.0.0.json` which you can import via the admin console. Note that in order to update the node, you need to remove it before re-importing.

#### Pushing directly via REST (PingOne AIC only)

First, configure your environment details

```
cp .env.sample .env
```

Edit `.env` with your Ping environment URL and service account credentials - i.e.

- TENANT_BASE_URL
- SERVICE_ACCOUNT_ID
- SERVICE_ACCOUNT_CLIENT_ID
- SERVICE_ACCOUNT_SCOPE
- SERVICE_ACCOUNT_KEY

Now deploy the node into your environment

```
npm run deploy display-message
```

This will build the JSON import file as before, then push the node config via REST. The node may be modified and pushed again with the same command to update the installed version.

## Build processing

When building the node using `npm run build` or `npm run deploy`, the node configuration is processed as follows:

### outcomes

The `outcomes` property of the node is updated to match the `nodeOutcomes` declaration in the node script. If there is no `nodeOutcomes` declaration, the build throws an error.

### tags

A tag is added to the node configuration, with the version number from the `package.json` file in the package directory. Dots are replaced with underscores - e.g. if `package.json` includes `"version": "1.0.0"` then the builder will add tag `version_1_0_0`.

### nodeVersion

The property `nodeVersion` is added to the metadata in the JSON import file, with the version from `package.json`.

### signature

If the `SIGN` property in the `.env` file is set to `true`, the property `signature` is added to the metadata in the JSON import file: the value of this property is an RFC 7797 detached JWT. The signature is applied to the node object within the JSON import - i.e. the object under `nodeTypes["displaymessage-1"]` in the example node.

To perform signatures, the `SIGNER_KEY` property in the `.env` file must be set to a private key JWK.

### script

The node script is converted from TypeScript simple JavaScript, with all imports expanded in line with the script.
