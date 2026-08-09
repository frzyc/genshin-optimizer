/** Sort build entries so those from `srcTeamCharId` appear first. */
export function sortEntriesBySrcTeamCharId<
  T extends { srcTeamCharId?: string },
>(entries: [string, T][], srcTeamCharId?: string): [string, T][] {
  if (!srcTeamCharId) return entries
  const fromLoadout: [string, T][] = []
  const rest: [string, T][] = []
  for (const entry of entries) {
    if (entry[1].srcTeamCharId === srcTeamCharId) fromLoadout.push(entry)
    else rest.push(entry)
  }
  return [...fromLoadout, ...rest]
}
