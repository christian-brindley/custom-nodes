# custom-nodes

Helper tools for building and distributing Ping AM custom nodes.

## Introduction

This repository includes tools for developing and distributing custom nodes for Ping AM v8+ and PingOne Advanced Identity Cloud. Refer to the [Ping documentation](https://docs.pingidentity.com/pingoneaic/latest/journeys/node-designer.html) for further details on custom nodes.

## Building a node

### Step 1: Clone the repo and install dependencies

```
git clone https://github.com/christian-brindley/custom-nodes
cd custom-nodes
npm i
```

### Step 2: create a starter node called `display-message`

```
git checkout -b display-message-node
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

This node will display a message via a text callback. The node will allow configuration with

- Fixed message text
- Message level: Info, Warning or Error.

Update `node-config.json` with the basic configuration. Update the following properties.

- `displayName`
- `description`
- `properties`

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

var nodeOutcomes = {
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

- Build and deploy directly into the Ping environment via REST

#### Importing manually

```
npm run build display-message
```

This creates an import file `packages/display-message/dist/display-message.1.0.0.json` which you can import via the admin console. Note that in order to update the node, you need to remove it before re-importing.

#### Deploying directly via REST (PingOne AIC only)

First, configure your environment details

```
cp .env.sample .env
```

Edit `.env` with your Ping environment URL and service account credentials.

Now build and push the node in one step

```
npm run deploy display-message
```
