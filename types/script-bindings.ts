// --------------------------
// Logger
// --------------------------
type LoggerMethod = (msg: string) => void;
type Logger = Record<
  "trace" | "debug" | "info" | "warn" | "error",
  LoggerMethod
>;
declare const logger: Logger;

// --------------------------
// Actions
// --------------------------

interface ActionWrapper {
  putSessionProperty(name: string, value: string): ActionWrapper;
  removeSessionProperty(name: string): ActionWrapper;
  withMaxSessionTime(minutes: number): ActionWrapper;
  withMaxIdleTime(minutes: number): ActionWrapper;
  withLockoutMessage(message: string): ActionWrapper;
  withDescription(description: string): ActionWrapper;
  suspend(
    message: string,
    handler: () => void,
    maximumSuspendDuration: number,
  ): ActionWrapper;
  withErrorMessage(message: string): ActionWrapper;
  withHeader(header: string): ActionWrapper;
  withIdentifiedAgent(agentName: string): ActionWrapper;
  withIdentifiedUser(username: string): ActionWrapper;
  withStage(stage: string): ActionWrapper;
}

declare const action: {
  goTo: (outcome: string) => ActionWrapper;
};

declare namespace java.lang {
  class Double {}
  class Boolean {}
  class Integer {}
  class String {}
}

declare namespace java.util {
  class List<T = any> {}
  class Map<K = any, V = any> {}
}

// Allowed classes
type JavaClass =
  | typeof java.lang.Double
  | typeof java.lang.Boolean
  | typeof java.lang.Integer
  | typeof java.lang.String
  | typeof java.util.List
  | typeof java.util.Map;

// Map Java classes to TypeScript types
type JavaToTs<T> = T extends typeof java.lang.Double
  ? number
  : T extends typeof java.lang.Boolean
    ? boolean
    : T extends typeof java.lang.Integer
      ? number
      : T extends typeof java.lang.String
        ? string
        : T extends typeof java.util.List
          ? any[]
          : T extends typeof java.util.Map
            ? Record<any, any>
            : never;

declare const systemEnv: {
  // string-only usage
  getProperty(propertyName: string, defaultValue?: string): string | null;

  // typed usage
  getProperty<T extends JavaClass>(
    propertyName: string,
    defaultValue: JavaToTs<T> | null,
    type: T,
  ): JavaToTs<T> | null;
};

// --------------------------
// Enums & Algorithm Types
// --------------------------

type MessageLevel = 0 | 1 | 2;

type OptionType = -1 | 0 | 1 | 2;

type HttpMethod =
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE"
  | "PATCH";

declare namespace Algorithms {
  type KeyGen = "AES" | "RSA" | "HMAC";
  type Encryption = "AES" | "RSA";
  type Signing = "RSA" | "ECDSA" | "HMAC";
  type Hash = "SHA-1" | "SHA-256" | "SHA-384" | "SHA-512";
}

// --------------------------
// Callback Builders
// --------------------------
type Policies = any;

interface StringAttributeInputCallbackBuilder {
  (
    name: string,
    prompt: string,
    value: string,
    required: boolean,
    failedPolicies?: string[],
  ): void;

  (
    name: string,
    prompt: string,
    value: string,
    required: boolean,
    policies: any,
    validateOnly: boolean,
    failedPolicies?: string[],
  ): void;
}

interface BooleanAttributeInputCallbackBuilder {
  (
    name: string,
    prompt: string,
    value: boolean,
    required: boolean,
    failedPolicies?: string[],
  ): void;

  (
    name: string,
    prompt: string,
    value: boolean,
    required: boolean,
    policies: any,
    validateOnly: boolean,
    failedPolicies?: string[],
  ): void;
}

interface NumberAttributeInputCallbackBuilder {
  (
    name: string,
    prompt: string,
    value: number,
    required: boolean,
    failedPolicies?: string[],
  ): void;

  (
    name: string,
    prompt: string,
    value: number,
    required: boolean,
    policies: any,
    validateOnly: boolean,
    failedPolicies?: string[],
  ): void;
}

// Confirmation callback
interface ConfirmationCallbackBuilder {
  (
    messageLevel: MessageLevel,
    optionType: OptionType,
    defaultOption: number,
  ): void;

  (messageLevel: MessageLevel, options: string[], defaultOption: number): void;

  (
    prompt: string,
    messageLevel: MessageLevel,
    optionType: OptionType,
    defaultOption: number,
  ): void;

  (
    prompt: string,
    messageLevel: MessageLevel,
    options: string[],
    defaultOption: number,
  ): void;
}

// IDP callback
type IdpCallbackBuilder = (
  provider: string,
  clientId: string,
  redirectUri: string,
  scope: string[],
  nonce: string,
  request: string,
  requestUri: string,
  acrValues: string[],
  requestNativeAppForUserInfo: boolean,
  token?: string,
  tokenType?: string,
) => void;

