import type { Cinema, Movie } from './types';

/**
 * One listed show, as captured from District:
 * [movie id, cinema id, date, time, auditorium, format, language, tag, [[class, price, seats, seats free], …]]
 */
export type RawSession = [number, number, string, string, string, string, string, string, [string, number, number, number][]];

/** Everything the browser needs for one city */
export type CityPayload = {
  city: string;
  fetchedAt: string;
  movies: Movie[];
  cinemas: Cinema[];
  sessions: RawSession[];
};
