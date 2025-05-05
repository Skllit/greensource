export interface Address {
  id?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  isDefault: boolean;
}

export interface Customer {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  password: string;
  addresses: Address[];
}

export interface Farmer {
  id?: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
  addresses: Address[];
  isVerified?: boolean;
}
