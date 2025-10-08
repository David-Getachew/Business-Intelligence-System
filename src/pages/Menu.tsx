import { useState } from 'react';
import { Plus, Edit, Trash2, UtensilsCrossed, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { mockMenuItems } from '@/mocks/menuItems';
import { mockIngredients } from '@/mocks/ingredients';
import { toast } from 'sonner';

interface RecipeIngredient {
  id: string;
  ingredientName: string;
  quantityPerItem: number;
  unit: string;
}

export default function Menu() {
  const [menuForm, setMenuForm] = useState({
    name: '',
    basePrice: 0,
    category: '',
    notes: '',
  });
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [ingredientForm, setIngredientForm] = useState({
    ingredientName: '',
    quantityPerItem: 0,
  });
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [showMenuConfirmModal, setShowMenuConfirmModal] = useState(false);
  const [showRecipeConfirmModal, setShowRecipeConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const categories = ['Pizza', 'Burgers', 'Salads', 'Pasta', 'Beverages', 'Desserts'];

  const addIngredientToRecipe = () => {
    if (!ingredientForm.ingredientName || ingredientForm.quantityPerItem <= 0) {
      toast.error('Please select an ingredient and enter a valid quantity');
      return;
    }

    const ingredient = mockIngredients.find(ing => ing.name === ingredientForm.ingredientName);
    if (!ingredient) return;

    const newIngredient: RecipeIngredient = {
      id: Date.now().toString(),
      ingredientName: ingredientForm.ingredientName,
      quantityPerItem: ingredientForm.quantityPerItem,
      unit: ingredient.unit,
    };

    setRecipeIngredients(prev => [...prev, newIngredient]);
    setIngredientForm({
      ingredientName: '',
      quantityPerItem: 0,
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
      quantityPerItem: ingredient.quantityPerItem,
    });
    removeIngredientFromRecipe(ingredient.id);
  };

  const saveMenuItem = () => {
    setShowMenuConfirmModal(false);
    // Mock API call
    setTimeout(() => {
      setSuccessMessage('Menu item saved successfully');
      setShowSuccessModal(true);
      setMenuForm({
        name: '',
        basePrice: 0,
        category: '',
        notes: '',
      });
      setEditingMenuId(null);
    }, 1000);
  };

  const saveRecipe = () => {
    setShowRecipeConfirmModal(false);
    // Mock API call
    setTimeout(() => {
      setSuccessMessage('Recipe saved successfully');
      setShowSuccessModal(true);
      setRecipeIngredients([]);
    }, 1000);
  };

  const loadMenuItem = (item: any) => {
    setMenuForm({
      name: item.name,
      basePrice: item.price,
      category: item.category,
      notes: '',
    });
    setRecipeIngredients(
      item.recipe.map((ing: any, index: number) => ({
        id: index.toString(),
        ingredientName: ing.ingredient_name,
        quantityPerItem: ing.qty_per_item,
        unit: mockIngredients.find(i => i.name === ing.ingredient_name)?.unit || 'unit',
      }))
    );
    setEditingMenuId(item.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Menu & Recipes</h1>
        <p className="text-muted-foreground mt-1">
          Manage menu items and their recipes
        </p>
      </div>

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
                  onChange={(e) => setMenuForm(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={menuForm.category} onValueChange={(value) => setMenuForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Optional notes about this menu item..."
                value={menuForm.notes}
                onChange={(e) => setMenuForm(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <Button 
              onClick={() => setShowMenuConfirmModal(true)} 
              className="w-full gradient-primary"
              disabled={!menuForm.name || menuForm.basePrice <= 0 || !menuForm.category}
            >
              <Save className="mr-2 h-4 w-4" />
              {editingMenuId ? 'Update Menu Item' : 'Save Menu Item'}
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
                <Select value={ingredientForm.ingredientName} onValueChange={(value) => setIngredientForm(prev => ({ ...prev, ingredientName: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockIngredients.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={ingredient.name}>
                        {ingredient.name} ({ingredient.unit})
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
                  onChange={(e) => setIngredientForm(prev => ({ ...prev, quantityPerItem: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <Button onClick={addIngredientToRecipe} className="w-full" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>

            {recipeIngredients.length > 0 && (
              <>
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
                      {recipeIngredients.map((ingredient) => (
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

                <Button 
                  onClick={() => setShowRecipeConfirmModal(true)} 
                  className="w-full gradient-primary"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Recipe
                </Button>
              </>
            )}
          </CardContent>
        </Card>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMenuItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.recipe.length} ingredients</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadMenuItem(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Menu Item Confirmation Modal */}
      <Dialog open={showMenuConfirmModal} onOpenChange={setShowMenuConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Save Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to save this menu item?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMenuConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveMenuItem} className="gradient-primary">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recipe Confirmation Modal */}
      <Dialog open={showRecipeConfirmModal} onOpenChange={setShowRecipeConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Save Recipe</DialogTitle>
            <DialogDescription>
              Are you sure you want to save this recipe with {recipeIngredients.length} ingredients?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecipeConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={saveRecipe} className="gradient-primary">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessModal(false)} className="gradient-primary">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}