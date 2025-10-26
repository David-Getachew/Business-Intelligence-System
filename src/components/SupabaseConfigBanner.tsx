import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function SupabaseConfigBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert variant="destructive" className="mb-4 relative">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="pr-8">
        <strong>Supabase not configured.</strong> Set <code className="bg-destructive/20 px-1 rounded">VITE_PUBLIC_SUPABASE_URL</code> and{' '}
        <code className="bg-destructive/20 px-1 rounded">VITE_PUBLIC_SUPABASE_ANON_KEY</code> in <code className="bg-destructive/20 px-1 rounded">.env.local</code> file.
        Data features are disabled. See README for setup instructions.
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}

