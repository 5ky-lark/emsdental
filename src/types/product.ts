export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
  features: string[];
  inclusions?: ProductInclusion[];
}

export interface ProductInclusion {
  id: string;
  name: string;
  description?: string;
  price: number;
  productId: string;
}

export interface CartItem {
  id: string;
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  includedItems?: CartItemInclusion[];
  selectedInclusions?: SelectedInclusion[];
}

export interface SelectedInclusion {
  inclusionId: string;
  name: string;
  description?: string;
  price: number;
}

export interface CartItemInclusion {
  id: string;
  cartItemId: string;
  name: string;
  description?: string;
  price: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  includedItems?: OrderItemInclusion[];
}

export interface OrderItemInclusion {
  id: string;
  orderItemId: string;
  name: string;
  description?: string;
  price: number;
}

export interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaymentInfo {
  method: string;
  status?: string;
  paymentIntentId?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingInfo: ShippingInfo;
  paymentInfo: PaymentInfo;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
} 