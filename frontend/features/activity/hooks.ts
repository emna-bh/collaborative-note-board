'use client';

import { useQuery } from '@tanstack/react-query';
import { getActivities } from './api';
import { ACTIVITY_FEED_FETCH_LIMIT, activitiesKeys } from './query-keys';

export function useActivities(
  enabled = true,
  limit = ACTIVITY_FEED_FETCH_LIMIT
) {
  return useQuery({
    queryKey: activitiesKeys.list(limit),
    queryFn: () => getActivities(limit),
    enabled,
  });
}
