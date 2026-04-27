export interface Product {
  id: string;
  name: string;
  nameJp: string;  
  price: number;
  description: string;
  emoji: string;
  category: 'mochi' | 'donut' | 'cake' | 'drink';
  isNew?: boolean;
}