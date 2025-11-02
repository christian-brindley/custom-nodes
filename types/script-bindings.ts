declare const logger: {
  error: (msg: string) => void;
  debug: (msg: string) => void;
};

declare const action: {
  goTo: (outcome: string) => void;
};

interface StringAttributeInputCallbackBuilder {
  (name: string, prompt: string, value: string, required: boolean): void;

  (
    name: string,
    prompt: string,
    value: string,
    required: boolean,
    failedPolicies: string[]
  ): void;

  (
    name: string,
    prompt: string,
    value: string,
    required: boolean,
    polcies: any,
    validateOnly: boolean
  ): void;

  (
    name: string,
    prompt: string,
    value: string,
    required: boolean,
    polcies: any,
    validateOnly: boolean,
    failedPolicies: string[]
  ): void;
}

declare const callbacksBuilder: {
  textOutputCallback: (level: number, message: string) => void;
  stringAttributeInputCallback: StringAttributeInputCallbackBuilder;
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

declare const idRepository: {
  getIdentity: (userId: string) => any;
};
