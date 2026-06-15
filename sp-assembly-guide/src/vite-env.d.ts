/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISABLE_PERSISTENCE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.glb" {
  const src: string;
  export default src;
}
