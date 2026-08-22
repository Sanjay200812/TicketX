"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TicketXLocation, City } from '@/types/location';
import { locations } from '@/data/locations';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<TicketXLocation>(SUPPORTED_LOCATIONS[0]);
  // Requirement 1, 4: Default saved locations MUST BE EMPTY (no default pre-populated cities)
  const [savedLocationIds, setSavedLocationIds] = useState<string[]>([]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const storageKey = user?.id ? `ticketx_saved_locations_${user.id}` : 'ticketx_saved_locations_guest';

  useEffect(() => {
    // Load last selected city
    const savedLoc = localStorage.getItem('ticketx_location_id');
    if (savedLoc) {
      const match = SUPPORTED_LOCATIONS.find((l) => l.id === savedLoc);
      if (match) {
        setSelectedLocation(match);
      }
    }

    // Requirement 3: User-controlled saved locations per user account
    const savedList = localStorage.getItem(storageKey);
    if (savedList) {
      try {
        setSavedLocationIds(JSON.parse(savedList));
      } catch (e) {
        console.error(e);
        setSavedLocationIds([]);
      }
    } else {
      setSavedLocationIds([]);
    }
  }, [storageKey]);

  // Requirement 2: Selecting a city DOES NOT automatically save it
  const selectLocation = (loc: TicketXLocation) => {
    setSelectedLocation(loc);
    localStorage.setItem('ticketx_location_id', loc.id);
    setIsCityModalOpen(false);
  };

  const selectCity = (city: City) => {
    const match = SUPPORTED_LOCATIONS.find((l) => l.id === city.id) || SUPPORTED_LOCATIONS[0];
    selectLocation(match);
  };

  // Requirement 2: Saving MUST be an explicit user action
  const toggleSaveLocation = (locationId: string) => {
    setSavedLocationIds((prev) => {
      const isSaved = prev.includes(locationId);
      const updated = isSaved ? prev.filter((id) => id !== locationId) : [...prev, locationId];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
  };

  const removeSavedLocation = (locationId: string) => {
    setSavedLocationIds((prev) => {
      const updated = prev.filter((id) => id !== locationId);
      localStorage.setItem(storageKey, JSON.stringify(updated));
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
