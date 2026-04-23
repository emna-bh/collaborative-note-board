import { apiClient } from '@/lib/api-client';
import type { Activity } from './types';
import { ACTIVITY_FEED_FETCH_LIMIT } from './query-keys';

export function getActivities(limit = ACTIVITY_FEED_FETCH_LIMIT): Promise<Activity[]> {
  const searchParams = new URLSearchParams({
    limit: String(limit),
  });

  return apiClient<Activity[]>(`/activities?${searchParams.toString()}`, {
    method: 'GET',
  });
}
