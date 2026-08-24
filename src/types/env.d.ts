interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  readonly VITE_BASE_URL: string;
  readonly VITE_ROUTER_HISTORY_MODE: 'hash' | 'history' | 'memory';
  readonly VITE_HTTP_PROXY: 'Y' | 'N';
  readonly VITE_SERVICE_BASE_URL: string;
  readonly VITE_SERVICE_SUCCESS_CODE: string;
  readonly VITE_SERVICE_LOGOUT_CODES: string;
  readonly VITE_SERVICE_MODAL_LOGOUT_CODES: string;
  readonly VITE_SERVICE_EXPIRED_TOKEN_CODES: string;
  readonly VITE_STORAGE_PREFIX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
