import { useState } from 'react';
import { Plus, Image as ImageIcon, Upload, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface MenuItemCardProps {
  item: {
    id: number;
    name: string;
    price: number;
    category: string;
    image_url?: string;
  };
  onAdd: () => void;
  onImageUploaded?: () => void;
}

export function MenuItemCard({ item, onAdd, onImageUploaded }: MenuItemCardProps) {
  const { session } = useAuth();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !session || uploading) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('menu_item_id', item.id.toString());

      const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
      const response = await fetch(
        `${supabaseUrl}/functions/v1/upload-menu-item-image`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      // Check if response is successful
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Check if we received a public URL
      if (!data.publicUrl) {
        throw new Error('Upload succeeded but no image URL was returned');
      }

      toast.success('Image uploaded successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
      onImageUploaded?.();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  return (
    <>
      <Card className="overflow-hidden hover:shadow-glow transition-shadow h-full flex flex-col">
        {/* Image Section */}
        <div className="relative w-full aspect-square bg-muted flex items-center justify-center overflow-hidden group">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <span className="text-xs">No image</span>
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={!session}
          >
            <Upload className="h-4 w-4 mr-1" />
            {item.image_url ? 'Edit Image' : 'Add Image'}
          </Button>
        </div>
        {/* Content Section */}
        <CardContent className="flex-1 flex flex-col p-3">
          <div className="flex-1 mb-3">
            <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
            <Badge variant="secondary" className="mt-1 text-xs">
              {item.category}
            </Badge>
          </div>

          {/* Price and Add Button */}
          <div className="flex items-center justify-between gap-2">
            <div className="text-lg font-bold text-primary">
              {item.price.toFixed(2)} Birr
            </div>
            <Button
              size="sm"
              onClick={onAdd}
              className="gradient-primary h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload an image for {item.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full text-sm"
              />
            </div>
            {selectedFile && (
              <div className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              className="gradient-primary"
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}