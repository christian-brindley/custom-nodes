import { execNode } from "@imports/common/node-base";

const nodeOutcomes = {
  COMPLETED: "completed",
};

execNode(() => {
  let failedPolicies: string[] = [];
  if (!callbacks.isEmpty()) {
    var inputValue = callbacks.getStringAttributeInputCallbacks().get(0);
    logger.debug("Got input " + inputValue);
    if (properties.transient) {
      nodeState.putTransient(properties.stateProperty, inputValue);
    } else {
      nodeState.putShared(properties.stateProperty, inputValue);
    }

    var regex = properties.regex || "";
    if (regex !== "" && !inputValue.match(regex)) {
      logger.debug("Value did not match regex: " + regex);
      const failedPolicy = {
        policyRequirement: "CHARACTER_SET",
        params: {
          sets: properties.regexDescription,
        },
      };
      failedPolicies.push(JSON.stringify(failedPolicy));
    } else {
      action.goTo(nodeOutcomes.COMPLETED);
      return;
    }
  }

  var errorMessage = nodeState.get("errorMessage");
  if (errorMessage && properties.errorMessage) {
    const failedPolicy = {
      policyRequirement: "CHARACTER_SET",
      params: {
        sets: errorMessage,
      },
    };
    failedPolicies.push(JSON.stringify(failedPolicy));
    nodeState.remove("errorMessage");
  }

  logger.debug("Building callback");
  var currentValue = properties.persist
    ? nodeState.get(properties.stateProperty) || ""
    : "";

  if (
    currentValue === "" &&
    properties.defaultValue &&
    properties.defaultValue !== ""
  ) {
    currentValue = properties.defaultValue;
  }

  logger.debug("Got current value " + currentValue);
  callbacksBuilder.stringAttributeInputCallback(
    properties.stateVariable,
    properties.fieldLabel,
    currentValue,
    false,
    failedPolicies
  );
}, nodeOutcomes.COMPLETED);
