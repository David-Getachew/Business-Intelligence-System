import { createClient } from '@supabase/supabase-js';

interface RequestBody {
  email: string;
  full_name: string;
  role: 'owner' | 'staff';
  password?: string;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = process.env.VITE_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Extract and validate the token
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    const { data: { user }, error: tokenError } = await supabaseAdmin.auth.getUser(token);
    
    if (tokenError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has admin role
    if (user.user_metadata?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
    const body: RequestBody = await req.json();
    const { email, full_name, role, password } = body;

    if (!email || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, full_name, role' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Cryptographically secure password generation
    const generateSecurePassword = () => {
      const crypto = require('crypto');
      const lowercase = 'abcdefghijklmnopqrstuvwxyz';
      const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const digits = '0123456789';
      const symbols = '!@#$%^&*';
      const allChars = lowercase + uppercase + digits + symbols;
      
      // Ensure at least one character from each class
      let password = '';
      password += lowercase[crypto.randomInt(0, lowercase.length)];
      password += uppercase[crypto.randomInt(0, uppercase.length)];
      password += digits[crypto.randomInt(0, digits.length)];
      password += symbols[crypto.randomInt(0, symbols.length)];
      
      // Fill remaining characters
      for (let i = 4; i < 12; i++) {
        password += allChars[crypto.randomInt(0, allChars.length)];
      }
      
      // Fisher-Yates shuffle with crypto randomness
      const passwordArray = password.split('');
      for (let i = passwordArray.length - 1; i > 0; i--) {
        const j = crypto.randomInt(0, i + 1);
        [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
      }
      
      return passwordArray.join('');
    };

    const tempPassword = password || generateSecurePassword();

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
      },
    });

    if (authError) throw authError;

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert([
      {
        id: authData.user.id,
        email,
        full_name,
        role,
      },
    ]);

    if (profileError) {
      // Rollback: delete the created user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }
    return new Response(
      JSON.stringify({
        success: true,
        user_id: authData.user.id,
        message: 'User created successfully',
        temp_password: password ? undefined : tempPassword,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error creating user:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to create user' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

