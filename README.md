# Skoda Parts Test Automation

Playwright and TypeScript UI automation project for [skoda-parts.com](https://www.skoda-parts.com/). The project follows the structure and lifecycle conventions of the existing `Test Automation` framework while remaining an independent project.

## Purpose

The suite validates the main customer journeys of the public Skoda Parts website:

- Account registration form validation.
- Invalid and successful sign-in behavior.
- Store homepage and model navigation.
- Product search and no-result handling.
- Product details, shopping cart, and checkout entry.

Tests intentionally stop before final order placement because the target is a public production website.

## Assignment Requirements

This README directly covers every requested delivery item:

| Requirement | Where it is documented |
| --- | --- |
| Setup instructions | [Setup Instructions](#setup-instructions) |
| How to execute the tests | [Executing Tests from the Terminal](#executing-tests-from-the-terminal) |
| Architectural decisions and rationale | [Architectural Decisions and Rationale](#architectural-decisions-and-rationale) |
| Test suite executable from the terminal | All supported commands are standard `npm`/Playwright terminal commands and do not require an IDE. |

## Technology

- TypeScript
- Playwright Test
- Page Object Model
- `POManager` for centralized page-object creation
- JSON-based test data
- Environment-based credentials and URLs
- HTML and list reporters
- Per-test network and browser-console attachments

## Project Structure

```text
skoda-parts-automation/
|-- configs/
|   `-- playwright-output-dir.ts
|-- docs/
|   `-- automation-ideas.md
|-- tests/
|   |-- test-data/
|   |   |-- JsonDataReader.ts
|   |   `-- searchData.json
|   |-- ui/
|   |   |-- fixtures/
|   |   |   |-- BaseTest.ts
|   |   |   `-- BrowserManager.ts
|   |   |-- pages/
|   |   |   |-- POManager.ts
|   |   |   `-- SkodaParts/
|   |   |       |-- AccountPage.ts
|   |   |       |-- BasePage.ts
|   |   |       |-- CartPage.ts
|   |   |       |-- CheckoutPage.ts
|   |   |       |-- HomePage.ts
|   |   |       |-- ProductDetailsPage.ts
|   |   |       `-- SearchResultsPage.ts
|   |   `-- specs/
|   |       `-- SkodaPartsTests/
|   |           |-- Authentication.spec.ts
|   |           |-- Checkout.spec.ts
|   |           `-- Search.spec.ts
|   `-- utilities/
|       |-- Setup/
|       |   `-- EnvSetup.ts
|       |-- URLs/
|       |   |-- environmentBaseUrl.resolver.ts
|       |   `-- environmentBaseUrl.ts
|       |-- Helpers.ts
|       `-- networkLogger.ts
|-- .env.example
|-- package.json
|-- playwright.config.ts
`-- tsconfig.json
```

The project-level VS Code setting disables compact folders, so nested directories are displayed as a hierarchy.

## Architectural Decisions and Rationale

| Decision | Rationale |
| --- | --- |
| Playwright with TypeScript | Provides reliable browser automation, auto-waiting, trace support, typed page objects, and first-class test-runner capabilities. |
| Page Object Model | Keeps selectors, actions, assertions, and workflow details out of specs, reducing duplication and making UI changes easier to maintain. |
| Central `POManager` | Gives every suite one consistent entry point for lazily created page objects and shared utilities. |
| Shared `BrowserManager` lifecycle | Matches the reference Test Automation project and centralizes context creation, `baseURL`, permissions, and teardown. |
| Serial execution within each spec | Required because a spec shares one browser page and initialized page objects from `beforeAll`. It also keeps stateful production-site workflows deterministic. |
| Lifecycle hooks in every spec | `beforeAll`, `beforeEach`, `afterEach`, and `afterAll` provide consistent initialization, logging, reporting, and cleanup. |
| Assertions inside page classes | Keeps specs focused on business intent and allows assertion logic to be reused with the associated UI behavior. |
| JSON test data and environment credentials | Separates reusable non-sensitive data from secrets and prevents account credentials from being committed to source control. |
| Feature-based spec files and npm scripts | Provides clear ownership and deterministic CI selection after severity tags were removed. |
| Network and console attachments | Gives failures diagnostic evidence without logging request bodies, cookies, passwords, or authorization headers. |
| Production-safe test scope | Registration CAPTCHA is not bypassed and checkout stops before placing an order, avoiding unwanted production side effects. |

### Page objects

Page classes own the implementation details of each scenario:

- Locators
- Navigation
- User actions
- Test-data access
- Assertions
- Cross-page business workflows

Specs therefore remain readable and contain only high-level calls. Example:

```typescript
test('Verify registered user can sign in', async () => {
  await accountPage.verifyRegisteredUserCanSignIn();
});
```

### POManager

`POManager` creates and caches page objects for the active Playwright page. Specs initialize it once in `beforeAll` and retrieve typed page objects such as `AccountPage`, `HomePage`, and `CheckoutPage`.

### BrowserManager

`BrowserManager` owns the browser context and page lifecycle. It:

- Creates the context with the resolved environment `baseURL`.
- Enables the permissions required by the suite.
- Provides the shared page used by a serial spec suite.
- Keeps a reference to `POManager` for teardown support.
- Flushes pending logging work and closes the page and context in `afterAll`.

### Spec lifecycle

Each spec follows the same lifecycle pattern as the reference Test Automation project:

```typescript
test.describe.configure({ mode: 'serial', timeout: 120000 });

test.beforeAll('Open application', async ({ browser }) => {
  // Create BrowserManager, page, POManager, page objects, and NetworkLogger.
});

test.beforeEach('Test setup', async ({}, testInfo) => {
  console.log(`Running ${testInfo.title}`);
  await networkLogger.clear();
});

test.afterEach('Flush network logs', async ({}, testInfo) => {
  await networkLogger.flushToAllure(testInfo);
  console.log(`Finished ${testInfo.title}`);
});

test.afterAll('Close browser', async () => {
  await browserManager.closeBrowserContext();
});
```

Serial mode is required because tests in the same spec share one browser page and the same initialized page objects.

### Network logging

`NetworkLogger` records XHR/fetch request metadata, response status codes, and browser-console messages for each test. `afterEach` attaches the collected data as JSON to the Playwright test result. Request bodies, passwords, cookies, and authorization headers are not recorded.

The method name `flushToAllure` matches the lifecycle naming used by the reference project. In this standalone project, the attachment is created through Playwright's `testInfo.attach`, so it remains available to the configured HTML reporter and can also be consumed if an Allure reporter is added later.

## Setup Instructions

### Configure the environment

Create the local environment file:

```powershell
Copy-Item .env.example .env
```

Configure the following values:

```dotenv
ENV=production
HEADLESS=true
BASE_URL=https://www.skoda-parts.com
SEARCH_KEYWORD=oil filter
AUTH_EMAIL=registered-user@example.com
AUTH_PASSWORD=replace-with-test-password
```

| Variable | Purpose |
| --- | --- |
| `ENV` | Selects the URL configuration. The current supported value is `production`. |
| `HEADLESS` | Runs without a visible browser when `true`. Set to `false` for local debugging. |
| `BASE_URL` | Documents the target application URL. Runtime URL resolution is handled by `EnvSetup`. |
| `SEARCH_KEYWORD` | Optional search-data override reserved for local execution. |
| `AUTH_EMAIL` | Registered account used by the successful sign-in test. |
| `AUTH_PASSWORD` | Password for the registered test account. |

`.env` is ignored by Git and must never be committed. CI credentials should be stored in the CI platform's encrypted secret store and exposed as environment variables at runtime.

### Install dependencies

```bash
npm install
npx playwright install
```

Microsoft Edge must be installed to run the `Edge` project. On the current Windows machine, the bundled Chromium headless executable can be blocked with `spawn EPERM`; the Edge project is therefore used for local verification.

## Executing Tests from the Terminal

The complete suite and every feature suite can be executed from PowerShell, Command Prompt, Bash, or a CI shell. VS Code and the Playwright extension are optional and are not required to run the tests.

Run the complete suite with bundled Chromium:

```bash
npm run skoda
```

Run the complete suite with Microsoft Edge:

```bash
npm run skoda:edge
```

Run a feature suite:

```bash
npm run skoda-search
npm run skoda-search:edge
npm run skoda-checkout
npm run skoda-checkout:edge
npm run skoda-auth
npm run skoda-auth:edge
```

Open the latest HTML report:

```bash
npm run report
```

Start Playwright code generation:

```bash
npm run codegen
```

## Automated Coverage

### Authentication

1. Verify the sign-up form and required-field validation.
2. Verify invalid credentials are rejected with the expected message.
3. Verify the sign-in form displays its email, password, and login controls.
4. Verify a registered user can sign in and see authenticated account navigation.

Successful registration is not submitted automatically because the production form is protected by Google reCAPTCHA. The suite validates the real registration controls without bypassing that protection or creating disposable production accounts.

### Search and navigation

1. Verify the homepage displays the core spare-part navigation.
2. Verify a common part can be searched.
3. Verify model selection opens the relevant catalogue.
4. Verify a no-result search is handled without an application error.

### Product, cart, and checkout

1. Verify product details can be opened from search results.
2. Verify a product can be added to the shopping cart.
3. Verify checkout can be started without placing an order.

The current suite contains 11 automated tests.

## Assertions and Reliability

- Assertions are located in page classes rather than specs.
- Authentication checks use exact account UI elements and the expected post-login URL.
- Search uses the site's stable `#LBautocomplete` field.
- Model navigation uses the header model selector instead of delayed homepage links.
- Homepage navigation retries a maximum of three times when the public site returns an intermittent empty response.
- Screenshots are captured for every test.
- Videos are retained for failures.
- Traces are collected on the first retry.

## Removed Tags and CI/CD Behavior

Early versions of the project used severity markers in test names:

```text
@skoda-sev0
@skoda-sev1
```

They were used with commands similar to:

```bash
playwright test --grep @skoda-sev0
playwright test --grep @skoda-sev1
```

Those tags and their supporting configuration were intentionally removed. The following items no longer exist:

- `@skoda-sev0` and `@skoda-sev1` in test names.
- `sev0:skoda` and `sev1:skoda` package scripts.
- Tag-based `--grep` commands.
- The `grepInvert: /@excluded/` configuration.
- Calls to `setAllureSeverityFromTag` in Skoda specs.

### Why this matters to CI/CD

A pipeline that still uses the old severity scripts or `--grep @skoda-sev...` will select no tests and may fail with `No tests found`. CI/CD must use feature scripts, explicit spec paths, or the complete-suite command instead.

Recommended pipeline selection:

| Pipeline stage | Command | Purpose |
| --- | --- | --- |
| Pull request validation | `npm run skoda-auth:edge` | Fast authentication confidence. |
| Feature validation | `npm run skoda-search:edge` or `npm run skoda-checkout:edge` | Runs the suite related to the changed area. |
| Main branch or nightly | `npm run skoda:edge` | Runs all Skoda Parts tests. |

CI mode is enabled when the runner defines `CI=true`. In CI, Playwright automatically applies the configuration in `playwright.config.ts`:

- `forbidOnly: true` prevents committed `test.only` calls.
- Failed tests are retried twice.
- One worker is used to keep execution deterministic.
- HTML, screenshots, videos, traces, and log attachments can be published as pipeline artifacts.

Example CI execution:

```bash
npm ci
npx playwright install --with-deps
npm run skoda:edge
```

Required secrets:

```text
AUTH_EMAIL
AUTH_PASSWORD
```

Do not restore severity tags unless the team also restores and documents the complete contract: tag naming, pipeline filters, Allure severity mapping, and ownership of each severity level. File-based feature selection is the current supported approach.

## Reports and Artifacts

The following generated directories are ignored by Git:

- `test-results/`
- `playwright-report/`
- `allure-results/`

For a failed test, inspect the HTML report, screenshot, retained video, trace, and the attached network/console JSON. These artifacts should be uploaded by CI even when the test command exits with a failure.

## Maintenance Guidelines

- Keep locators, actions, and assertions inside page classes.
- Keep specs limited to lifecycle hooks and high-level scenario calls.
- Retrieve page objects through `POManager`.
- Keep reusable test data in `tests/test-data` or protected environment variables.
- Do not hard-code credentials in source files.
- Do not bypass reCAPTCHA or place real orders on the production website.
- Add a package script when introducing a new feature spec so CI can run it directly.
- Preserve serial mode while a suite shares one page from `beforeAll`.

See `docs/automation-ideas.md` for additional exploratory findings and future automation opportunities.
