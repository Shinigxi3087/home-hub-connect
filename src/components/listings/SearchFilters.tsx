import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  query: string;
  priceMin?: number;
  priceMax?: number;
  bedrooms?: number;
  propertyType?: string;
  sortBy: string;
}

export const SearchFilters = ({ onSearch }: SearchFiltersProps) => {
  const [query, setQuery] = useState('');
  const [priceRange, setPriceRange] = useState('any');
  const [bedrooms, setBedrooms] = useState('any');
  const [propertyType, setPropertyType] = useState('any');
  const [sortBy, setSortBy] = useState('newest');

  const handleSearch = () => {
    const filters: SearchFilters = {
      query,
      sortBy,
    };

    if (bedrooms !== 'any') {
      filters.bedrooms = parseInt(bedrooms);
    }

    if (propertyType !== 'any') {
      filters.propertyType = propertyType;
    }

    if (priceRange !== 'any') {
      const [min, max] = priceRange.split('-').map(Number);
      filters.priceMin = min;
      filters.priceMax = max;
    }

    onSearch(filters);
  };

  return (
    <div className="bg-card rounded-xl border p-4 mb-6 space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Select value={priceRange} onValueChange={setPriceRange}>
          <SelectTrigger>
            <SelectValue placeholder="Any Price" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Price</SelectItem>
            <SelectItem value="0-200000">Under $200k</SelectItem>
            <SelectItem value="200000-400000">$200k - $400k</SelectItem>
            <SelectItem value="400000-600000">$400k - $600k</SelectItem>
            <SelectItem value="600000-1000000">$600k - $1M</SelectItem>
            <SelectItem value="1000000-999999999">Over $1M</SelectItem>
          </SelectContent>
        </Select>

        <Select value={bedrooms} onValueChange={setBedrooms}>
          <SelectTrigger>
            <SelectValue placeholder="Bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any Beds</SelectItem>
            <SelectItem value="1">1+ Beds</SelectItem>
            <SelectItem value="2">2+ Beds</SelectItem>
            <SelectItem value="3">3+ Beds</SelectItem>
            <SelectItem value="4">4+ Beds</SelectItem>
            <SelectItem value="5">5+ Beds</SelectItem>
          </SelectContent>
        </Select>

        <Select value={propertyType} onValueChange={setPropertyType}>
          <SelectTrigger>
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">All Types</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="condo">Condo</SelectItem>
            <SelectItem value="townhouse">Townhouse</SelectItem>
            <SelectItem value="land">Land</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
            <SelectItem value="beds_desc">Most Bedrooms</SelectItem>
            <SelectItem value="sqft_desc">Largest Sqft</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
