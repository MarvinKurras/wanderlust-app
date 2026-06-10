import { useQuery, useQueryClient } from '@tanstack/react-query';

import { ensureSession } from '@/lib/auth';
import { fetchPlaces } from '@/lib/places';
import { fetchUnlocks } from '@/lib/unlocks';

export const placesQueryKey = ['places'] as const;
export const unlocksQueryKey = ['unlocks'] as const;

export function usePlaces() {
  return useQuery({ queryKey: placesQueryKey, queryFn: fetchPlaces });
}

/** Eigene Freischaltungen — braucht eine (anonyme) Session für die RLS-Filterung. */
export function useUnlocks() {
  return useQuery({
    queryKey: unlocksQueryKey,
    queryFn: async () => {
      await ensureSession();
      return fetchUnlocks();
    },
  });
}

/** Gemeinsames Refresh für Pull-to-Refresh. */
export function useRefreshPlaces() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: placesQueryKey }),
      queryClient.invalidateQueries({ queryKey: unlocksQueryKey }),
    ]);
}
