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
    policies: any,
    validateOnly: boolean
  ): void;

  (
    name: string,
    prompt: string,
    value: string,
    required: boolean,
    policies: any,
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
  mergeShared: (value: any) => void;
  mergeTransient: (value: any) => void;
  putTransient: (property: string, value: any) => void;
};

declare const callbacks: {
  isEmpty: () => boolean;
  getStringAttributeInputCallbacks: () => any;
};

declare const idRepository: {
  getIdentity: (userId: string) => any;
};

declare const existingSession: {
  get: (sessionProperty: string) => any;
};

declare const requestHeaders: {
  get: (headerName: string) => any;
};

declare const realm: string;

declare const httpClient: {
  send: (url: string, options: any) => any;
};
