export function execNode(handlerFunction: () => void, errorOutcome: string) {
  try {
    handlerFunction();
  } catch (e) {
    logger.error("Exception: " + e);
    logger.debug("Stack trace " + (e as Error).stack);
    action.goTo(errorOutcome);
  }
}
