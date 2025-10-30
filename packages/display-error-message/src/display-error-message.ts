import { execNode } from "@imports/common/node-utils";
import { MESSAGE_LEVEL } from "@imports/common/constants";

var nodeOutcomes = {
  COMPLETED: "completed",
};

execNode(() => {
  const errorMessage = nodeState.get("errorMessage");
  if (errorMessage && errorMessage.length > 0 && callbacks.isEmpty()) {
    if (properties.clearError) {
      nodeState.remove("errorMessage");
    }
    callbacksBuilder.textOutputCallback(MESSAGE_LEVEL.ERROR, errorMessage);
    return;
  }
  action.goTo(nodeOutcomes.COMPLETED);
}, nodeOutcomes.COMPLETED);
