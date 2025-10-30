declare const logger: {
  error: (msg: string) => void;
  debug: (msg: string) => void;
};

declare const action: {
  goTo: (outcome: string) => void;
};

declare const callbacksBuilder: {
  textOutputCallback: (level: number, message: string) => void;
};

declare const properties: any;

declare const nodeState: {
  remove: (property: string) => null;
  get: (property: string) => any;
};

declare const callbacks: {
  isEmpty: () => boolean;
};
