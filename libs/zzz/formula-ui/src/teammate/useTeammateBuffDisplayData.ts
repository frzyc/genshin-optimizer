import type { Preset } from '@genshin-optimizer/game-opt/engine'
import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey, DiscSetKey } from '@genshin-optimizer/zzz/consts'
import type { useWengine } from '@genshin-optimizer/zzz/db-ui'
import {
  conditionalKeysFromReads,
  listTeammateTeamBuffReads,
  teamBuffListingKey,
} from '@genshin-optimizer/zzz/formula'
import { useCallback, useMemo } from 'react'
import { charSheets } from '../char/sheets'
import { useZzzCalcContext } from '../hooks'
import { wengineUiSheets } from '../wengine/sheets'
import { type DiscDisplay, discDisplaysFromSets } from './discTeamBuffDisplays'
import {
  buffListingKeysInDocuments,
  filterDocumentsForTeamBuffs,
  kitDocumentsForMindscape,
  listingKeysFromTags,
} from './teamBuffDocuments'

type UseTeammateBuffDisplayDataArgs = {
  teammateKey: CharacterKey
  mindscape: number
  sets: Partial<Record<DiscSetKey, number>>
  wengine: ReturnType<typeof useWengine>
  /** Multiopt frame; optimize is single-target so default preset0. */
  preset?: Preset
}

export function useTeammateBuffDisplayData({
  teammateKey,
  mindscape,
  sets,
  wengine,
  preset = 'preset0',
}: UseTeammateBuffDisplayDataArgs) {
  const calc = useZzzCalcContext()
  const teamBuffReads = useMemo(
    // Team-buff UI discovery is driven by formula listings.
    () => listTeammateTeamBuffReads(calc, teammateKey, mindscape),
    [calc, teammateKey, mindscape]
  )
  const usedConditionalKeys = useMemo(
    // Keep conditionals that gate displayed buffs, even without a direct field row.
    () =>
      calc
        ? conditionalKeysFromReads(calc, teamBuffReads, preset)
        : new Set<string>(),
    [calc, teamBuffReads, preset]
  )
  const teamBuffListingKeys = useMemo(
    () => listingKeysFromTags(teamBuffReads.map(({ tag }) => tag)),
    [teamBuffReads]
  )
  const filterTeamBuffDocuments = useCallback(
    (documents: Document[]) =>
      filterDocumentsForTeamBuffs(
        documents,
        teamBuffListingKeys,
        usedConditionalKeys,
        mindscape
      ),
    [teamBuffListingKeys, usedConditionalKeys, mindscape]
  )
  const kitDocuments = useMemo(() => {
    // Skip locked mN tabs, then keep only teammate→main relevant rows.
    return filterTeamBuffDocuments(
      kitDocumentsForMindscape(charSheets[teammateKey], mindscape)
    )
  }, [teammateKey, mindscape, filterTeamBuffDocuments])
  const wengineDocuments = useMemo(
    () =>
      wengine
        ? filterTeamBuffDocuments(wengineUiSheets[wengine.key]?.documents ?? [])
        : [],
    [wengine, filterTeamBuffDocuments]
  )
  const discDisplays: DiscDisplay[] = useMemo(
    () => discDisplaysFromSets(sets, filterTeamBuffDocuments),
    [sets, filterTeamBuffDocuments]
  )
  const listingOnlyReads = useMemo(() => {
    // Fallback: buff in listing but not covered by any filtered sheet document.
    const covered = buffListingKeysInDocuments([
      ...kitDocuments,
      ...wengineDocuments,
      ...discDisplays.flatMap(({ pieces }) =>
        pieces.flatMap(({ documents }) => documents)
      ),
    ])
    return teamBuffReads.filter((read) => {
      const key = teamBuffListingKey(read.tag)
      return key && !covered.has(key)
    })
  }, [teamBuffReads, kitDocuments, wengineDocuments, discDisplays])

  return {
    kitDocuments,
    wengineDocuments,
    discDisplays,
    listingOnlyReads,
  }
}
