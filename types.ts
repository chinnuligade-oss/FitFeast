
export interface FoodEntry {
  id: string;
  timestamp: number;
  foodItem: string;
  category: string;
  servingSize: number;
  unit: string;
  caloriesPerUnit: number;
  totalCalories: number;
}

export interface DailySummary {
  totalCalories: number;
  goal: number;
  entries: FoodEntry[];
}

export enum FoodCategory {
  PROTEIN = 'Proteins',
  FRUITS = 'Fruits',
  VEGETABLES = 'Vegetables',
  DAIRY = 'Dairy',
  GRAINS = 'Grains',
  SNACKS = 'Snacks',
  DRINKS = 'Drinks',
  OTHER = 'Other'
}
