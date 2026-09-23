import * as path from 'path';

export function resolvePlaywrightOutputDir(): string {
  return process.env.PLAYWRIGHT_OUTPUT_DIR || path.join(process.cwd(), 'test-results');
}
