"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Movie } from '@/types/movie';
import { movies } from '@/data/movies';

interface FavoritesContextType {
  favoriteIds: string[];
  favoriteMovies: Movie[];
  isFavorite: (movieId: string) => boolean;
  toggleFavorite: (movieId: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const FAVORITES_STORAGE_KEY = 'ticketx_favorites';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading favorites:', e);
    }
  }, []);

  const toggleFavorite = (movieId: string) => {
    setFavoriteIds((prev) => {
      let updated: string[];
      if (prev.includes(movieId)) {
        updated = prev.filter((id) => id !== movieId);
      } else {
        updated = [...prev, movieId];
      }
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving favorites:', e);
      }
      return updated;
    });
  };

  const isFavorite = (movieId: string) => favoriteIds.includes(movieId);

  const favoriteMovies = movies.filter((m) => favoriteIds.includes(m.id));

  return (
    <FavoritesContext.Provider value={{ favoriteIds, favoriteMovies, isFavorite, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
