import { DataEntry } from '../DataEntry'
import type { ArtCharDatabase } from '../ArtCharDatabase'

export const teamSortKeys = ['name', 'lastEdit'] as const
export type TeamSortKey = (typeof teamSortKeys)[number]

export type IDisplayTeamEntry = {
  ascending: boolean
  sortType: TeamSortKey
}

function initialState(): IDisplayTeamEntry {
  return {
    ascending: false,
    sortType: teamSortKeys[0],
  }
}

export class DisplayTeamEntry extends DataEntry<
  'display_team',
  'display_team',
  IDisplayTeamEntry,
  IDisplayTeamEntry
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_team', initialState, 'display_team')
  }
  override validate(obj: unknown): IDisplayTeamEntry | undefined {
    if (typeof obj !== 'object') return undefined
    let { ascending, sortType } = obj as IDisplayTeamEntry

    if (typeof ascending !== 'boolean') ascending = false
    if (!teamSortKeys.includes(sortType)) sortType = teamSortKeys[0]

    return {
      ascending,
      sortType,
    } as IDisplayTeamEntry
  }
}
