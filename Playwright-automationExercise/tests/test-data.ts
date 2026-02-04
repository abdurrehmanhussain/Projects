/**
 * Shared test data for all E2E tests
 */

// Generate unique 4-digit number for email
const uniqueId = Math.floor(1000 + Math.random() * 9000);

export const testUser = {
  name: 'Abdur Rehman Hussain',
  email: `Abdurrehmanhussain${uniqueId}@gmail.com`,
  password: 'Test@123',
  firstName: 'Abdur Rehman',
  lastName: 'Hussain',
  company: 'Senior Automation Engineer',
  address1: 'HOUSE NO 007, DHA PHASE 1, Street 7',
  address2: 'Lahore',
  country: 'United States',
  state: 'Punjab',
  city: 'Lahore',
  zipcode: '54000',
  mobileNumber: '03001234567',
  // Date of birth: 16 March 1993
  birthDay: '16',
  birthMonth: '3',
  birthYear: '1993',
};

export const paymentDetails = {
  nameOnCard: 'Abdur Rehman Hussain',
  cardNumber: '4111111111111111',
  cvc: '123',
  expiryMonth: '12',
  expiryYear: '2025',
};
