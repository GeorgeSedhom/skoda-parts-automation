import type { ConsoleMessage, Page, Request, Response, TestInfo } from '@playwright/test';

type NetworkEntry = {
  type: 'request' | 'response';
  method: string;
  url: string;
  status?: number;
};

type ConsoleEntry = {
  type: string;
  text: string;
  location: string;
};

export class NetworkLogger {
  private networkEntries: NetworkEntry[] = [];
  private consoleEntries: ConsoleEntry[] = [];

  constructor(page: Page) {
    page.on('request', request => this.trackRequest(request));
    page.on('response', response => this.trackResponse(response));
    page.on('console', message => this.trackConsole(message));
  }

  async clear(): Promise<void> {
    this.networkEntries = [];
    this.consoleEntries = [];
  }

  async flushToAllure(testInfo: TestInfo): Promise<void> {
    const report = {
      test: testInfo.title,
      status: testInfo.status,
      network: this.networkEntries,
      console: this.consoleEntries
    };

    await testInfo.attach(`Logs - ${testInfo.title}`, {
      body: Buffer.from(JSON.stringify(report, null, 2)),
      contentType: 'application/json'
    });
  }

  async flushPendingRequests(): Promise<void> {
    return Promise.resolve();
  }

  private trackRequest(request: Request): void {
    if (request.resourceType() !== 'xhr' && request.resourceType() !== 'fetch') {
      return;
    }

    this.networkEntries.push({
      type: 'request',
      method: request.method(),
      url: request.url()
    });
  }

  private trackResponse(response: Response): void {
    const request = response.request();
    if (request.resourceType() !== 'xhr' && request.resourceType() !== 'fetch') {
      return;
    }

    this.networkEntries.push({
      type: 'response',
      method: request.method(),
      url: request.url(),
      status: response.status()
    });
  }

  private trackConsole(message: ConsoleMessage): void {
    const location = message.location();
    this.consoleEntries.push({
      type: message.type(),
      text: message.text(),
      location: `${location.url ?? ''}:${location.lineNumber ?? 0}`
    });
  }
}
