declare const logger: {
  error: (msg: string) => void;
  debug: (msg: string) => void;
};

declare const action: {
  goTo: (outcome: string) => void;
};

declare const callbacksBuilder: {
  textOutputCallback: (level: number, message: string) => void;
  stringAttributeInputCallback: (
    id: string,
    label: string,
    value: string,
    required: boolean,
    failedPolicies: string[]
  ) => void;
};

declare const properties: any;

declare const nodeState: {
  remove: (property: string) => void;
  get: (property: string) => any;
  getObject: (property: string) => any;
  putShared: (property: string, value: any) => void;
  mergeShared: (property: string, value: any) => void;
  mergeTransient: (property: string, value: any) => void;
  putTransient: (property: string, value: any) => void;
};

declare const callbacks: {
  isEmpty: () => boolean;
  getStringAttributeInputCallbacks: () => any;
};
