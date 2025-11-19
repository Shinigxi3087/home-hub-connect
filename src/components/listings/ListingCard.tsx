import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Listing } from '@/types/database';
import { Bed, Bath, Maximize, Heart, MapPin, Home } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ListingCardProps {
  listing: Listing;
  isFavorite?: boolean;
  onFavoriteChange?: () => void;
}

export const ListingCard = ({ listing, isFavorite = false, onFavoriteChange }: ListingCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsTogglingFavorite(true);

    if (isFavorite) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to remove from favorites',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Removed from favorites' });
        onFavoriteChange?.();
      }
    } else {
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listing.id });

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to add to favorites',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Added to favorites' });
        onFavoriteChange?.();
      }
    }

    setIsTogglingFavorite(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link to={`/listings/${listing.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-[4/3] overflow-hidden">
          {listing.images.length > 0 ? (
            <img
              src={listing.images[0]}
              alt={listing.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <Home className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          
          <div className="absolute top-3 left-3 flex gap-2">
            {listing.is_featured && (
              <Badge className="bg-primary text-primary-foreground">Perfect Fit</Badge>
            )}
            <Badge variant="secondary">16H ago</Badge>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-background/80 hover:bg-background"
            onClick={handleToggleFavorite}
            disabled={isTogglingFavorite}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-primary text-primary' : 'text-foreground'}`}
            />
          </Button>
        </div>

        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Bed className="w-4 h-4" />
              <span>{listing.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Bath className="w-4 h-4" />
              <span>{listing.bathrooms} Baths</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Maximize className="w-4 h-4" />
              <span>{listing.square_feet.toLocaleString()} Ft</span>
            </div>
          </div>

          <h3 className="font-bold text-2xl mb-1">{formatPrice(listing.price)}</h3>
          
          <div className="flex items-start gap-1 text-sm text-muted-foreground mb-1">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="line-clamp-1">{listing.address}</p>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {listing.city}, {listing.state} {listing.zip_code}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
