/// <reference types="vite/client" />

// Tells TypeScript which custom env variables exist, so a typo becomes a compile error.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
