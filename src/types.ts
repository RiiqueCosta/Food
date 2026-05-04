export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  bannerUrl?: string;
  whatsapp: string;
  themeColor: string;
  ownerId: string;
  active: boolean;
  config: {
    allowPickup: boolean;
    allowTable: boolean;
    automaticPrinting: boolean;
  };
  plan: 'free' | 'basic' | 'premium';
}

export interface Category {
  id: string;
  name: string;
  order: number;
  restaurantId: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  categoryId: string;
  restaurantId: string;
  available: boolean;
  extras?: {
    name: string;
    price: number;
  }[];
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  extras?: {
    name: string;
    price: number;
  }[];
  observations?: string;
}

export interface Order {
  id: string;
  restaurantId: string;
  customer: {
    name: string;
    phone: string;
    table?: string;
  };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'finished' | 'canceled';
  createdAt: any; // Server timestamp
  type: 'pickup' | 'table';
}
