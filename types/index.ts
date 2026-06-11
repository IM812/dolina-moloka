export type PaymentStatus = "pending" | "paid" | "cancelled";
export type DeliveryStatus = "pending" | "processing" | "ready" | "delivered";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  composition: string;
  storageConditions: string;
  price: number;
  weight: string;
  image: string;
  category: string;
  inStock: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Customer {
  fullName: string;
  phone: string;
  email: string;
  pickupAddress: string;
  comment?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: Customer;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  createdAt: string;
}
