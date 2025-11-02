import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorDebugModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  error: {
    message?: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
  title?: string;
}

export function ErrorDebugModal({ open, onOpenChange, error, title = "Error Details" }: ErrorDebugModalProps) {
  if (!error) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Review the error details below. Contact support if the issue persists.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* User-Friendly Message */}
          {error.message && (
            <Alert variant="destructive">
              <AlertDescription>
                <strong>Error:</strong> {error.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Technical Details */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Technical Details</h4>
            <div className="bg-muted p-4 rounded-md space-y-2 font-mono text-xs">
              {error.code && (
                <div>
                  <span className="text-muted-foreground">Code:</span>{' '}
                  <span className="text-foreground">{error.code}</span>
                </div>
              )}
              {error.details && (
                <div>
                  <span className="text-muted-foreground">Details:</span>{' '}
                  <span className="text-foreground">{error.details}</span>
                </div>
              )}
              {error.hint && (
                <div>
                  <span className="text-muted-foreground">Hint:</span>{' '}
                  <span className="text-foreground">{error.hint}</span>
                </div>
              )}
            </div>
          </div>

          {/* Common Solutions */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Common Solutions</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              {error.code === '23505' && (
                <li>This item already exists. Try a different name or check for duplicates.</li>
              )}
              {error.code === '23503' && (
                <li>Referenced item not found. Ensure all selections are valid.</li>
              )}
              {error.code === '23502' && (
                <li>Required field is missing. Fill all mandatory fields marked with *.</li>
              )}
              {error.code === '42501' && (
                <li>Permission denied. Contact your administrator for access.</li>
              )}
              {!error.code && (
                <>
                  <li>Check that all required fields are filled correctly</li>
                  <li>Ensure you have the necessary permissions</li>
                  <li>Try refreshing the page and attempting again</li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(error, null, 2));
              alert('Error details copied to clipboard');
            }}
          >
            Copy Details
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

