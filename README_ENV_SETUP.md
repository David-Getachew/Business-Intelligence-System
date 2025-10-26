# Environment Setup - Quick Start

## 🚀 5-Minute Setup

### 1. Copy Environment Template
```bash
# Windows PowerShell
copy env.example .env.local

# Mac/Linux/WSL
cp env.example .env.local
```

### 2. Get Supabase Credentials

**Navigate to**: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api

**Copy these values**:
- **Project URL** (e.g., `https://abc123.supabase.co`)
- **Project API Keys** → **anon** **public** key

### 3. Update .env.local
Open `.env.local` and replace:
```env
VITE_PUBLIC_SUPABASE_URL=https://abc123.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Restart Dev Server
```bash
npm run dev
```

### 5. Verify
- Open http://localhost:8080/
- ✅ No "Supabase not configured" banner
- ✅ Can login and use features

---

## ⚠️ What If I Don't Have Credentials?

### App Behavior Without .env.local:
- ✅ App still loads (no crash!)
- ⚠️ Banner shows: "Supabase not configured"
- 🔒 Forms disabled with helper text
- 📊 Data features show placeholder state

### To Get Started:
1. Create free Supabase project: https://supabase.com/dashboard/new
2. Follow Steps 1-4 above
3. You're ready to develop!

---

## 🔐 Security Notes

### ✅ Safe to Commit:
- `env.example` - Template with placeholders
- `.gitignore` - Protects secret files
- Frontend code with anon key usage

### ❌ NEVER Commit:
- `.env.local` - Contains your actual credentials
- `.env.test` - Contains service role key (if used)
- Any file with `SERVICE_ROLE_KEY`

### Already Protected by .gitignore:
```gitignore
.env
.env.local
.env.test
.env.*.local
*_SERVICE_ROLE_KEY*
```

---

## 🔑 Service Role Key - NOT NEEDED

### For Frontend Development:
**Service role key is NOT required!**

- ✅ Admin user creation works with anon key
- ✅ All RPC calls work with anon key + RLS
- ✅ No service-side endpoint needed for main features

### For Backend/Curl Testing (Optional):
If you want to test RPCs directly with curl:

1. Create `.env.test` (gitignored):
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. Use in curl:
```bash
source .env.test
curl -X POST "$SUPABASE_URL/rest/v1/rpc/submit_staff_forms" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  ...
```

3. **DELETE** .env.test after testing:
```bash
rm .env.test
git status  # Verify not staged
```

---

## 📊 Configuration States

### Not Configured (Missing .env.local):
```
Browser Console:
⚠️ Supabase not configured. Set VITE_PUBLIC_SUPABASE_URL and VITE_PUBLIC_SUPABASE_ANON_KEY in .env.local
Copy .env.example to .env.local and add your credentials

UI:
[Banner] Supabase not configured...
[Forms] Disabled with helper text
[Login] Error message with setup instructions
```

### Configured (.env.local present):
```
Browser Console:
(clean, no warnings)

UI:
[No banner]
[Forms] Fully functional
[Login] Works normally
```

---

## 🧪 Testing the Safe Initialization

### Test 1: Without Credentials
```bash
1. Rename .env.local to .env.local.backup
2. npm run dev
3. Open http://localhost:8080/
4. ✅ App loads (no crash)
5. ✅ Banner shows
6. ✅ Forms disabled
7. ✅ Console warning visible
```

### Test 2: With Credentials
```bash
1. Restore .env.local
2. npm run dev
3. Open http://localhost:8080/
4. ✅ No banner
5. ✅ All features work
6. ✅ Clean console
```

---

## 📝 Common Issues

### Issue: "Module not found" error
**Solution**: Restart dev server after creating .env.local

### Issue: Banner still shows
**Solution**: 
- Check .env.local is in project root (not in src/)
- Variables must start with `VITE_PUBLIC_`
- Restart server

### Issue: Login fails with "not configured"
**Solution**:
- Verify credentials are correct
- Check no extra spaces in .env.local
- URL should end with .supabase.co
- Key should be long base64 string

---

## ✅ Status

**Safe Initialization**: ✅ Implemented
**Null Guards**: ✅ Added
**Configuration Banner**: ✅ Created
**Security**: ✅ Verified
**Admin Create User**: ✅ Preserved (works with anon key)
**Service Role Key**: ✅ Not needed in frontend

**Ready for Development**: YES 🎯

---

_Safe, secure, and production-ready!_

