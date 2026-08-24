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
  locationDetecting: boolean;
  detectionMessage: string | null;
  permissionDenied: boolean;
  requestAutomaticGeolocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Accurate coordinate lookup for TicketX supported regions
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  guntur: { lat: 16.3067, lng: 80.4365 },
  vijayawada: { lat: 16.5062, lng: 80.648 },
  nrt: { lat: 16.2354, lng: 80.0494 },
  sattenapalli: { lat: 16.3957, lng: 80.1472 },
  edlapadu: { lat: 16.1432, lng: 80.2588 },
  martur: { lat: 15.9922, lng: 80.1166 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  tirupati: { lat: 13.6288, lng: 79.4192 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
};

// Haversine formula
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius km
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

  // Auto-detection feedback states (Requirements 5, 6, 7, 8)
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [detectionMessage, setDetectionMessage] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const storageKey = user?.id ? `ticketx_saved_locations_${user.id}` : 'ticketx_saved_locations_guest';

  const performGeolocationLookup = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) return;

    setLocationDetecting(true);
    setDetectionMessage('Detecting your location...');
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        let closestLoc = SUPPORTED_LOCATIONS[0];
        let minDistance = Infinity;

        SUPPORTED_LOCATIONS.forEach((loc) => {
          const coords = CITY_COORDS[loc.id] || { lat: 16.3067, lng: 80.4365 };
          const dist = getDistanceKm(latitude, longitude, coords.lat, coords.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closestLoc = loc;
          }
        });

        // Set detected current location without auto-saving to Saved Locations (Requirement 8)
        setSelectedLocationState(closestLoc);
        setIsGeolocation(true);
        localStorage.setItem('ticketx_location_id', closestLoc.id);

        setLocationDetecting(false);
        setDetectionMessage(`${closestLoc.name} detected`);
        setTimeout(() => setDetectionMessage(null), 3000);
      },
      (err) => {
        setLocationDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          setDetectionMessage('Location access was not enabled.');
        } else {
          setDetectionMessage(null);
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    // 1. Check if user previously selected a city
    const savedLocId = localStorage.getItem('ticketx_location_id');
    if (savedLocId) {
      const match = SUPPORTED_LOCATIONS.find((l) => l.id === savedLocId);
      if (match) {
        setSelectedLocationState(match);
      }
    } else {
      // 2. First load -> automatic geolocation if permission allowed
      performGeolocationLookup();
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
        locationDetecting,
        detectionMessage,
        permissionDenied,
        requestAutomaticGeolocation: performGeolocationLookup,
      }}
    >
      {/* Non-blocking top location detection banner */}
      {detectionMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-emerald-500/95 text-white font-bold text-xs px-5 py-2 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          <span>{detectionMessage}</span>
        </div>
      )}
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
