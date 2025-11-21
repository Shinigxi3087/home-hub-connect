import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Listing } from '@/types/database';
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Heart,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function ListingDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<{ full_name: string; email: string } | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchListing();
      if (user) checkFavorite();
    }
  }, [id, user]);

  const fetchListing = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setListing(data as Listing);

      // Fetch seller info
      const { data: sellerData, error: sellerError } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', data.seller_id)
        .single();

      if (sellerError) throw sellerError;
      setSeller(sellerData);
    } catch (error) {
      console.error('Error fetching listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to load listing',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', id)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !id) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to save favorites',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', id);

        if (error) throw error;
        setIsFavorite(false);
        toast({
          title: 'Removed from favorites',
          description: 'Property removed from your favorites'
        });
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: user.id,
            listing_id: id
          });

        if (error) throw error;
        setIsFavorite(true);
        toast({
          title: 'Added to favorites',
          description: 'Property saved to your favorites'
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive'
      });
    }
  };

  const handleContactSeller = () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to contact the seller',
        variant: 'destructive'
      });
      return;
    }

    // Navigate to messages page with the listing context
    navigate(`/messages?listing=${id}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
          <Button asChild>
            <Link to="/">Back to listings</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Image gallery */}
            <div className="mb-6">
              {listing.images && listing.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-lg col-span-full"
                  />
                  {listing.images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${listing.title} ${index + 2}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">No images available</span>
                </div>
              )}
            </div>

            {/* Property details */}
            <Card className="p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                  <div className="flex items-center text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{listing.address}, {listing.city}, {listing.state} {listing.zip_code}</span>
                  </div>
                </div>
                {listing.is_featured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>

              <div className="text-3xl font-bold text-primary mb-6">
                {formatPrice(listing.price)}
              </div>

              <div className="flex gap-6 mb-6">
                {listing.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{listing.bedrooms} beds</span>
                  </div>
                )}
                {listing.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">{listing.bathrooms} baths</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{listing.square_feet.toLocaleString()} sqft</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {listing.description}
                </p>
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-xl font-semibold mb-3">Property Features</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted-foreground">Property Type</span>
                    <p className="font-medium capitalize">{listing.property_type}</p>
                  </div>
                  {listing.year_built && (
                    <div>
                      <span className="text-muted-foreground">Year Built</span>
                      <p className="font-medium">{listing.year_built}</p>
                    </div>
                  )}
                  {listing.lot_size && (
                    <div>
                      <span className="text-muted-foreground">Lot Size</span>
                      <p className="font-medium">{listing.lot_size.toLocaleString()} sqft</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Status</span>
                    <p className="font-medium capitalize">{listing.status}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="p-6 sticky top-24">
              {seller && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Listed by</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {seller.full_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{seller.full_name}</p>
                      <p className="text-sm text-muted-foreground">{seller.email}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={handleContactSeller} 
                  className="w-full"
                  size="lg"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Seller
                </Button>
                
                <Button 
                  onClick={toggleFavorite}
                  variant={isFavorite ? "secondary" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  <Heart className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                  {isFavorite ? 'Saved' : 'Save Listing'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
