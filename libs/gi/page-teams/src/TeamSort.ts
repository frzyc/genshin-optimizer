import {
  type FilterConfigs,
  type SortConfigs,
  notEmpty,
} from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type {
  ArtCharDatabase,
  Team,
  TeamSortKey,
} from '@genshin-optimizer/gi/db'

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

export const teamFilterKeys = ['charKeys', 'name'] as const
export type TeamFilterKey = (typeof teamFilterKeys)[number]

export type TeamFilterConfigs = FilterConfigs<TeamFilterKey, string>

export function teamFilterConfigs(
  database: ArtCharDatabase
): TeamFilterConfigs {
  return {
    charKeys: (teamId: string, filter: CharacterKey[]) => {
      if (!filter.length) return true

      const nonEmptyLoadoutData = database.teams
        .get(teamId)
        ?.loadoutData.filter(notEmpty)
      const characters = nonEmptyLoadoutData
        ?.map(({ teamCharId }) => database.teamChars.get(teamCharId)?.key)
        .filter(notEmpty)
      const allFilteredCharInTeam = filter.every((charKey) =>
        characters?.includes(charKey)
      )

      return allFilteredCharInTeam
    },
    name: (teamId: string, filter: string) =>
      !filter ||
      !!database.teams
        .get(teamId)
        ?.name.toLowerCase()
        .includes(filter.toLowerCase()),
  }
}
