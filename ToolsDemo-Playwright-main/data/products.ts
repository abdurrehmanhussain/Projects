export interface ProductRef {
  name: string;
  path: string;
}

// Well-known products on the Toolshop that are unlikely to be removed.
// These are navigated via data-test link on the homepage so we don't
// depend on hard-coded IDs that could change after a data reset.
export const KNOWN_PRODUCTS = {
  boltCutters: {
    name: 'Bolt Cutters',
    searchTerm: 'Bolt Cutters',
  },
  hammer: {
    name: 'Claw Hammer',
    searchTerm: 'Claw Hammer',
  },
  screwdriver: {
    name: 'Screwdriver',
    searchTerm: 'Screwdriver',
  },
} as const;

export const SORT_OPTIONS = {
  nameAsc: 'name,asc',
  nameDesc: 'name,desc',
  priceAsc: 'price,asc',
  priceDesc: 'price,desc',
} as const;

export const CATEGORIES = {
  powerTools: 'Power Tools',
  handTools: 'Hand Tools',
  hammer: 'Hammer',
} as const;

// Billing address for authenticated-user checkout tests.
// Toolshop billing is a lookup form: country + postal code + house number.
export const BILLING_ADDRESS = {
  country: 'US',
  postalCode: '12345',
  houseNumber: '42',
  street: 'Test Street',
  city: 'Test City',
  state: '',
} as const;

// Payment details for bank transfer (bankName omitted — Toolshop provides its own select options)
export const BANK_PAYMENT = {
  bankName: 'Test Bank',
  accountName: 'Test Automation',
  accountNumber: '1234567890',
} as const;
