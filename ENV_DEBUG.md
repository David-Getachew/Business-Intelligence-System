# Environment Variable Debug Guide

## 🔍 Debugging "Supabase not configured" Banner

If you're seeing the banner even after setting up .env.local, check these:

---

## ✅ Checklist

### 1. File Location
```bash
# .env.local must be in PROJECT ROOT (not in src/)
# Correct location:
Business-Intelligence-System/
├── .env.local          ← HERE!
├── src/
├── package.json
└── ...
```

**Check**:
```bash
# Should show .env.local in root
ls -la | grep .env.local     # Mac/Linux
dir | findstr .env.local     # Windows
```

---

### 2. Variable Names (Exact Spelling)
```env
# ✅ CORRECT (check spelling carefully!)
VITE_PUBLIC_SUPABASE_URL=https://...
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# ❌ WRONG (missing VITE_PUBLIC_ prefix)
SUPABASE_URL=https://...
SUPABASE_ANON_KEY=eyJ...

# ❌ WRONG (typos)
VITE_PUBLIC_SUPABAS_URL=...        # Missing E
VITE_PUBLIC_SUPABASE_ANNON_KEY=... # Double N
```

**Must start with**: `VITE_PUBLIC_`

---

### 3. No Quotes or Spaces
```env
# ✅ CORRECT
VITE_PUBLIC_SUPABASE_URL=https://abc123.supabase.co

# ❌ WRONG (quotes)
VITE_PUBLIC_SUPABASE_URL="https://abc123.supabase.co"

# ❌ WRONG (spaces)
VITE_PUBLIC_SUPABASE_URL = https://abc123.supabase.co

# ❌ WRONG (trailing space)
VITE_PUBLIC_SUPABASE_URL=https://abc123.supabase.co 
```

---

### 4. Dev Server Restart Required
```bash
# After creating/editing .env.local, MUST restart:
Ctrl+C  # Stop server
npm run dev  # Restart

# Vite loads env vars at startup only!
```

---

### 5. Check Browser Console
```javascript
// Open DevTools Console (F12)
// Check what Vite loaded:
console.log('URL:', import.meta.env.VITE_PUBLIC_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY);

// Should show your actual values
// If shows 'undefined', env vars not loaded
```

---

### 6. Verify .env.local Content
```env
# Minimal working example:
VITE_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzAwMDAwMDAsImV4cCI6MTk4NTU3NjAwMH0.example

# No comments before variables
# No blank lines before variables
# Must be at top of file
```

---

## 🐛 Common Issues

### Issue 1: Login page shows banner
**Cause**: Login route wrapped in MainLayout (shows banner)
**Solution**: Login should NOT use MainLayout

**Check src/App.tsx**:
```typescript
// ❌ WRONG
<Route path="/login" element={<MainLayout><Login /></MainLayout>} />

// ✅ CORRECT
<Route path="/login" element={<Login />} />
```

---

### Issue 2: Variables undefined in console
**Causes**:
- .env.local not in project root
- Variables don't start with `VITE_PUBLIC_`
- Server not restarted after creating file
- Typos in variable names

**Solution**:
```bash
# 1. Verify file location
cd Business-Intelligence-System
ls .env.local  # Should exist

# 2. Check content
cat .env.local  # Mac/Linux
type .env.local # Windows

# 3. Verify names start with VITE_PUBLIC_

# 4. Restart server
npm run dev
```

---

### Issue 3: Banner won't dismiss
**Cause**: Variables still undefined

**Debug**:
```typescript
// Add to src/lib/supabase.ts temporarily
console.log('ENV CHECK:', {
  url: import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  key: import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
  configured: isSupabaseConfigured
});
```

---

## 🔧 Quick Fix Commands

### Windows PowerShell:
```powershell
# Check if file exists
Test-Path .env.local

# View content
Get-Content .env.local

# Verify variable names
Select-String "VITE_PUBLIC" .env.local
```

### Mac/Linux:
```bash
# Check if file exists
ls -la .env.local

# View content
cat .env.local

# Verify variable names
grep "VITE_PUBLIC" .env.local
```

---

## ✅ Working Example

### .env.local (Correct Format):
```env
VITE_PUBLIC_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5emFiYzEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjcwMDAwMDAwLCJleHAiOjE5ODU1NzYwMDB9.YourActualKeyHere
```

### Expected Console Output (when working):
```
(no warnings about Supabase not configured)
```

### Expected Console Output (when NOT working):
```
⚠️ Supabase not configured. Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY in .env.local
Copy .env.example to .env.local and add your credentials
```

---

## 🎯 Step-by-Step Fix

If banner still shows:

### Step 1: Verify File Location
```bash
# You should be in project root
pwd  # Mac/Linux
cd   # Windows - shows current directory

# Should see .env.local here
ls .env.local  # Mac/Linux
dir .env.local # Windows
```

### Step 2: Check File Content
```bash
# Mac/Linux
cat .env.local

# Windows
type .env.local

# Should show TWO lines starting with VITE_PUBLIC_
```

### Step 3: Verify No Typos
```
VITE_PUBLIC_SUPABASE_URL     ← Check spelling!
VITE_PUBLIC_SUPABASE_ANON_KEY ← Check spelling!

Common typos:
- SUPABAS (missing E)
- ANNON (double N)
- VITE_PUBIC (missing L)
```

### Step 4: Hard Restart
```bash
# Stop server completely
Ctrl+C

# Clear cache
rm -rf node_modules/.vite  # Mac/Linux
rmdir /s node_modules\.vite # Windows

# Restart
npm run dev
```

### Step 5: Hard Reload Browser
```
Ctrl+Shift+R  # Hard reload (clears cache)
F12 → Console → Check for warnings
```

---

## 📞 Still Not Working?

Share your .env.local content (hide actual keys):
```env
VITE_PUBLIC_SUPABASE_URL=https://[HIDDEN].supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=[FIRST_20_CHARS]...
```

And console output to diagnose further!

---

_Debug guide complete - follow steps above to resolve issue_

