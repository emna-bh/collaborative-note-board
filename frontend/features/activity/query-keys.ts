export const ACTIVITY_FEED_FETCH_LIMIT = 50;
export const ACTIVITY_FEED_VISIBLE_COUNT = 3;

export const activitiesKeys = {
  all: ['activities'] as const,
  list: (limit = ACTIVITY_FEED_FETCH_LIMIT) => ['activities', limit] as const,
};
