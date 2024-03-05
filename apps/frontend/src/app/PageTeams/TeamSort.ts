import type { SortConfigs } from '@genshin-optimizer/common/util'
import type { Team, TeamSortKey } from '@genshin-optimizer/gi/db'

export function teamSortConfigs(): SortConfigs<TeamSortKey, Team> {
  return {
    name: (team) => team.name ?? '',
    lastEdit: (team) => team.lastEdit ?? 0,
  }
}

export const teamSortMap: Record<TeamSortKey, TeamSortKey[]> = {
  name: ['name', 'lastEdit'],
  lastEdit: ['lastEdit'],
}
