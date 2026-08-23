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

// Geolocation distance helper (Haversine formula)
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [selectedLocationState, setSelectedLocationState] = useState<TicketXLocation | null>(null);
  const [isGeolocation, setIsGeolocation] = useState<boolean>(false);
  const [savedLocationIds, setSavedLocationIds] = useState<string[]>([]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);

  const storageKey = user?.id ? `ticketx_saved_locations_${user.id}` : 'ticketx_saved_locations_guest';

  useEffect(() => {
    // 1. Check if user previously selected a city
    const savedLocId = localStorage.getItem('ticketx_location_id');
    if (savedLocId) {
      const match = SUPPORTED_LOCATIONS.find((l) => l.id === savedLocId);
      if (match) {
        setSelectedLocationState(match);
      }
    } else {
      // 2. Requirement 3: First load -> request location permission
      if (typeof window !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            // Map lat/lng to nearest supported city
            let closestLoc = SUPPORTED_LOCATIONS[0];
            let minDistance = Infinity;

            // City coordinates map
            const cityCoords: Record<string, { lat: number; lng: number }> = {
              guntur: { lat: 16.3067, lng: 80.4365 },
              vijayawada: { lat: 16.5062, lng: 80.648 },
              narsaraopet: { lat: 16.2354, lng: 80.0494 },
              visakhapatnam: { lat: 17.6868, lng: 83.2185 },
              hyderabad: { lat: 17.385, lng: 78.4867 },
              tirupati: { lat: 13.6288, lng: 79.4192 },
            };

            SUPPORTED_LOCATIONS.forEach((loc) => {
              const coords = cityCoords[loc.id] || { lat: 16.3067, lng: 80.4365 };
              const dist = getDistanceKm(latitude, longitude, coords.lat, coords.lng);
              if (dist < minDistance) {
                minDistance = dist;
                closestLoc = loc;
              }
            });

            setSelectedLocationState(closestLoc);
            setIsGeolocation(true);
            localStorage.setItem('ticketx_location_id', closestLoc.id);
          },
          () => {
            // Geolocation denied -> open city selector modal for user choice
            setIsCityModalOpen(true);
          },
          { timeout: 5000 }
        );
      } else {
        setIsCityModalOpen(true);
      }
    }

    // Load saved locations list
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

  const selectLocation = (loc: TicketXLocation) => {
    setSelectedLocationState(loc);
    setIsGeolocation(false);
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

  const selectedLocation = selectedLocationState || SUPPORTED_LOCATIONS[0];

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
          isGeolocation,
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
