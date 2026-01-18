export interface Wish {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  targetDate: string;
  link?: string;
  image?: string;
  category?: string;
  isPurchased?: boolean;
}

export type Category = 'Furniture' | 'Electronics' | 'Books' | 'Unspecified';
