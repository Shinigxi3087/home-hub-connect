import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { ListingCard } from '@/components/listings/ListingCard';
import { SearchFilters, SearchFilters as SearchFiltersType } from '@/components/listings/SearchFilters';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Listing } from '@/types/database';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [resultCount, setResultCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchListings = async (filters?: SearchFiltersType) => {
    setIsLoading(true);
    
    let query = supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');

    // Apply filters
    if (filters?.query) {
      query = query.or(`city.ilike.%${filters.query}%,state.ilike.%${filters.query}%,address.ilike.%${filters.query}%`);
    }

    if (filters?.priceMin) {
      query = query.gte('price', filters.priceMin);
    }

    if (filters?.priceMax) {
      query = query.lte('price', filters.priceMax);
    }

    if (filters?.bedrooms) {
      query = query.gte('bedrooms', filters.bedrooms);
    }

    if (filters?.propertyType) {
      query = query.eq('property_type', filters.propertyType);
    }

    // Sorting
    switch (filters?.sortBy) {
      case 'price_asc':
        query = query.order('price', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price', { ascending: false });
        break;
      case 'beds_desc':
        query = query.order('bedrooms', { ascending: false });
        break;
      case 'sqft_desc':
        query = query.order('square_feet', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching listings:', error);
    } else {
      setListings((data as Listing[]) || []);
      setResultCount(data?.length || 0);
    }

    setIsLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', user.id);

    if (data) {
      setFavorites(new Set(data.map(f => f.listing_id)));
    }
  };

  useEffect(() => {
    fetchListings();
    fetchFavorites();
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{resultCount} Results</h1>
          <p className="text-muted-foreground">in New York, US</p>
        </div>

        <SearchFilters onSearch={fetchListings} />

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isFavorite={favorites.has(listing.id)}
                onFavoriteChange={fetchFavorites}
              />
            ))}
          </div>
        )}

        {!isLoading && listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No listings found. Try adjusting your filters.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
