import { Plus, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MenuItemCardProps {
  item: {
    id: number;
    name: string;
    price: number;
    category: string;
    image?: string;
  };
  onAdd: () => void;
}

export function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-glow transition-shadow h-full flex flex-col">
      {/* Image Section */}
      <div className="relative w-full aspect-square bg-muted flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8" />
            <span className="text-xs">No image</span>
          </div>
        )}
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
  );
}