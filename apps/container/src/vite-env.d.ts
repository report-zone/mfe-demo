/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COGNITO_USER_POOL_ID: string;
  readonly VITE_COGNITO_CLIENT_ID: string;
  readonly VITE_AWS_REGION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Type declaration for MFE modules
declare module '@mfe-demo/preferences' {
  import { ComponentType } from 'react';
  const component: ComponentType;
  export default component;
}
