export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  DELIVERED = "DELIVERED",
  SHIPPED = "SHIPPED",
  ONTHEWAY = "ON THE WAY",
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface IOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder {
  consumerId: string;
  farmerId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
