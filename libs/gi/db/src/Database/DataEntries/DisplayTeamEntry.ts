import { validateArr } from '@genshin-optimizer/common/util'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import { allCharacterKeys } from '@genshin-optimizer/gi/consts'
import type { ArtCharDatabase } from '../ArtCharDatabase'
import { DataEntry } from '../DataEntry'

export const teamSortKeys = ['name', 'lastEdit'] as const
export type TeamSortKey = (typeof teamSortKeys)[number]

export type IDisplayTeamEntry = {
  ascending: boolean
  sortType: TeamSortKey
  charKeys: CharacterKey[]
  searchTerm: string
}

function initialState(): IDisplayTeamEntry {
  return {
    ascending: false,
    sortType: teamSortKeys[0],
    charKeys: [],
    searchTerm: '',
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
    if (typeof obj !== 'object' || obj === null) return undefined
    let { ascending, sortType, charKeys, searchTerm } = obj as IDisplayTeamEntry

    if (typeof ascending !== 'boolean') ascending = false
    if (!teamSortKeys.includes(sortType)) sortType = teamSortKeys[0]

    charKeys = validateArr(charKeys, allCharacterKeys, [])
    if (typeof searchTerm !== 'string') searchTerm = ''
    return {
      ascending,
      sortType,
      charKeys,
      searchTerm,
    }
  }
}
