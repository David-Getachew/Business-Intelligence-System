# Curl Test Commands for RPCs

## ⚠️ Setup First

```bash
# 1. Get your credentials from Supabase Dashboard
#    https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

# 2. Set environment variables
export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export USER_ID="your-test-user-uuid"  # Get from auth.users table
```

---

## 🧪 Test 1: Quick Sales (submit_staff_forms)

```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/submit_staff_forms" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "p_user_id": "'"$USER_ID"'",
    "p_sales": [{
      "sale_date": "2025-01-15",
      "total_amount": 25.50,
      "payment_method": "cash",
      "items": [
        {
          "menu_item_id": 1,
          "qty": 2,
          "unit_price": 10.00
        },
        {
          "menu_item_id": 2,
          "qty": 1,
          "unit_price": 5.50
        }
      ]
    }]
  }'
```

**Expected**: HTTP 204 No Content (success)
**Check DB**: `SELECT * FROM sales ORDER BY created_at DESC LIMIT 1;`

---

## 🧪 Test 2: Purchases (submit_staff_forms)

```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/submit_staff_forms" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "p_user_id": "'"$USER_ID"'",
    "p_purchases": [{
      "ingredient_id": 1,
      "qty": 10.5,
      "unit_cost": 3.50,
      "total_cost": 36.75,
      "purchase_date": "2025-01-15",
      "supplier_id": 1,
      "created_by": "'"$USER_ID"'"
    }]
  }'
```

**Expected**: HTTP 204 No Content
**Check DB**: `SELECT * FROM purchases WHERE created_by = '${USER_ID}' ORDER BY created_at DESC LIMIT 1;`

---

## 🧪 Test 3: Expenses (submit_staff_forms)

```bash
curl -X POST "$SUPABASE_URL/rest/v1/rpc/submit_staff_forms" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d '{
    "p_user_id": "'"$USER_ID"'",
    "p_expenses": [{
      "expense_date": "2025-01-15",
      "category": "Labor",
      "amount": 1500.00,
      "reference": "Salary",
      "notes": "Monthly payroll",
      "created_by": "'"$USER_ID"'"
    }]
  }'
```

**Expected**: HTTP 204 No Content
**Check DB**: `SELECT * FROM expenses WHERE created_by = '${USER_ID}' ORDER BY created_at DESC LIMIT 1;`

---

## 🧪 Test 4: Supplier (Direct Insert - Exception)

```bash
curl -X POST "$SUPABASE_URL/rest/v1/suppliers" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '[{
    "name": "Test Supplier Co",
    "contact": {
      "phone": "555-0123",
      "email": "supplier@test.com"
    }
  }]'
```

**Expected**: HTTP 201 Created with JSON response containing new supplier
**Check DB**: `SELECT * FROM suppliers WHERE name = 'Test Supplier Co';`

---

## 🧪 Test 5: Verify No staff_id Errors

```bash
# Try to insert with wrong column (should fail gracefully)
curl -X POST "$SUPABASE_URL/rest/v1/purchases" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '[{
    "ingredient_id": 1,
    "qty": 5,
    "unit_cost": 10,
    "total_cost": 50,
    "staff_id": "wrong-column"
  }]'
```

**Expected**: Error `column "staff_id" does not exist`
**Solution**: Use `created_by` instead OR use submit_staff_forms RPC

---

## 🔍 Debug Failed RPC Calls

### Check RPC exists:
```bash
curl "$SUPABASE_URL/rest/v1/rpc/submit_staff_forms" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected**: Error about missing parameters (proves RPC exists)

### Get RPC signature:
```sql
SELECT 
  p.proname,
  pg_get_function_arguments(p.oid) AS parameters
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname = 'submit_staff_forms';
```

---

## 📊 Expected Responses

### Success (204 No Content):
```
HTTP/1.1 204 No Content
date: Thu, 15 Jan 2025 12:00:00 GMT
```

### Success (201 Created with data):
```json
[
  {
    "id": 123,
    "name": "Test Supplier Co",
    "contact": {"phone": "555-0123", "email": "supplier@test.com"},
    "created_at": "2025-01-15T12:00:00Z"
  }
]
```

### Error (400 Bad Request):
```json
{
  "code": "42703",
  "message": "column \"staff_id\" of relation \"purchases\" does not exist",
  "details": null,
  "hint": null
}
```

---

## 🚨 Common Errors & Solutions

| Error Code | Message | Solution |
|------------|---------|----------|
| 42703 | column "staff_id" does not exist | Use `created_by` instead |
| 42883 | function does not exist | Check RPC name/parameters |
| 23502 | not-null constraint violation | Provide required fields |
| 23503 | foreign key violation | Ensure referenced IDs exist |
| 404 | Not Found | RPC doesn't exist - check spelling |

---

## 📝 Curl Tips

### Pretty print JSON response:
```bash
curl ... | jq '.'
```

### Save response to file:
```bash
curl ... -o response.json
```

### Include response headers:
```bash
curl ... -i
```

### Verbose mode (debug):
```bash
curl ... -v
```

---

## ✅ Testing Checklist

- [ ] Sales RPC test succeeds (no 404)
- [ ] Purchases RPC test succeeds (no staff_id error)
- [ ] Expenses RPC test succeeds (no staff_id error)
- [ ] Supplier direct insert succeeds
- [ ] DB rows verified in Supabase dashboard
- [ ] No column mismatch errors
- [ ] Frontend forms use same RPC calls

---

_Use these commands to verify RPC functionality before testing in UI_

