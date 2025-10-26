# Serverless API Functions

This directory contains serverless API functions that require service role access to Supabase.

## Deployment

### Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard:
   - `VITE_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Netlify

1. Create `netlify.toml` in project root:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
     functions = "api"
   ```

2. Deploy using Netlify CLI or GitHub integration

3. Set environment variables in Netlify dashboard

### Supabase Edge Functions (Alternative)

For better integration, consider deploying these as Supabase Edge Functions:

```bash
supabase functions deploy create-user
```

## Available Endpoints

### POST /api/users/create

Creates a new user with Supabase Auth and profiles table entry.

**Request:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "staff",
  "password": "optional-password"
}
```

**Response:**
```json
{
  "success": true,
  "user_id": "uuid",
  "message": "User created successfully",
  "temp_password": "generated-if-no-password-provided"
}
```

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Always validate and sanitize inputs
- Implement rate limiting in production
- Use HTTPS only
- Consider adding authentication middleware to verify only admins can create users

