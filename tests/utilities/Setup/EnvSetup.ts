import { resolveEnvironmentUrls } from '../URLs/environmentBaseUrl.resolver';

class EnvSetup {
  getEnvURL(): string {
    return resolveEnvironmentUrls(process.env.ENV).UI;
  }

  getAuthCredentials(): { email: string; password: string } {
    return {
      email: this.getRequiredVariable('AUTH_EMAIL'),
      password: this.getRequiredVariable('AUTH_PASSWORD')
    };
  }

  private getRequiredVariable(name: string): string {
    const value = process.env[name];

    if (!value) {
      throw new Error(`Missing required environment variable: ${name}`);
    }

    return value;
  }
}

export default new EnvSetup();
