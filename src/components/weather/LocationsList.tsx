import { useWeatherStore } from '../../store/useWeatherStore';
import { LocationCard } from './LocationCard';
import { Location } from '../../types/weather';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '../ui/Button';
import { ListReorder } from 'lucide-react';

export function LocationsList() {
  const locations = useWeatherStore((state) => state.locations);
  const showOnlyFavorites = useWeatherStore((state) => state.showOnlyFavorites);
  const isFavorite = useWeatherStore((state) => state.isFavorite);
  const sortByFavorites = useWeatherStore((state) => state.sortByFavorites);
  const toggleSortByFavorites = useWeatherStore((state) => state.toggleSortByFavorites);
  const locationOrder = useWeatherStore((state) => state.locationOrder);
  const reorderLocations = useWeatherStore((state) => state.reorderLocations);

  // Filter locations based on favorites setting
  const filteredLocations = showOnlyFavorites
    ? locations.filter((location) => isFavorite(location.id))
    : locations;

  // Sort locations based on custom order and favorites preference
  const sortedLocations = [...filteredLocations].sort((a, b) => {
    if (sortByFavorites) {
      const aIsFavorite = isFavorite(a.id);
      const bIsFavorite = isFavorite(b.id);
      if (aIsFavorite !== bIsFavorite) {
        return aIsFavorite ? -1 : 1;
      }
    }
    
    const aIndex = locationOrder.indexOf(a.id);
    const bIndex = locationOrder.indexOf(b.id);
    
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    reorderLocations(sourceIndex, destinationIndex);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => toggleSortByFavorites()}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <ListReorder className="w-4 h-4" />
          {sortByFavorites ? 'Custom Order' : 'Sort by Favorites'}
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="locations">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {sortedLocations.map((location: Location, index: number) => (
                <Draggable
                  key={location.id}
                  draggableId={location.id}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`transition-transform ${
                        snapshot.isDragging ? 'scale-105' : ''
                      }`}
                    >
                      <LocationCard location={location} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
} 