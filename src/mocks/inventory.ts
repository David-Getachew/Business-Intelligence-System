export const mockInventoryOnHand = [
  { ingredient_id: '1', ingredient_name: 'Pizza Dough', unit: 'kg', qty_on_hand: 12, avg_unit_cost: 3.5, reorder_point: 5 },
  { ingredient_id: '2', ingredient_name: 'Tomato Sauce', unit: 'liter', qty_on_hand: 8, avg_unit_cost: 5.0, reorder_point: 3 },
  { ingredient_id: '3', ingredient_name: 'Mozzarella Cheese', unit: 'kg', qty_on_hand: 3.5, avg_unit_cost: 12.0, reorder_point: 4 },
  { ingredient_id: '4', ingredient_name: 'Romaine Lettuce', unit: 'kg', qty_on_hand: 1.2, avg_unit_cost: 4.0, reorder_point: 2 },
  { ingredient_id: '5', ingredient_name: 'Caesar Dressing', unit: 'liter', qty_on_hand: 5, avg_unit_cost: 8.0, reorder_point: 2 },
  { ingredient_id: '6', ingredient_name: 'Parmesan Cheese', unit: 'kg', qty_on_hand: 2, avg_unit_cost: 18.0, reorder_point: 1 },
  { ingredient_id: '7', ingredient_name: 'Beef Patty', unit: 'kg', qty_on_hand: 15, avg_unit_cost: 9.0, reorder_point: 10 },
  { ingredient_id: '8', ingredient_name: 'Burger Bun', unit: 'pieces', qty_on_hand: 30, avg_unit_cost: 0.5, reorder_point: 50 },
  { ingredient_id: '9', ingredient_name: 'Cheddar Cheese', unit: 'kg', qty_on_hand: 0.8, avg_unit_cost: 10.0, reorder_point: 3 },
  { ingredient_id: '10', ingredient_name: 'Pasta', unit: 'kg', qty_on_hand: 8, avg_unit_cost: 2.5, reorder_point: 5 },
  { ingredient_id: '11', ingredient_name: 'Coffee Beans', unit: 'kg', qty_on_hand: 1.5, avg_unit_cost: 15.0, reorder_point: 2 },
  { ingredient_id: '12', ingredient_name: 'Milk', unit: 'liter', qty_on_hand: 18, avg_unit_cost: 1.2, reorder_point: 10 },
];

export const mockInventoryMovements = [
  { 
    id: '1', 
    ingredient_id: '3', 
    movement_date: '2025-10-07', 
    movement_type: 'sale', 
    qty_change: -2.5, 
    reference: 'SALE-1001' 
  },
  { 
    id: '2', 
    ingredient_id: '3', 
    movement_date: '2025-10-06', 
    movement_type: 'purchase', 
    qty_change: 10, 
    reference: 'PUR-501' 
  },
  { 
    id: '3', 
    ingredient_id: '3', 
    movement_date: '2025-10-05', 
    movement_type: 'sale', 
    qty_change: -4, 
    reference: 'SALE-999' 
  },
];
