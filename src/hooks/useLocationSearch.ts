import { useState, useCallback, useRef, useEffect } from 'react';
import { Location } from '../types/weather';
import { searchLocations } from '../api/geocoding';

export function useLocationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const debouncedSearch = useCallback((query: string) => {
    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Set debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const locations = await searchLocations(query);
        setSuggestions(locations);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, []);

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
    isLoading,
    setSearchTerm,
    getSuggestions: debouncedSearch,
    handleKeyDown,
    clearSuggestions
  };
}