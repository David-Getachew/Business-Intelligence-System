# Database Schema Verification (via MCP)

## Verified Column Names

### suppliers table
- `id` (integer, NOT NULL)
- `name` (text, NOT NULL)
- **`contact` (jsonb, nullable)** ← NOT `contact_info`!
- `created_at` (timestamp, nullable)

**Fix Required**: Change all queries from `contact_info` to `contact`

---

### ingredients table
- `id` (integer, NOT NULL)
- `name` (text, NOT NULL)
- `base_unit` (text, NOT NULL)
- `unit_conversion` (numeric, nullable)
- `reorder_point` (numeric, nullable)
- `active` (boolean, nullable)
- `created_at` (timestamp, nullable)

**Note**: No cost column in ingredients table

---

### inventory_on_hand table
- `ingredient_id` (integer, NOT NULL, PRIMARY KEY)
- `qty_on_hand` (numeric, nullable)
- **`avg_unit_cost` (numeric, nullable)** ← Use this for unit cost autopopulate!
- `last_updated` (timestamp, nullable)

**Fix Required**: Query this table for unit cost when ingredient selected

---

### recipe_ingredients table
- `id` (integer, NOT NULL)
- `menu_item_id` (integer, NOT NULL)
- **`ingredient_id` (integer, NOT NULL)** ← REQUIRED, must validate!
- `qty_per_item` (numeric, NOT NULL)

**Fix Required**: Client-side validation before submit

---

## Fixes to Implement

1. **Supplier Contact** - Change `contact_info` → `contact` (jsonb)
2. **Unit Cost** - Fetch from `inventory_on_hand.avg_unit_cost` 
3. **Recipe Validation** - Prevent null `ingredient_id` submission
4. **Batch Edit** - Fix editingIndex state management
5. **Error Handling** - Add debug modal with full error details