// Validated username/password
type ValidatedPasswordCallbackBuilder = (
  prompt: string,
  echoOn: boolean,
  policies: Policies,
  validateOnly: boolean,
  failedPolicies?: string[],
) => void;

type ValidatedUsernameCallbackBuilder = (
  prompt: string,
  policies: Policies,
  validateOnly: boolean,
  failedPolicies?: string[],
) => void;

// General HTTP callback
type HttpCallbackBuilder = (
  authorizationHeader: string,
  negotiationHeaderOrName?: string,
  negotiationValueOrError?: string | number,
  errorCode?: number,
) => void;

// Other simple callbacks
type X509CertificateCallbackBuilder = (
  prompt: string,
  certificate?: any,
  requestSignature?: boolean,
) => void;
type ConsentMappingCallbackBuilder = (
  configOrName: any | string,
  messageOrDisplayName: string,
  isRequired?: boolean,
  displayName?: string,
  icon?: string,
  accessLevel?: string,
  titles?: string[],
) => void;

// --------------------------
// Callbacks Builder
// --------------------------
declare const callbacksBuilder: {
  textInputCallback: (prompt: string, defaultText?: string) => void;
  textOutputCallback: (messageLevel: 0 | 1 | 2, message: string) => void;
  stringAttributeInputCallback: StringAttributeInputCallbackBuilder;
  numberAttributeInputCallback: NumberAttributeInputCallbackBuilder;
  booleanAttributeInputCallback: BooleanAttributeInputCallbackBuilder;
  confirmationCallback: ConfirmationCallbackBuilder;
  idpCallback: IdpCallbackBuilder;
  validatedPasswordCallback: ValidatedPasswordCallbackBuilder;
  validatedUsernameCallback: ValidatedUsernameCallbackBuilder;
  httpCallback: HttpCallbackBuilder;
  x509CertificateCallback: X509CertificateCallbackBuilder;
  consentMappingCallback: ConsentMappingCallbackBuilder;
  metadataCallback: (metadata: any) => void;
  hiddenValueCallback: (id: string, value: string) => void;
  choiceCallback: (
    prompt: string,
    choices: string[],
    defaultChoice: number,
    multipleSelectionsAllowed: boolean,
  ) => void;
  nameCallback: (prompt: string, defaultName?: string) => void;
  passwordCallback: (prompt: string, echoOn: boolean) => void;
  scriptTextOutputCallback: (message: string) => void;
  redirectCallback: (
    redirectUrl: string,
    redirectData: any,
    method: string,
  ) => void;
  languageCallback: (language: string, country: string) => void;
  pollingWaitCallback: (waitTime: string, message: string) => void;
  deviceProfileCallback: (
    metadata: boolean,
    location: boolean,
    message: string,
  ) => void;
  kbaCreateCallback: (
    prompt: string,
    predefinedQuestions: string[],
    allowUserDefinedQuestions: true,
  ) => void;
  selectIdpCallback: (providers: any) => void;
  termsAndConditionsCallback: (
    version: string,
    terms: string,
    createDate: string,
  ) => void;
};

// --------------------------
// OpenIDM API
// --------------------------
type EmailParameters = {
  from: string;
  to: string;
  subject: string;
  type?: string;
  body: string;
};

type EmailTemplateParameters = {
  template: string;
  to: string;
  cc: string;
  bcc: string;
  emailValues?: any;
};

type EmailActions = {
  send: EmailParameters;
  sendTemplate: EmailTemplateParameters;
};

declare const openidm: {
  create: (
    resourceName: string,
    newResourceId: string | null,
    content: any,
    params?: any,
    fields?: string[],
  ) => any;

  read: (resourcePath: string, params?: any, fields?: any) => any;

  update: (
    resourcePath: string,
    rev: string | null,
    value: any,
    params?: any,
    fields?: string[],
  ) => any;

  delete: (
    resourcePath: string,
    rev: string | null,
    params?: any,
    fields?: string[],
  ) => any;

  patch: (
    resourcePath: string,
    rev: string | null,
    patches: any[],
    params?: any,
    fields?: string[],
  ) => any;

  action<A extends keyof EmailActions>(
    resourcePath: "external/email",
    action: A,
    params: EmailActions[A],
  ): void;

  action(
    resourcePath: string,
    action: string,
    content: any,
    params?: any,
    fields?: string[],
  ): void;

  query: (resourcePath: string, params: any, fields?: string[]) => any;
};

// --------------------------
// Secrets
// --------------------------
type SecretString = string & {
  getAsBytes(): Uint8Array;
  getAsUtf8(): string;
};

declare const secrets: {
  getGenericSecret: (secretLabel: string) => SecretString;
};

