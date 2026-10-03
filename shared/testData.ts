export const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  locked: { username: 'locked_out_user', password: 'secret_sauce' },
} as const;

export const product = 'Sauce Labs Backpack';

export const customer = {
  firstName: 'Ada',
  lastName: 'Lovelace',
  postalCode: '10115',
} as const;
