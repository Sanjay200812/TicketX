"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, X, Check, Star, Navigation, Trash2, Bookmark } from 'lucide-react';
import { useLocation, SUPPORTED_LOCATIONS } from '@/context/LocationContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { lookupPincode } from '@/lib/pincodeData';

export function CitySelectorModal() {
  const {
    selectedLocation,
    savedLocations,
    selectLocation,
    toggleSaveLocation,
    removeSavedLocation,
    isCityModalOpen,
    setIsCityModalOpen,
  } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [pincodeAlert, setPincodeAlert] = useState<string | null>(null);

  // Check if search query is a 6-digit PIN code
  const pincodeMatch = lookupPincode(searchQuery);

  const availableCities = SUPPORTED_LOCATIONS.filter((l) => l.bookingEnabled);
  const comingSoonCities = SUPPORTED_LOCATIONS.filter((l) => !l.bookingEnabled);

  const filteredAvailable = availableCities.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    if (pincodeMatch) return l.id === pincodeMatch.cityId;
    return (
      l.name.toLowerCase().includes(q) ||
      (l.shortName && l.shortName.toLowerCase().includes(q)) ||
      l.state.toLowerCase().includes(q)
    );
  });

  const filteredComingSoon = comingSoonCities.filter((l) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    if (pincodeMatch) return l.id === pincodeMatch.cityId;
    return l.name.toLowerCase().includes(q) || l.state.toLowerCase().includes(q);
  });

  // Handle "Use My Location" (Browser Geolocation API)
  // Requirement 2: Detecting location via GPS DOES NOT automatically save it
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setPincodeAlert('Geolocation is not supported by your browser.');
      return;
    }
    setGeoLoading(true);
    setPincodeAlert(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const { latitude, longitude } = position.coords;

        let matchedCity = SUPPORTED_LOCATIONS[0];
        if (latitude > 16.8 && latitude < 17.5) {
          const hyderabad = SUPPORTED_LOCATIONS.find((l) => l.id === 'hyderabad');
          if (hyderabad) matchedCity = hyderabad;
        } else if (latitude > 16.4 && latitude < 16.7) {
          const vijayawada = SUPPORTED_LOCATIONS.find((l) => l.id === 'vijayawada');
          if (vijayawada) matchedCity = vijayawada;
        } else if (latitude > 16.0 && latitude < 16.3 && longitude < 80.1) {
          const nrt = SUPPORTED_LOCATIONS.find((l) => l.id === 'nrt');
          if (nrt) matchedCity = nrt;
        }

        selectLocation(matchedCity);
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setPincodeAlert('Location permission was denied. Please select your city manually.');
        } else {
          setPincodeAlert('Unable to detect location. Please select your city from the list.');
        }
      },
      { timeout: 8000 }
    );
  };

  return (
    <AnimatePresence>
      {isCityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setIsCityModalOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-[#141414] border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl z-10 max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div>
                <h3 className="text-xl md:text-2xl font-bold font-heading text-white">Select City / Location</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Current Location: <span className="text-emerald-400 font-bold">{selectedLocation.name}</span>
                </p>
              </div>
              <button
                onClick={() => setIsCityModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH INPUT & BROWSER GEOLOCATION BUTTON */}
            <div className="flex flex-col sm:flex-row gap-2 my-4 shrink-0">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search City or 6-digit Indian PIN Code (e.g. 522001, Vijayawada)..."
                  className="pl-9 bg-secondary border-white/10 text-white text-xs"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPincodeAlert(null);
                  }}
                />
              </div>

              <Button
                variant="outline"
                onClick={handleUseMyLocation}
                disabled={geoLoading}
                className="rounded-xl border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-bold shrink-0 flex items-center gap-1.5"
              >
                <Navigation className={`w-3.5 h-3.5 ${geoLoading ? 'animate-spin' : ''}`} />
                {geoLoading ? 'Detecting...' : 'Use My Location'}
              </Button>
            </div>

            {pincodeAlert && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-medium">
                {pincodeAlert}
              </div>
            )}

            {/* PIN CODE MATCH BANNER */}
            {pincodeMatch && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs flex items-center justify-between">
                <div>
                  <span className="text-emerald-400 font-bold">PIN Code {pincodeMatch.pincode}: </span>
                  <span className="text-white font-bold">{pincodeMatch.cityName}</span> ({pincodeMatch.state})
                </div>
                <span className={`px-2 py-0.5 rounded font-mono font-bold ${pincodeMatch.isSupported ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {pincodeMatch.isSupported ? 'Available' : 'Coming Soon'}
                </span>
              </div>
            )}

            <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
              {/* SAVED LOCATIONS SECTION (Requirements 1, 4, 5) */}
              {!searchQuery && (
                <div className="bg-secondary/20 p-4 rounded-xl border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      SAVED LOCATIONS ({savedLocations.length})
                    </span>
                  </div>

                  {savedLocations.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {savedLocations.map((loc) => {
                        const isSelected = selectedLocation.id === loc.id;
                        return (
                          <div
                            key={`saved-${loc.id}`}
                            className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all ${
                              isSelected
                                ? 'bg-primary/20 border-primary text-primary shadow-lg'
                                : 'bg-secondary/40 border-white/10 text-gray-200'
                            }`}
                          >
                            <button
                              onClick={() => selectLocation(loc)}
                              className="flex items-center gap-2 flex-1 min-w-0 text-left"
                            >
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <div className="truncate">
                                <span className="font-bold text-white block truncate">{loc.name}</span>
                                <span className="text-[10px] text-emerald-400 font-semibold">Available</span>
                              </div>
                            </button>

                            <button
                              onClick={() => removeSavedLocation(loc.id)}
                              className="text-gray-400 hover:text-red-400 p-1.5 rounded-full hover:bg-white/5 transition-colors"
                              title="Remove from saved locations"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Requirement 4: Empty saved locations state */
                    <div className="text-center py-4 px-3 text-xs text-muted-foreground space-y-1">
                      <Bookmark className="w-6 h-6 mx-auto text-gray-500 mb-1" />
                      <p className="font-bold text-white">You haven&apos;t saved any locations yet.</p>
                      <p className="text-[11px] text-gray-400">
                        Search for a city below and tap the <Star className="w-3 h-3 inline text-amber-400 fill-amber-400" /> Save button to add it here.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* AVAILABLE TO BOOK SECTION */}
              {filteredAvailable.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      AVAILABLE TO BOOK
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredAvailable.map((loc) => {
                      const isSelected = selectedLocation.id === loc.id;
                      const isSaved = savedLocations.some((s) => s.id === loc.id);

                      return (
                        <div
                          key={loc.id}
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-sm font-medium transition-all group ${
                            isSelected
                              ? 'bg-primary/15 border-primary text-primary shadow-[0_0_15px_rgba(216,33,50,0.3)]'
                              : 'bg-secondary/40 border-white/10 text-gray-200 hover:border-emerald-500/50 hover:bg-secondary'
                          }`}
                        >
                          <button
                            onClick={() => selectLocation(loc)}
                            className="flex items-center gap-2.5 min-w-0 flex-1 text-left"
                          >
                            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                            <div className="truncate">
                              <div className="font-bold text-sm text-white group-hover:text-primary transition-colors truncate">
                                {loc.name} {loc.shortName ? `(${loc.shortName})` : ''}
                              </div>
                              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                                Available
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Star Save Button: Remove word 'Save' completely, keep clean star icon */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveLocation(loc.id);
                              }}
                              className="p-1.5 rounded-full hover:bg-white/10 transition-colors flex items-center justify-center focus:outline-none"
                              title={isSaved ? 'Remove saved location' : 'Save location'}
                              aria-label={isSaved ? 'Remove saved location' : 'Save location'}
                            >
                              <Star
                                className={`w-4 h-4 transition-all ${
                                  isSaved
                                    ? 'text-primary fill-primary drop-shadow-[0_0_6px_rgba(216,33,50,0.6)]'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                              />
                            </button>
                            {/* Separate Checkmark indicator for current active location */}
                            {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* OTHER INDIA CITIES (COMING SOON) */}
              {filteredComingSoon.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3 pt-2 border-t border-white/10">
                    <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                      OTHER INDIA CITIES (COMING SOON)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {filteredComingSoon.map((loc) => {
                      const isSelected = selectedLocation.id === loc.id;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => selectLocation(loc)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                              : 'bg-secondary/20 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-xs truncate text-white">{loc.name}</div>
                          <div className="text-[10px] text-emerald-400 font-semibold truncate">Coming Soon</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