// --------------------------
// Utilities
// --------------------------
declare const utils: {
  base64: {
    encode(input: string | Uint8Array): string;
    decode(input: string): string;
    decodeToBytes(input: string): Uint8Array;
  };
  base64url: { encode(input: string): string; decode(input: string): string };
  crypto: {
    randomUUID(): string;
    getRandomValues(input: number[]): number[];
    subtle: {
      generateKey(
        algorithm:
          | Algorithms.KeyGen
          | {
              name: Algorithms.KeyGen;
              length?: number;
              modulusLength?: number;
              hash?: Algorithms.Hash;
            },
      ): any;
      encrypt(
        algorithm: Algorithms.Encryption,
        key: Uint8Array,
        data: Uint8Array,
      ): Uint8Array;
      decrypt(
        algorithm: Algorithms.Encryption,
        key: Uint8Array,
        data: Uint8Array,
      ): Uint8Array;
      digest(algorithm: Algorithms.Hash, data: Uint8Array): string;
      sign(
        algorithm:
          | Algorithms.Signing
          | { name: Algorithms.Signing; hash?: Algorithms.Hash },
        key: Uint8Array,
        data: Uint8Array,
      ): Uint8Array;
      verify(
        algorithm:
          | Algorithms.Signing
          | { name: Algorithms.Signing; hash?: Algorithms.Hash },
        key: Uint8Array,
        data: Uint8Array,
        signature: Uint8Array,
      ): boolean;
    };
  };
  types: {
    bytesToString(input: Uint8Array): string;
    stringToBytes(input: string): Uint8Array;
  };
  journey: {
    name(): string;
    identityResource(): string;
    innerJourney(): boolean;
    mustRun(): boolean;
  };
};

type Identity = {
  getAttributeValues(): string[];
  setAttribute(attributeName: string, value: string[]): void;
  addAttribute(attributeName: string, value: string): void;
  store(): void;
};

// --------------------------
// Node State / Properties / Session
// --------------------------
declare const nodeState: {
  remove: (property: string) => void;
  get: (property: string) => any;
  getObject: (property: string) => any;
  putShared: (property: string, value: any) => void;
  mergeShared: (value: any) => void;
  mergeTransient: (value: any) => void;
  putTransient: (property: string, value: any) => void;
};

declare const properties: any;
declare const callbacks: {
  isEmpty(): boolean;
  getStringAttributeInputCallbacks(): any;
  getMetadataCallbacks(): any;
  getTextInputCallbacks(): any;
  getHiddenValueCallbacks(): any;
};
declare const idRepository: { getIdentity(userId: string): Identity };
declare const existingSession: { get(sessionProperty: string): any };
declare const requestHeaders: { get(headerName: string): any };
declare const requestParameters: { get(parameterName: string): any };
declare const realm: string;
declare const cookieName: string;
declare const scriptName: string;

// --------------------------
// Policy types
// --------------------------
type PolicySubject =
  | { ssoToken: string; jwt?: never; claims?: never }
  | { jwt: any; ssoToken?: never; claims?: never }
  | { claims: any; ssoToken?: never; jwt?: never };

type PolicyActions = Record<
  "POST" | "PATCH" | "GET" | "DELETE" | "OPTIONS" | "HEAD" | "PUT",
  boolean
>;

type PolicyEvaluation = {
  resource: string;
  actions: PolicyActions;
  attributes: any;
  advices: any;
};

declare const policy: {
  evaluate(
    subject: PolicySubject,
    application: string,
    resources: string[],
    environment: any,
  ): PolicyEvaluation;
};

declare var auditEntryDetails: any;

type OauthRequestProperties = {
  requestHeaders: any;
  requestParams: any;
  realm: string;
  requestUri: string;
};

type OauthClientProperties = {
  clientProperties: any;
};

declare const oauthApplication: {
  getApplicationId(): string;
  getRequestProperties(): OauthRequestProperties;
  getClientProperties(): OauthClientProperties;
};

declare const resumedFromSuspend: boolean;

declare const samlApplication: {
  getApplicationId(): string;
  getFlowInitiator(): string;
  getAuthnRequest(): any;
  getIdpAttributes(): any;
  getSpAttributes(): any;
};

type HttpRequestOptions = {
  method?: HttpMethod;
  headers?: any;
  form?: any;
  clientName?: string;
  token?: string;
  body?: any;
};

type HttpResponseHandle = {
  get(): HttpResponse;
};

type HttpResponse = {
  json(): any;
  formData(): any;
  text(): string;
  headers: string;
  ok: boolean;
  status: number;
  statusText: number;
};

declare const httpClient: {
  send(uri: string, requestOptions: HttpRequestOptions): HttpResponseHandle;
};

type CacheManager = {
  get(properties: any): any;
};
declare const cacheManager: {
  exists(name: string): boolean;
  named(name: string): CacheManager;
};

type JwtType = "SIGNED" | "SIGNED_THEN_ENCRYPTED" | "ENCRYPTED_THEN_SIGNED";
type JwtData = {
  jwtType: JwtType;
  jwt: any;
  issuer?: string;
  audience?: string;
  subject?: string;
  type?: JwtType;
  claims?: any;
  stableId?: string;
  accountId?: string;
  signingKey?: string;
  encryptionKey?: string;
};
declare const jwtValidator: {
  validateJwtClaims(jwtData: JwtData): any;
};
