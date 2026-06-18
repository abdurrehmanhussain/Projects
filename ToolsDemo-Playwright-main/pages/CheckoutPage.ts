import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base/BasePage';

export interface BillingAddress {
  country: string;
  postalCode: string;
  houseNumber: string;
  street?: string;
  city?: string;
  state?: string;
}

export interface BankPaymentDetails {
  bankName?: string;
  accountName: string;
  accountNumber: string;
}

export interface CreditCardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export class CheckoutPage extends BasePage {
  // ── Billing address step (step 3 for authenticated users) ─────────────────
  // Toolshop billing uses an address-lookup form: country + postal code + house number
  // auto-fill street and city. All fields have data-test attributes.
  get countrySelect(): Locator {
    return this.page.getByTestId('country');
  }
  get postalCodeInput(): Locator {
    return this.page.getByTestId('postal_code');
  }
  get houseNumberInput(): Locator {
    return this.page.getByTestId('house_number');
  }
  get streetInput(): Locator {
    return this.page.getByTestId('street');
  }
  get cityInput(): Locator {
    return this.page.getByTestId('city');
  }
  get stateInput(): Locator {
    return this.page.getByTestId('state');
  }
  get proceedBillingButton(): Locator {
    // Step 3 (Billing Address) proceed button
    return this.page.getByTestId('proceed-3');
  }

  // ── Payment step ───────────────────────────────────────────────────────────
  get paymentMethodSelect(): Locator {
    return this.page.getByLabel(/payment method/i)
      .or(this.page.getByTestId('payment-method'));
  }

  // Bank Transfer fields — Toolshop uses underscores in data-test: bank_name, account_name, account_number
  get bankNameInput(): Locator {
    return this.page.getByTestId('bank_name');
  }
  get accountNameInput(): Locator {
    return this.page.getByTestId('account_name');
  }
  get accountNumberInput(): Locator {
    return this.page.getByTestId('account_number');
  }

  // Credit Card fields
  get creditCardNumberInput(): Locator {
    return this.page.getByLabel(/credit card number/i)
      .or(this.page.getByTestId('credit-card-number'));
  }
  get expiryMonthSelect(): Locator {
    return this.page.getByLabel(/expir.*month|month/i)
      .or(this.page.getByTestId('expiration-date'));
  }
  get expiryYearSelect(): Locator {
    return this.page.getByLabel(/expir.*year|year/i)
      .or(this.page.getByTestId('expiration-year'));
  }
  get cvvInput(): Locator {
    return this.page.getByLabel(/cvv|security code/i)
      .or(this.page.getByTestId('cvv'));
  }

  // Buy Now Pay Later
  get bnplMonthsSelect(): Locator {
    return this.page.getByLabel(/month|installment/i)
      .or(this.page.getByTestId('monthly-installments'));
  }

  // Gift Card fields
  get giftCardSerialInput(): Locator {
    return this.page.getByLabel(/serial/i)
      .or(this.page.getByTestId('gift-card-number'));
  }
  get giftCardCodeInput(): Locator {
    return this.page.getByLabel(/validation code/i)
      .or(this.page.getByTestId('validation-code'));
  }

  get finishButton(): Locator {
    return this.page.getByRole('button', { name: /^finish$/i })
      .or(this.page.getByTestId('finish'));
  }

  // ── Validation error messages ──────────────────────────────────────────────
  get fieldErrors(): Locator {
    return this.page.locator('.is-invalid + .invalid-feedback, .text-danger, [class*="error"]');
  }

  constructor(page: Page) {
    super(page);
  }

  async fillBillingAddress(addr: BillingAddress): Promise<void> {
    // Country is a select — match by visible label text
    await this.countrySelect.selectOption({ value: addr.country });
    await this.postalCodeInput.fill(addr.postalCode);
    await this.houseNumberInput.fill(addr.houseNumber);
    // Street and city may be auto-filled by the lookup; override only if provided
    if (addr.street) {
      await this.streetInput.fill(addr.street);
    }
    if (addr.city) {
      await this.cityInput.fill(addr.city);
    }
    if (addr.state) {
      await this.stateInput.fill(addr.state);
    }
  }

  async submitBillingAddress(): Promise<void> {
    await this.proceedBillingButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async selectPaymentMethod(method: 'bank-transfer' | 'cash-on-delivery' | 'credit-card' | 'buy-now-pay-later' | 'gift-card'): Promise<void> {
    await this.paymentMethodSelect.selectOption(method);
    await this.page.waitForLoadState('networkidle');
  }

  async fillBankTransfer(details: BankPaymentDetails): Promise<void> {
    if (details.bankName) {
      await this.bankNameInput.fill(details.bankName);
    }
    await this.accountNameInput.fill(details.accountName);
    await this.accountNumberInput.fill(details.accountNumber);
  }

  async fillCreditCard(details: CreditCardDetails): Promise<void> {
    await this.creditCardNumberInput.fill(details.cardNumber);
    await this.expiryMonthSelect.selectOption(details.expiryMonth);
    await this.expiryYearSelect.selectOption(details.expiryYear);
    await this.cvvInput.fill(details.cvv);
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  // Returns true if method-specific fields are visible after selecting that method
  async areBankTransferFieldsVisible(): Promise<boolean> {
    return (
      (await this.accountNameInput.isVisible()) &&
      (await this.accountNumberInput.isVisible())
    );
  }

  async areCreditCardFieldsVisible(): Promise<boolean> {
    return (
      (await this.creditCardNumberInput.isVisible()) &&
      (await this.cvvInput.isVisible())
    );
  }

  async getFirstFieldError(): Promise<string> {
    const errors = this.fieldErrors;
    if ((await errors.count()) === 0) return '';
    return (await errors.first().textContent()) ?? '';
  }
}
