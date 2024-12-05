import { useState, useCallback } from 'react';
import { Location } from '../types/weather';
import { searchLocations } from '../api/geocoding';
import debounce from 'lodash/debounce';

export function useLocationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const locations = await searchLocations(query);
        setSuggestions(locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    onSelect: (location: Location) => void
  ) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          onSelect(suggestions[selectedIndex]);
          setSearchTerm('');
          setSuggestions([]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setSuggestions([]);
        break;
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  return {
    searchTerm,
    suggestions,
    selectedIndex,
    setSearchTerm,
    getSuggestions: debouncedSearch,
    handleKeyDown,
    clearSuggestions
  };
}