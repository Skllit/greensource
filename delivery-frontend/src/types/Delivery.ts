export interface IDelivery {
  orderId: string;
  farmerId: string;
  consumerId: string;
  farmerPhoneNumber: string;
  consumerPhoneNumber: string;
  deliveryAgentId?: string;
  orderPrice: number;
  deliveryAddress: string;
  pickupAddress: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CANCELLED"
    | "DELIVERED"
    | "SHIPPED"
    | "ONTHEWAY";
  createdAt: Date;
  updatedAt: Date;
}
