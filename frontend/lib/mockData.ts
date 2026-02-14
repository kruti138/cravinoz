export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  category: 'veg' | 'non-veg';
  popular: boolean;
}

export interface Topping {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  pizzaId: string;
  size: 'small' | 'medium' | 'large';
  crust: 'thin' | 'pan' | 'cheese-burst';
  toppings: string[];
  quantity: number;
  customizationPrice: number;
}

// Hardcoded pizzas removed — pizzas are now served by backend APIs (admin can add/edit/delete).

export const toppings: Topping[] = [
  { id: '1', name: 'Extra Cheese', price: 50 },
  { id: '2', name: 'Pepperoni', price: 60 },
  { id: '3', name: 'Mushrooms', price: 40 },
  { id: '4', name: 'Bell Peppers', price: 35 },
  { id: '5', name: 'Onions', price: 30 },
  { id: '6', name: 'Olives', price: 45 },
  { id: '7', name: 'Chicken', price: 80 },
  { id: '8', name: 'Paneer', price: 70 },
  { id: '9', name: 'Jalapenos', price: 35 },
  { id: '10', name: 'Fresh Basil', price: 30 },
];

export const deals = [
  {
    id: '1',
    title: '50% Off on Orders Above ₹499',
    description: 'Use code: PIZZA50',
    discount: 50,
  },
  {
    id: '2',
    title: 'Buy 1 Get 1 Free',
    description: 'On selected pizzas',
    discount: 100,
  },
  {
    id: '3',
    title: 'Free Delivery',
    description: 'On all orders above ₹299',
    discount: 50,
  },
];
