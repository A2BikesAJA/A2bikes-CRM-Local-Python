/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISABLE_PERSISTENCE?: string;
  readonly VITE_GA4_ID?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.glb" {
  const src: string;
  export default src;
}
