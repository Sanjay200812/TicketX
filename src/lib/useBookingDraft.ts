'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTicketX } from '@/context/TicketXContext';
import { useCatalog } from '@/context/CatalogContext';
import { getShow } from './shows';

/** Loads the show for a booking step and sends the user back to seat selection if there is no valid hold. */
export function useBookingDraft(showId: string) {
  const router = useRouter();
  const { draft, hydrated } = useTicketX();
  const { index } = useCatalog();
  const data = getShow(index, showId);
  const valid = !!data && draft?.showId === showId && draft.seats.length > 0 && !!draft.holdUntil && draft.holdUntil > Date.now();

  useEffect(() => {
    if (hydrated && !valid) router.replace(data ? `/book/${showId}` : '/movies');
  }, [hydrated, valid, router, showId, data]);

  return { data, draft: valid ? draft! : null, ready: hydrated && valid };
}
