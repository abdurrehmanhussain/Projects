import { Page, Locator } from '@playwright/test';
import { BasePage } from '../base/BasePage';

/**
 * CheckoutPage class represents the Checkout page of Automation Exercise
 * Contains methods to review order, enter payment details and place order
 */
export class CheckoutPage extends BasePage {
  // Locators - Address Details
  readonly deliveryAddressSection: Locator;
  readonly billingAddressSection: Locator;
  readonly deliveryFirstName: Locator;
  readonly deliveryLastName: Locator;
  readonly deliveryAddress: Locator;
  readonly deliveryCityStateZip: Locator;
  readonly deliveryCountry: Locator;
  readonly deliveryPhone: Locator;

  // Locators - Order Review
  readonly orderTable: Locator;
  readonly orderItems: Locator;
  readonly totalAmount: Locator;

  // Locators - Comment & Place Order
  readonly commentTextarea: Locator;
  readonly placeOrderButton: Locator;

  // Locators - Payment
  readonly nameOnCardInput: Locator;
  readonly cardNumberInput: Locator;
  readonly cvcInput: Locator;
  readonly expiryMonthInput: Locator;
  readonly expiryYearInput: Locator;
  readonly payAndConfirmButton: Locator;

  // Locators - Order Confirmation
  readonly orderPlacedMessage: Locator;
  readonly continueButton: Locator;
  readonly downloadInvoiceButton: Locator;

  constructor(page: Page) {
    super(page);
    // Address sections
    this.deliveryAddressSection = page.locator('#address_delivery');
    this.billingAddressSection = page.locator('#address_invoice');
    this.deliveryFirstName = page.locator('#address_delivery .address_firstname');
    this.deliveryLastName = page.locator('#address_delivery .address_lastname');
    this.deliveryAddress = page.locator('#address_delivery .address_address1').nth(1);
    this.deliveryCityStateZip = page.locator('#address_delivery .address_city');
    this.deliveryCountry = page.locator('#address_delivery .address_country_name');
    this.deliveryPhone = page.locator('#address_delivery .address_phone');

    // Order review
    this.orderTable = page.locator('#cart_info');
    this.orderItems = page.locator('#cart_info tbody tr');
    this.totalAmount = page.locator('.cart_total_price');

    // Comment & Place Order
    this.commentTextarea = page.locator('textarea[name="message"]');
    this.placeOrderButton = page.locator('a:has-text("Place Order")');

    // Payment
    this.nameOnCardInput = page.locator('input[name="name_on_card"]');
    this.cardNumberInput = page.locator('input[name="card_number"]');
    this.cvcInput = page.locator('input[name="cvc"]');
    this.expiryMonthInput = page.locator('input[name="expiry_month"]');
    this.expiryYearInput = page.locator('input[name="expiry_year"]');
    this.payAndConfirmButton = page.locator('#submit');

    // Order confirmation
    this.orderPlacedMessage = page.locator('[data-qa="order-placed"]');
    this.continueButton = page.locator('[data-qa="continue-button"]');
    this.downloadInvoiceButton = page.locator('.check_out');
  }

  /**
   * Verify checkout page is visible
   */
  async isCheckoutPageVisible(): Promise<boolean> {
    return await this.isVisible(this.deliveryAddressSection);
  }

  /**
   * Get delivery address details
   */
  async getDeliveryAddressDetails(): Promise<string> {
    return await this.getText(this.deliveryAddressSection);
  }

  /**
   * Get billing address details
   */
  async getBillingAddressDetails(): Promise<string> {
    return await this.getText(this.billingAddressSection);
  }

  /**
   * Add comment to order
   */
  async addComment(comment: string): Promise<void> {
    await this.type(this.commentTextarea, comment);
  }

  /**
   * Click place order button
   */
  async placeOrder(): Promise<void> {
    await this.click(this.placeOrderButton);
  }

  /**
   * Enter payment details
   */
  async enterPaymentDetails(paymentInfo: {
    nameOnCard: string;
    cardNumber: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
  }): Promise<void> {
    await this.type(this.nameOnCardInput, paymentInfo.nameOnCard);
    await this.type(this.cardNumberInput, paymentInfo.cardNumber);
    await this.type(this.cvcInput, paymentInfo.cvc);
    await this.type(this.expiryMonthInput, paymentInfo.expiryMonth);
    await this.type(this.expiryYearInput, paymentInfo.expiryYear);
  }

  /**
   * Click pay and confirm button
   */
  async payAndConfirm(): Promise<void> {
    await this.click(this.payAndConfirmButton);
  }

  /**
   * Verify order placed successfully
   */
  async isOrderPlacedSuccessfully(): Promise<boolean> {
    return await this.isVisible(this.orderPlacedMessage);
  }

  /**
   * Get order confirmation message
   */
  async getOrderConfirmationMessage(): Promise<string> {
    return await this.getText(this.orderPlacedMessage);
  }

  /**
   * Click continue after order placed
   */
  async clickContinue(): Promise<void> {
    await this.click(this.continueButton);
  }

  /**
   * Download invoice
   */
  async downloadInvoice(): Promise<void> {
    await this.click(this.downloadInvoiceButton);
  }

  /**
   * Complete checkout with comment and payment
   */
  async completeCheckout(
    comment: string,
    paymentInfo: {
      nameOnCard: string;
      cardNumber: string;
      cvc: string;
      expiryMonth: string;
      expiryYear: string;
    }
  ): Promise<void> {
    await this.addComment(comment);
    await this.placeOrder();
    await this.enterPaymentDetails(paymentInfo);
    await this.payAndConfirm();
  }
}
