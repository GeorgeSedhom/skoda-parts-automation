export type EnvironmentName = 'production';

export const environmentBaseUrl: Record<EnvironmentName, { UI: string }> = {
  production: {
    UI: process.env.BASE_URL || 'https://www.skoda-parts.com'
  }
};
