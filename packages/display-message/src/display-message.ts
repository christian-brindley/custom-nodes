import { execNode } from "@imports/common/node-utils";

var nodeOutcomes = {
  COMPLETED: "completed",
};

execNode(() => {
  // Node logic goes here
}, nodeOutcomes.COMPLETED);
