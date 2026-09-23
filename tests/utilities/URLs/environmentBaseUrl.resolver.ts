import { environmentBaseUrl, type EnvironmentName } from './environmentBaseUrl';

export function resolveEnvironmentUrls(env?: string): { UI: string } {
  const normalizedEnv = (env || 'production').trim().toLowerCase() as EnvironmentName;
  return environmentBaseUrl[normalizedEnv] || environmentBaseUrl.production;
}
