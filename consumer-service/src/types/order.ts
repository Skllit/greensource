export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder {
  id: string;
  consumerId: string;
  farmerId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: IShippingAddress;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}
