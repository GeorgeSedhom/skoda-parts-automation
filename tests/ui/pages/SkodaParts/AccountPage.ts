import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';
import EnvSetup from '../../../utilities/Setup/EnvSetup';
import { JsonDataReader } from '../../../test-data/JsonDataReader';

export class AccountPage extends BasePage {
  readonly registrationForm: Locator;
  readonly registrationName: Locator;
  readonly registrationEmail: Locator;
  readonly registrationPassword: Locator;
  readonly registrationPasswordConfirmation: Locator;
  readonly signUpButton: Locator;
  readonly loginForm: Locator;
  readonly openLoginButton: Locator;
  readonly loginEmail: Locator;
  readonly loginPassword: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.registrationForm = page.locator('#regForm');
    this.registrationName = this.registrationForm.locator('input[name="name"]');
    this.registrationEmail = this.registrationForm.locator('input[name="email"]');
    this.registrationPassword = this.registrationForm.locator('input[name="pwd"]');
    this.registrationPasswordConfirmation = this.registrationForm.locator('input[name="pwd_check"]');
    this.signUpButton = this.registrationForm.getByRole('button', { name: 'Sign up' });

    this.loginForm = page.locator('form').filter({
      has: page.locator('input[name="do"][value="login"]')
    }).first();
    this.openLoginButton = page.getByText('User login', { exact: true }).first();
    this.loginEmail = this.loginForm.locator('input[name="email"]');
    this.loginPassword = this.loginForm.locator('input[name="pwd"]');
    this.loginButton = this.loginForm.getByRole('button', { name: 'Login' });
  }

  async gotoSignUp(): Promise<void> {
    await this.page.goto('/sign-up.html', { waitUntil: 'domcontentloaded' });
    await this.acceptCookiesIfPresent();
    await this.assertPageLoaded();
  }

  async gotoLogin(): Promise<void> {
    await this.page.goto('/online-store.html', { waitUntil: 'domcontentloaded' });
    await this.acceptCookiesIfPresent();
    await this.assertPageLoaded();
  }

  async assertSignUpFormVisible(): Promise<void> {
    await expect(this.registrationForm).toBeVisible();
    await expect(this.registrationName).toHaveCount(1);
    await expect(this.registrationEmail).toBeVisible();
    await expect(this.registrationPassword).toBeVisible();
    await expect(this.registrationPasswordConfirmation).toBeVisible();
    await expect(this.signUpButton).toBeVisible();
  }

  async assertRegistrationRequiredFields(): Promise<void> {
    await expect(this.registrationEmail).toHaveAttribute('required', '');
    await expect(this.registrationPassword).toHaveAttribute('required', '');
    await expect(this.registrationPasswordConfirmation).toHaveAttribute('required', '');
  }

  async assertInvalidRegistrationEmailIsRejected(email: string): Promise<void> {
    await this.registrationEmail.fill(email);
    const hasTypeMismatch = await this.registrationEmail.evaluate(
      element => (element as HTMLInputElement).validity.typeMismatch
    );
    expect(hasTypeMismatch).toBe(true);
  }

  async openLoginForm(): Promise<void> {
    await this.gotoLogin();
    await this.openLoginButton.click();
    await expect(this.loginForm).toBeVisible();
  }

  async assertLoginFormVisible(): Promise<void> {
    await expect(this.loginEmail).toBeVisible();
    await expect(this.loginPassword).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.openLoginForm();
    await this.loginEmail.fill(email);
    await this.loginPassword.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  async assertLoginRejected(): Promise<void> {
    await expect(this.page).toHaveURL(/login\.html/);
    await expect(this.page.getByText('Entered e-mail and password do not match.')).toBeVisible();
    await expect(this.loginForm).toBeVisible();
  }

  async assertUserIsSignedIn(email: string): Promise<void> {
    await expect(this.page).toHaveURL(/garage\.html/);
    await expect(this.page.getByText(email, { exact: true })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'My Account', exact: true })).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'My Garage', exact: true }).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: 'Logout', exact: true }).first()).toBeVisible();
    await expect(this.loginForm).not.toBeVisible();
  }

  async verifySignUpFormValidation(): Promise<void> {
    const malformedEmail = JsonDataReader.getInstance().getAuthenticationData().malformedEmail;

    await this.gotoSignUp();
    await this.assertSignUpFormVisible();
    await this.assertRegistrationRequiredFields();
    await this.assertInvalidRegistrationEmailIsRejected(malformedEmail);
  }

  async verifyInvalidCredentialsAreRejected(): Promise<void> {
    const authenticationData = JsonDataReader.getInstance().getAuthenticationData();

    await this.login(authenticationData.invalidEmail, authenticationData.invalidPassword);
    await this.assertLoginRejected();
  }

  async verifyLoginFormControls(): Promise<void> {
    await this.openLoginForm();
    await this.assertLoginFormVisible();
  }

  async verifyRegisteredUserCanSignIn(): Promise<void> {
    const credentials = EnvSetup.getAuthCredentials();

    await this.login(credentials.email, credentials.password);
    await this.assertUserIsSignedIn(credentials.email);
  }
}
