import type { SubstatKey } from '@genshin-optimizer/consts'
import {
  allArtifactSetKeys,
  allArtifactSlotKeys,
  allLocationCharacterKeys,
  allSubstatKeys,
} from '@genshin-optimizer/consts'
import { clamp } from '@genshin-optimizer/util'
import { allArtifactRarities } from '../../Types/consts'
import type { ArtifactSortKey, FilterOption } from '../../Util/ArtifactSort'
import { artifactSortKeys, initialFilterOption } from '../../Util/ArtifactSort'
import type { ArtCharDatabase } from '../Database'
import { DataEntry } from '../DataEntry'
import { validateArr, validateObject } from '../validationUtil'

export type IDisplayArtifact = {
  filterOption: FilterOption
  ascending: boolean
  sortType: ArtifactSortKey
  effFilter: SubstatKey[]
  probabilityFilter: Dict<SubstatKey, number>
}

function initialState() {
  return {
    filterOption: initialFilterOption(),
    ascending: false,
    sortType: artifactSortKeys[0],
    effFilter: [...allSubstatKeys],
    probabilityFilter: {},
  }
}

export class DisplayArtifactEntry extends DataEntry<
  'display_artifact',
  'display_artifact',
  IDisplayArtifact,
  IDisplayArtifact
> {
  constructor(database: ArtCharDatabase) {
    super(database, 'display_artifact', initialState, 'display_artifact')
  }
  override validate(obj: unknown): IDisplayArtifact | undefined {
    if (typeof obj !== 'object') return undefined
    let { filterOption, ascending, sortType, effFilter, probabilityFilter } =
      obj as IDisplayArtifact

    if (typeof filterOption !== 'object') filterOption = initialFilterOption()
    else {
      let {
        artSetKeys,
        rarity,
        levelLow,
        levelHigh,
        slotKeys,
        mainStatKeys,
        substats,
        locations,
        showEquipped,
        showInventory,
        locked,
        rvLow,
        rvHigh,
        lines,
      } = filterOption
      artSetKeys = validateArr(artSetKeys, allArtifactSetKeys, [])
      rarity = validateArr(rarity, allArtifactRarities)

      if (typeof levelLow !== 'number') levelLow = 0
      else levelLow = clamp(levelLow, 0, 20)
      if (typeof levelHigh !== 'number') levelHigh = 0
      else levelHigh = clamp(levelHigh, 0, 20)

      slotKeys = validateArr(slotKeys, allArtifactSlotKeys)
      mainStatKeys = validateArr(mainStatKeys, mainStatKeys, [])
      substats = validateArr(substats, allSubstatKeys, [])
      locations = validateArr(locations, allLocationCharacterKeys, [])
      if (typeof showEquipped !== 'boolean') showEquipped = true
      if (typeof showInventory !== 'boolean') showInventory = true
      locked = validateArr(locked, ['locked', 'unlocked'])

      if (typeof rvLow !== 'number') rvLow = 0
      if (typeof rvHigh !== 'number') rvHigh = 900

      lines = validateArr(lines, [1, 2, 3, 4])

      filterOption = {
        artSetKeys,
        rarity,
        levelLow,
        levelHigh,
        slotKeys,
        mainStatKeys,
        substats,
        locations,
        showEquipped,
        showInventory,
        locked,
        rvLow,
        rvHigh,
        lines,
      } as FilterOption
    }

    if (typeof ascending !== 'boolean') ascending = false
    if (!artifactSortKeys.includes(sortType)) sortType = artifactSortKeys[0]

    effFilter = validateArr(effFilter, allSubstatKeys)

    probabilityFilter = validateObject(
      probabilityFilter,
      (k) => allSubstatKeys.includes(k as SubstatKey),
      (e) => typeof e === 'number'
    )

    return {
      filterOption,
      ascending,
      sortType,
      effFilter,
      probabilityFilter,
    } as IDisplayArtifact
  }
  override set(
    value:
      | Partial<IDisplayArtifact>
      | ((v: IDisplayArtifact) => Partial<IDisplayArtifact> | void)
      | { action: 'reset' }
  ): boolean {
    if ('action' in value) {
      if (value.action === 'reset')
        return super.set({ filterOption: initialFilterOption() })
      return false
    } else return super.set(value)
  }
}
