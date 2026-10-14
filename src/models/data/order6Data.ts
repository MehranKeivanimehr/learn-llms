/** What each word "shares" when attended to: [is-dog, is-man]. */
export const VALUES: Record<string, [number, number]> = {
  dog: [1, 0],
  man: [0, 1],
  bites: [0, 0],
};

/** The question "who got hurt?" as a query. It matches the position right after the verb. */
export const QUERY: [number, number] = [1, -1];
