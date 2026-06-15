/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DISABLE_PERSISTENCE?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
