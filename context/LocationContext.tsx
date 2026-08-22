"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TicketXLocation, City } from '@/types/location';
import { locations } from '@/data/locations';

export const SUPPORTED_LOCATIONS: TicketXLocation[] = locations;

export const POPULAR_CITIES: City[] = locations.map((loc) => ({
  id: loc.id,
  name: loc.name,
  state: loc.state,
  lat: 16.3067,
  lng: 80.4365,
  isPopular: loc.isPopular,
  bookingEnabled: loc.bookingEnabled,
}));

interface LocationContextType {
  location: {
    city: City;
    location: TicketXLocation;
    isGeolocation: boolean;
  };
  selectedLocation: TicketXLocation;
  savedLocations: TicketXLocation[];
  selectLocation: (location: TicketXLocation) => void;
  selectCity: (city: City) => void;
  toggleSaveLocation: (locationId: string) => void;
  removeSavedLocation: (locationId: string) => void;
  isCityModalOpen: boolean;
  setIsCityModalOpen: (open: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<TicketXLocation>(SUPPORTED_LOCATIONS[0]);
  const [savedLocationIds, setSavedLocationIds] = useState<string[]>(['guntur', 'vijayawada', 'nrt']);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('ticketx_location_id');
    if (saved) {
      const match = SUPPORTED_LOCATIONS.find((l) => l.id === saved);
      if (match) {
        setSelectedLocation(match);
      }
    }

    const savedList = localStorage.getItem('ticketx_saved_locations');
    if (savedList) {
      try {
        setSavedLocationIds(JSON.parse(savedList));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const selectLocation = (loc: TicketXLocation) => {
    setSelectedLocation(loc);
    localStorage.setItem('ticketx_location_id', loc.id);
    setIsCityModalOpen(false);
  };

  const selectCity = (city: City) => {
    const match = SUPPORTED_LOCATIONS.find((l) => l.id === city.id) || SUPPORTED_LOCATIONS[0];
    selectLocation(match);
  };

  const toggleSaveLocation = (locationId: string) => {
    setSavedLocationIds((prev) => {
      const isSaved = prev.includes(locationId);
      const updated = isSaved ? prev.filter((id) => id !== locationId) : [...prev, locationId];
      localStorage.setItem('ticketx_saved_locations', JSON.stringify(updated));
      return updated;
    });
  };

  const removeSavedLocation = (locationId: string) => {
    setSavedLocationIds((prev) => {
      const updated = prev.filter((id) => id !== locationId);
      localStorage.setItem('ticketx_saved_locations', JSON.stringify(updated));
      return updated;
    });
  };

  const savedLocations = SUPPORTED_LOCATIONS.filter((loc) => savedLocationIds.includes(loc.id));

  const city: City = {
    id: selectedLocation.id,
    name: selectedLocation.name,
    state: selectedLocation.state,
    lat: 16.3067,
    lng: 80.4365,
    isPopular: selectedLocation.isPopular,
    bookingEnabled: selectedLocation.bookingEnabled,
  };

  return (
    <LocationContext.Provider
      value={{
        location: {
          city,
          location: selectedLocation,
          isGeolocation: false,
        },
        selectedLocation,
        savedLocations,
        selectLocation,
        selectCity,
        toggleSaveLocation,
        removeSavedLocation,
        isCityModalOpen,
        setIsCityModalOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
