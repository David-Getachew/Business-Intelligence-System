import { ReactNode } from 'react';
import { isSupabaseConfigured } from '@/lib/supabase';
import { SupabaseConfigBanner } from '../SupabaseConfigBanner';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface SupabaseGuardProps {
  children: ReactNode;
  showBanner?: boolean;
}

export function SupabaseGuard({ children, showBanner = true }: SupabaseGuardProps) {
  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-4">
        {showBanner && <SupabaseConfigBanner />}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configuration Required</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                This feature requires Supabase configuration. Copy <code className="bg-muted px-1 rounded">.env.example</code> to{' '}
                <code className="bg-muted px-1 rounded">.env.local</code> and add your Supabase credentials.
              </p>
              <p className="text-sm text-muted-foreground">
                After updating the file, restart the dev server.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showBanner && <SupabaseConfigBanner />}
      {children}
    </>
  );
}

