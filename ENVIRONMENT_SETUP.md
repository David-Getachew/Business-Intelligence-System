# Environment Variables Setup Guide

## Quick Start

1. **Open the `.env.local` file** (already created in your project root)

2. **Get your Supabase credentials:**
   - Go to [supabase.com](https://supabase.com)
   - Open your project
   - Click **Settings** in the left sidebar
   - Click **API** in the settings menu

3. **Copy the values:**

   ### Project URL
   - Look for **Project URL** section
   - Copy the URL (looks like: `https://xxxxx.supabase.co`)
   - Replace `REPLACE_WITH_YOUR_PROJECT_ID` in `.env.local`
   
   ```env
   VITE_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   ```

   ### Anon Key
   - Scroll to **Project API keys**
   - Find the **anon** / **public** key
   - Click the copy icon (👁️ eye icon to reveal, then copy)
   - Replace `REPLACE_WITH_YOUR_ANON_KEY` in `.env.local`
   
   ```env
   VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
   ```

4. **Save the file**

5. **Restart your dev server:**
   ```bash
   # Press Ctrl+C in terminal to stop
   npm run dev
   ```

## Visual Guide

### Finding Your Credentials in Supabase Dashboard

```
Supabase Dashboard
├── Settings (left sidebar)
│   └── API
│       ├── Project URL: https://your-project.supabase.co  ← Copy this
│       └── Project API keys
│           ├── anon / public: eyJhbGc... ← Copy this
│           └── service_role: eyJhbGc... ⚠️ DO NOT use in frontend!
```

## Example `.env.local` File

After configuration, your file should look like:

```env
VITE_PUBLIC_SUPABASE_URL=https://abcxyzqwerty123.supabase.co
VITE_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY3h5enF3ZXJ0eTEyMyIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNjkwMDAwMDAwLCJleHAiOjIwMDU1NzYwMDB9.EXAMPLE_KEY_STRING_HERE
```

## Verification

To check if your environment is configured correctly:

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Check the browser console:**
   - Open DevTools (F12)
   - Look for any errors about "Missing Supabase environment variables"
   - If you see this error, double-check your `.env.local` file

3. **Test the connection:**
   - Navigate to `http://localhost:5173/login`
   - Try to sign in with a test user
   - If you see connection errors, verify your Supabase URL and key

## Troubleshooting

### Error: "Missing Supabase environment variables"

**Solution:**
1. Check that `.env.local` exists in your project root
2. Verify the variable names are exactly:
   - `VITE_PUBLIC_SUPABASE_URL`
   - `VITE_PUBLIC_SUPABASE_ANON_KEY`
3. Ensure you replaced the placeholder values
4. Restart the dev server

### Error: "Invalid API key"

**Solution:**
1. Double-check you copied the **anon/public** key (not service_role)
2. Ensure you copied the entire key (they're very long!)
3. No spaces before or after the key
4. Regenerate the key in Supabase if needed

### Error: "Failed to fetch"

**Solution:**
1. Check your internet connection
2. Verify the project URL is correct
3. Ensure your Supabase project is active (not paused)

## For Production Deployment

When deploying to Vercel, Netlify, or other platforms:

### 1. Add Environment Variables in Platform Dashboard

**Vercel:**
- Go to Project Settings → Environment Variables
- Add both variables
- Redeploy

**Netlify:**
- Go to Site Settings → Environment Variables
- Add both variables
- Trigger new deploy

### 2. Add Service Role Key (for serverless functions)

⚠️ **Only for serverless functions, NOT in frontend!**

Add this variable in your hosting platform (NOT in `.env.local`):

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Find it at: Supabase Dashboard → Settings → API → service_role key

## Security Best Practices

✅ **DO:**
- Use `.env.local` for local development
- Add environment variables via hosting platform UI
- Keep `.env.local` in `.gitignore`
- Use different Supabase projects for dev/staging/production

❌ **DON'T:**
- Commit `.env.local` to Git
- Share your keys in public channels
- Use service_role key in frontend code
- Hardcode credentials in source files

## Need Help?

- **Supabase Docs:** [supabase.com/docs/guides/api](https://supabase.com/docs/guides/api)
- **Vite Env Docs:** [vitejs.dev/guide/env-and-mode.html](https://vitejs.dev/guide/env-and-mode.html)
- **Check browser console** for specific error messages
- **Review Supabase logs** in Dashboard → Logs

---

After configuring your environment, proceed to [SETUP.md](./SETUP.md) for database setup instructions.

