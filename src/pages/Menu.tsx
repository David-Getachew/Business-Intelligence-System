import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, UtensilsCrossed, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { fetchMenuItems, fetchIngredients, saveMenuItem, fetchMenuIngredientCounts, fetchMenuItemRecipeFromView } from '@/api/index';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency, formatCurrencyDisplay } from '@/utils/formatCurrency';
import { toast } from 'sonner';

interface RecipeIngredient {
  id: string;
  ingredient_id: number;  // INTEGER per schema
  ingredientName: string;
  quantityPerItem: number;  // Will map to qty_per_item
  unit: string;             // Display only (base_unit from join)
}

export default function Menu() {
  const formRef = useRef<HTMLDivElement>(null);
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [menuForm, setMenuForm] = useState({
    name: '',
    basePrice: 0,
    category: '',
    active: true,
    taxRate: '',
  });
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [ingredientForm, setIngredientForm] = useState({
    ingredientName: '',
    ingredient_id: 0,        // number, not string
    quantityPerItem: '',     // Make deletable - string for better UX
  });
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  const [customCategory, setCustomCategory] = useState('');

  const categories = ['Food', 'Beverage', 'Snack', 'Dessert', 'Other'];

  // Effect to ensure custom category input visibility
  useEffect(() => {
    // This effect will run whenever menuForm.category or customCategory changes
    // It's intentionally empty but helps with component re-rendering consistency
  }, [menuForm.category, customCategory]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [menuData, ingredientsData, counts] = await Promise.all([
        fetchMenuItems(),
        fetchIngredients(),
        fetchMenuIngredientCounts(),
      ]);
      // Attach counts from view
      setMenuItems(menuData.map((m: any) => ({ ...m, recipe_count: counts[m.id] ?? 0 })));
      setIngredients(ingredientsData);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to form when editing
  useEffect(() => {
    if (editingMenuId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingMenuId]);

  const handleIngredientSelect = (ingredientName: string) => {
    const ingredient = ingredients.find(ing => ing.name === ingredientName);
    setIngredientForm(prev => ({
      ...prev,
      ingredientName,
      ingredient_id: ingredient?.id || 0,  // number, not string
    }));
  };

  const addIngredientToRecipe = () => {
    const qtyNum = Number(ingredientForm.quantityPerItem);
    
    if (!ingredientForm.ingredientName || !ingredientForm.ingredient_id || !ingredientForm.quantityPerItem || qtyNum <= 0) {
      toast.error('Please select an ingredient and enter a valid quantity');
      return;
    }

    const ingredient = ingredients.find(ing => ing.name === ingredientForm.ingredientName);
    if (!ingredient) return;

    const newIngredient: RecipeIngredient = {
      id: Date.now().toString(),
      ingredient_id: ingredientForm.ingredient_id,  // CRITICAL: Include ingredient_id for DB insert
      ingredientName: ingredientForm.ingredientName,
      quantityPerItem: qtyNum,
      unit: ingredient.base_unit,
    };

    // Prevent duplicate ingredient entries by ingredient_id
    setRecipeIngredients(prev => {
      const exists = prev.some(ri => ri.ingredient_id === newIngredient.ingredient_id);
      if (exists) {
        toast.error('Ingredient already added to this recipe');
        return prev;
      }
      return [...prev, newIngredient];
    });
    setIngredientForm({
      ingredientName: '',
      ingredient_id: 0,
      quantityPerItem: '',
    });
    toast.success('Ingredient added to recipe');
  };

  const removeIngredientFromRecipe = (id: string) => {
    setRecipeIngredients(prev => prev.filter(ing => ing.id !== id));
    toast.success('Ingredient removed from recipe');
  };

  const editIngredientInRecipe = (ingredient: RecipeIngredient) => {
    setIngredientForm({
      ingredientName: ingredient.ingredientName,
      ingredient_id: ingredient.ingredient_id,
      quantityPerItem: ingredient.quantityPerItem.toString(),
    });
    removeIngredientFromRecipe(ingredient.id);
  };

  const saveMenuItemAndRecipe = async () => {
    // Validate menu item name and category
    if (!menuForm.name.trim()) {
      toast.error('Please enter a menu item name');
      return;
    }
    if (!menuForm.category) {
      toast.error('Please select a category');
      return;
    }

    // CRITICAL VALIDATION: Check all recipe ingredients have valid ingredient_id
    const invalidIngredients = recipeIngredients.filter(ing => !ing.ingredient_id || ing.ingredient_id <= 0);
    if (invalidIngredients.length > 0) {
      toast.error(`${invalidIngredients.length} recipe ingredient(s) missing valid ID. Please remove and re-add them.`);
      console.error('Invalid ingredients:', invalidIngredients);
      return;
    }

    // Additional validation: Check for duplicate ingredient IDs
    const ingredientIds = recipeIngredients.map(ing => ing.ingredient_id);
    const uniqueIds = new Set(ingredientIds);
    if (ingredientIds.length !== uniqueIds.size) {
      toast.error('Duplicate ingredients detected in recipe. Please remove duplicates.');
      console.error('Duplicate ingredient IDs:', ingredientIds);
      return;
    }

    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      // Create a deduplicated recipe array
      const dedupedRecipe = recipeIngredients.map(ing => ({ 
        ingredient_id: ing.ingredient_id, 
        qty_per_item: Number(ing.quantityPerItem)
      }));

      // Log the recipe data being sent for debugging
      console.log('Sending recipe data to backend:', dedupedRecipe);
      
      // Additional check: Verify no duplicates in dedupedRecipe
      const dedupedIngredientIds = dedupedRecipe.map(r => r.ingredient_id);
      const dedupedUniqueIds = new Set(dedupedIngredientIds);
      if (dedupedIngredientIds.length !== dedupedUniqueIds.size) {
        toast.error('Internal error: Duplicate ingredients detected after deduplication.');
        console.error('Duplicate ingredient IDs after deduplication:', dedupedIngredientIds);
        setSubmitting(false);
        return;
      }

      const isUpdate = editingMenuId !== null;
      
      if (menuForm.category === 'Other' && !customCategory.trim()) {
        toast.error('Please specify a custom category');
        setSubmitting(false);
        return;
      }

      // Use custom category if 'Other' is selected
      const categoryToSave = menuForm.category === 'Other' ? customCategory : menuForm.category;
      await saveMenuItem({
        id: editingMenuId ? parseInt(editingMenuId) : null, // Omit for creation, include for update
        name: menuForm.name,
        price: menuForm.basePrice,
        category: categoryToSave,
        active: menuForm.active,
        recipe: dedupedRecipe,
        tax_rate: menuForm.taxRate && !isNaN(parseFloat(menuForm.taxRate)) ? parseFloat(menuForm.taxRate) : undefined,
      });

      setMenuForm({
        name: '',
        basePrice: 0,
        category: '',
        active: true,
        taxRate: '',
      });
      setRecipeIngredients([]);
      setEditingMenuId(null);
      setCustomCategory('');
      
      await loadData();
      toast.success(`Menu item ${isUpdate ? 'updated' : 'created'} successfully!`);
    } catch (error: any) {
      console.error('Error saving menu item:', error);
      const errorMsg = error.message || 'Failed to save menu item';
      toast.error(errorMsg);
      
      // Show detailed error in console for debugging
      console.error('Full error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const loadMenuItem = (item: any) => {
    if (!isAdmin) {
      toast.error('You do not have permission to edit menu items.');
      return;
    }

    // Check if the category is one of the predefined categories
    const isPredefinedCategory = categories.includes(item.category);
    
    setMenuForm({
      name: item.name,
      basePrice: item.price,
      category: isPredefinedCategory ? item.category : 'Other',
      active: item.active,
      taxRate: item.tax_rate?.toString() || '',
    });
    
    // If it's not a predefined category, set it as custom category
    setCustomCategory(isPredefinedCategory ? '' : item.category);    
    // Prefill from view for authoritative data
    (async () => {
      try {
        const rows = await fetchMenuItemRecipeFromView(item.id);
        const mapped = rows.map((row, index) => {
          const ing = ingredients.find((i: any) => i.id === row.ingredient_id);
          return {
            id: index.toString(),
            ingredient_id: row.ingredient_id,
            ingredientName: row.ingredient_name || ing?.name || `Ingredient #${row.ingredient_id}`,
            quantityPerItem: row.qty_per_item,
            unit: ing?.base_unit || 'unit',
          };
        });
        setRecipeIngredients(mapped);
      } catch (e) {
        setRecipeIngredients([]);
      }
    })();
    setEditingMenuId(item.id);
  };

  const toggleMenuItemActive = async (id: string, currentStatus: boolean) => {
    // Added loading guard to prevent concurrent toggles
    if (togglingItemId || !isAdmin) {
      if (!isAdmin) {
        toast.error('You do not have permission to modify menu items.');
      }
      return;
    }

    setTogglingItemId(id); // Set toggling item ID to prevent concurrent saves
    
    // Save previous menu items for rollback
    const prevMenuItems = [...menuItems];
    
    // Apply optimistic update
    setMenuItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, active: !currentStatus } : item
      )
    );
    
    try {
      // Find the menu item to get its current data
      const menuItem = menuItems.find(item => item.id === id);
      if (!menuItem) {
        toast.error('Menu item not found');
        // Revert optimistic update on error
        setMenuItems(prevMenuItems);
        return;
      }

      // Get current recipe data to preserve it during the update
      // Get current recipe data to preserve it during the update
      let currentRecipe;
      try {
        currentRecipe = await fetchMenuItemRecipeFromView(parseInt(id));
        if (!currentRecipe || currentRecipe.length === 0) {
          console.warn('No recipe data found for menu item, preserving empty recipe');
          currentRecipe = [];
        }
      } catch (err) {
        console.error('Failed to fetch current recipe, aborting toggle:', err);
        toast.error('Failed to retrieve menu item recipe');
        // Revert optimistic update on error
        setMenuItems(prevMenuItems);
        return;
      }
      // Update the menu item with ALL current data but toggled active status
      await saveMenuItem({
        id: parseInt(id), // Include ID for update
        name: menuItem.name,        // Current name
        price: menuItem.price,      // Current price  
        category: menuItem.category, // Current category
        active: !currentStatus,     // Toggle the active status
        recipe: currentRecipe.map(r => ({ // Current recipe data
          ingredient_id: r.ingredient_id,
          qty_per_item: r.qty_per_item
        }))
      });

      const message = currentStatus 
        ? 'Menu item deactivated successfully' 
        : 'Menu item activated successfully';
      toast.success(message);
      
      // Refresh the data to ensure consistency
      await loadData();
    } catch (error: any) {
      console.error('Error toggling menu item status:', error);
      // Revert optimistic update on error
      setMenuItems(prevMenuItems);
      toast.error(error.message || 'Failed to update menu item status');
    } finally {
      // Clear toggling item ID in finally block to ensure it's always cleared
      setTogglingItemId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Menu & Recipes</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-heading font-bold">Menu & Recipes</h1>
          <p className="text-muted-foreground mt-1">
            Manage menu items and their recipes
          </p>
        </div>

        <div ref={formRef}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Menu Item Form */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5" />
                  {editingMenuId ? 'Edit Menu Item' : 'Add Menu Item'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="menuName">Menu Item Name *</Label>
                  <Input
                    id="menuName"
                    value={menuForm.name}
                    onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter menu item name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="basePrice">Base Price *</Label>
                    <Input
                      id="basePrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={menuForm.basePrice}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => setMenuForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select key="category-select" value={menuForm.category} onValueChange={(value) => {
                      setMenuForm(prev => ({ ...prev, category: value }));
                      // Clear custom category when switching categories
                      if (value !== 'Other') {
                        setCustomCategory('');
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(categories ?? []).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {menuForm.category === 'Other' && (
                      <Input
                        key="custom-category-input"
                        placeholder="Specify custom category"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                        }}
                        className="mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%) (Optional)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={menuForm.taxRate}
                    onWheel={(e) => e.currentTarget.blur()}
                    onChange={(e) => setMenuForm(prev => ({ ...prev, taxRate: e.target.value }))}
                    placeholder="e.g., 15"
                  />
                </div>

                <Button 
                  onClick={() => setShowConfirmModal(true)} 
                  className="w-full gradient-primary"
                  disabled={!menuForm.name || menuForm.basePrice <= 0 || !menuForm.category}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Menu Item & Recipe
                </Button>
              </CardContent>
            </Card>

            {/* Recipe Editor */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Recipe Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ingredientName">Ingredient *</Label>
                    <Select value={ingredientForm.ingredientName} onValueChange={handleIngredientSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ingredient" />
                      </SelectTrigger>
                      <SelectContent>
                        {(ingredients ?? []).map((ingredient) => (
                          <SelectItem key={ingredient.id} value={ingredient.name}>
                            {ingredient.name} ({ingredient.base_unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantityPerItem">Quantity per Item *</Label>
                    <Input
                      id="quantityPerItem"
                      type="number"
                      step="0.01"
                      min="0"
                      value={ingredientForm.quantityPerItem}
                      onWheel={(e) => e.currentTarget.blur()}
                      onChange={(e) => setIngredientForm(prev => ({ ...prev, quantityPerItem: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <Button onClick={addIngredientToRecipe} className="w-full" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Ingredient
                </Button>

                {(recipeIngredients?.length ?? 0) > 0 && (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ingredient</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(recipeIngredients ?? []).map((ingredient) => (
                          <TableRow key={ingredient.id}>
                            <TableCell className="font-medium">{ingredient.ingredientName}</TableCell>
                            <TableCell>{ingredient.quantityPerItem} {ingredient.unit}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => editIngredientInRecipe(ingredient)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeIngredientFromRecipe(ingredient.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Existing Menu Items */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Existing Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Recipe Items</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(menuItems ?? []).map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>{formatCurrency(item.price ?? 0)}</TableCell>
                      <TableCell>{item.recipe_count ?? 0} ingredients</TableCell>
                      <TableCell>
                        <Switch
                          checked={item.active ?? true}
                          onCheckedChange={() => toggleMenuItemActive(item.id, item.active)}
                          disabled={togglingItemId === item.id || !isAdmin}
                        />
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => loadMenuItem(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit menu item</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Save</DialogTitle>
              <DialogDescription>
                Are you sure you want to save this menu item and its recipe?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </Button>
              <Button onClick={saveMenuItemAndRecipe} className="gradient-primary">
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </TooltipProvider>
  );
}