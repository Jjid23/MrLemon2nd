export interface DrinkOption {
  id: string;
  name: string;
  price: number;
}

export interface FlavorInfo {
  name: string;
  extra?: number;
}

export interface Drink {
  id: string;
  name: string;
  sizes: {
    [key: string]: {
      price: number;
      type: 'hot' | 'cold' | 'both';
      inventory?: { [key: string]: number };
      categories?: {
        [key: string]: (string | FlavorInfo)[];
      };
      flavors?: (string | FlavorInfo)[];
    };
  };
}

export const MENU: Drink[] = [
  {
    id: 'lemonade',
    name: 'Lemonade',
    sizes: {
      '12oz': {
        price: 39,
        type: 'hot',
        inventory: { 'Cups 12oz': 1, 'Lemon': 1 },
        categories: {
          'Hot Selection': [
            { name: 'Classic Lemonade', extra: 0 },
            { name: 'Ginger Lemonade', extra: 20 }
          ]
        }
      },
      '16oz': {
        price: 39,
        type: 'cold',
        inventory: { 'Cups 16oz': 1, 'Lemon': 1 },
        categories: {
          'Classic': [{ name: 'Classic Lemonade', extra: 0 }],
          'Flavored Jam': [{ name: 'Flavored Jam Lemonade', extra: 10 }]
        }
      },
      '22oz': {
        price: 59,
        type: 'cold',
        inventory: { 'Cups 22oz': 1, 'Lemon': 2 },
        categories: {
          'Classic': [{ name: 'Classic Lemonade', extra: 0 }],
          'Flavored Jam': [{ name: 'Flavored Jam Lemonade', extra: 10 }]
        }
      }
    }
  },
  {
    id: 'calamansi',
    name: 'Calamansi',
    sizes: {
      '12oz': {
        price: 39,
        type: 'hot',
        inventory: { 'Cups 12oz': 1, 'Calamansi': 3 },
        categories: {
          'Hot Selection': [
            { name: 'Classic Calamansi', extra: 0 },
            { name: 'Ginger Calamansi', extra: 20 }
          ]
        }
      },
      '16oz': {
        price: 39,
        type: 'cold',
        inventory: { 'Cups 16oz': 1, 'Calamansi': 4 },
        categories: {
          'Cold Selection': [
            { name: 'Classic Calamansi', extra: 0 },
            { name: 'Mango Calamansi', extra: 10 }
          ]
        }
      },
      '22oz': {
        price: 59,
        type: 'both',
        inventory: { 'Cups 22oz': 1, 'Calamansi': 6 },
        categories: {
          'Cold Selection': [
            { name: 'Classic Calamansi', extra: 0 },
            { name: 'Mango Calamansi', extra: 10 }
          ]
        }
      }
    }
  },
  {
    id: 'quenchers',
    name: 'Quenchers',
    sizes: {
      '16oz': {
        price: 59,
        type: 'cold',
        inventory: { 'Cups 16oz': 1 },
        flavors: [
          { name: 'Tropical Fruit', extra: 0 },
          { name: 'Pink Peach', extra: 0 }
        ]
      },
      '22oz': {
        price: 79,
        type: 'cold',
        inventory: { 'Cups 22oz': 1 },
        flavors: [
          { name: 'Tropical Fruit', extra: 0 },
          { name: 'Pink Peach', extra: 0 }
        ]
      }
    }
  },
  {
    id: 'flavorsyrup',
    name: 'Flavored Syrup',
    sizes: {
      '16oz': {
        price: 59,
        type: 'cold',
        inventory: { 'Cups 16oz': 1 }
      },
      '22oz': {
        price: 79,
        type: 'cold',
        inventory: { 'Cups 22oz': 1 }
      }
    }
  }
];

export const ADDONS = [
  { name: 'Nata de Coco', price: 10 },
  { name: 'Popping Bobba', price: 20 }
];
