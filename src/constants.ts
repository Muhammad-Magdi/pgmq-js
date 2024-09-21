import { PgmqConfig } from 'src/types';

export const DEFAULT_MAX_POOL_SIZE = 20;
export const DEFAULT_IDLE_TIMEOUT_MILLIS = 1000;
export const DEFAULT_CONNECTION_TIMEOUT_MILLIS = 1000;
export const DEFAULT_MAX_USES = 7500;
export const DEFAULT_SSL = true;

export const defaultPgmqConfig: PgmqConfig = {
  skipExtensionCreation: false,
};
