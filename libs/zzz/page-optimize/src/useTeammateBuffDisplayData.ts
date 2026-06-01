import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Document, Field } from '@genshin-optimizer/game-opt/sheet-ui'
import { isTagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey, DiscSetKey } from '@genshin-optimizer/zzz/consts'
import type { useWengine } from '@genshin-optimizer/zzz/db-ui'
import { enemyTag, ownBuff, teamBuff } from '@genshin-optimizer/zzz/formula'
import {
  charSheets,
  discUiSheets,
  useZzzCalcContext,
  wengineUiSheets,
} from '@genshin-optimizer/zzz/formula-ui'
import { useCallback, useMemo } from 'react'

// Enemy stats on `ownBuff.listing` that still debuff the main unit's targets.
const ENEMY_DEBUFF_QS = new Set(Object.keys(enemyTag.common))

type DiscDisplay = {
  setKey: DiscSetKey
  pieces: { piece: '2' | '4'; documents: Document[] }[]
}

type UseTeammateBuffDisplayDataArgs = {
  teammateKey: CharacterKey
  mindscape: number
  sets: Partial<Record<DiscSetKey, number>>
  wengine: ReturnType<typeof useWengine>
}

export function useTeammateBuffDisplayData({
  teammateKey,
  mindscape,
  sets,
  wengine,
}: UseTeammateBuffDisplayDataArgs) {
  const calc = useZzzCalcContext()
  const teamBuffReads = useMemo(
    // Team-buff UI discovery is driven by formula listings.
    // Only buffs registered into team listing (plus enemy-debuff exceptions)
    // are candidates for teammate display.
    () => listTeammateTeamBuffReads(calc, teammateKey, mindscape),
    [calc, teammateKey, mindscape]
  )
  const usedConditionalKeys = useMemo(() => {
    // Keep conditionals that are actual gates for displayed buffs, even if
    // their own document has no direct team-buff field.
    const used = new Set<string>()
    if (!calc) return used
    for (const read of teamBuffReads) {
      const conds = calc.compute(read).meta.conds as any
      for (const dst of Object.values(conds ?? {})) {
        for (const src of Object.values(dst ?? {})) {
          for (const [sheet, names] of Object.entries(src ?? {})) {
            for (const name of Object.keys((names as any) ?? {}))
              used.add(`${sheet}:${name}`)
          }
        }
      }
    }
    return used
  }, [calc, teamBuffReads])
  const teamBuffNames = useMemo(
    () =>
      new Set(
        teamBuffReads
          .map(({ tag }) => tag.name)
          .filter((name): name is string => !!name)
      ),
    [teamBuffReads]
  )
  const filterTeamBuffDocuments = useCallback(
    (documents: Document[]) =>
      filterDocumentsForTeamBuffs(
        documents,
        teamBuffNames,
        usedConditionalKeys,
        mindscape
      ),
    [teamBuffNames, usedConditionalKeys, mindscape]
  )
  const kitDocuments = useMemo(() => {
    // Character kit docs can be huge; keep only teammate->main relevant rows.
    const charSheet = charSheets[teammateKey]
    const charDocuments = charSheet
      ? Object.values(charSheet).flatMap((section) => section?.documents ?? [])
      : []
    return filterTeamBuffDocuments(charDocuments)
  }, [teammateKey, filterTeamBuffDocuments])
  const wengineDocuments = useMemo(() => {
    if (!wengine) return []
    return filterTeamBuffDocuments(
      wengineUiSheets[wengine.key]?.documents ?? []
    )
  }, [wengine, filterTeamBuffDocuments])
  const discDisplays = useMemo(() => {
    // Disc set UI is split by 2pc/4pc. Include only equipped pieces that
    // still contain relevant team-buff fields after filtering.
    const displays: DiscDisplay[] = []
    for (const [setKey, count] of Object.entries(sets)) {
      const uiSheet = discUiSheets[setKey as DiscSetKey]
      if (!uiSheet) continue
      const pieces: DiscDisplay['pieces'] = []
      if (count >= 2) {
        const documents = filterTeamBuffDocuments(uiSheet['2']?.documents ?? [])
        if (documents.length) pieces.push({ piece: '2', documents })
      }
      if (count >= 4) {
        const documents = filterTeamBuffDocuments(uiSheet['4']?.documents ?? [])
        if (documents.length) pieces.push({ piece: '4', documents })
      }
      if (pieces.length) displays.push({ setKey: setKey as DiscSetKey, pieces })
    }
    return displays
  }, [sets, filterTeamBuffDocuments])
  const listingOnlyReads = useMemo(() => {
    // Fallback: if a buff exists in listing but has no matching sheet field,
    // still show it as a generic tag row.
    const covered = buffNamesInDocuments([
      ...kitDocuments,
      ...wengineDocuments,
      ...discDisplays.flatMap(({ pieces }) =>
        pieces.flatMap(({ documents }) => documents)
      ),
    ])
    return teamBuffReads.filter(
      (read) => read.tag.name && !covered.has(read.tag.name)
    )
  }, [teamBuffReads, kitDocuments, wengineDocuments, discDisplays])

  return {
    kitDocuments,
    wengineDocuments,
    discDisplays,
    listingOnlyReads,
  }
}

function isMindscapeGatedBuff(
  buffName: string | null | undefined,
  mindscape: number
): boolean {
  if (!buffName) return false
  const match = buffName.match(/^m(\d)_/)
  if (!match) return false
  return parseInt(match[1], 10) > mindscape
}

function isEnemyDebuffListingRead(read: Read): boolean {
  const q = read.tag.q
  return read.tag.qt === 'common' && !!q && ENEMY_DEBUFF_QS.has(q)
}

function listTeammateTeamBuffReads(
  calc: ReturnType<typeof useZzzCalcContext>,
  teammateKey: CharacterKey,
  mindscape: number
): Read[] {
  // Team-buff UI discovery is driven by formula listings. A buff must be
  // registered into `teamBuff.listing.buffs` (or be a whitelisted enemy debuff)
  // to show up on the teammate card.
  if (!calc) return []
  const seen = new Set<string>()
  const reads = [
    ...calc.listFormulas(teamBuff.listing.buffs),
    ...calc.listFormulas(ownBuff.listing.buffs).filter(isEnemyDebuffListingRead),
  ]
  return reads.filter((read) => {
    if (read.tag.src !== teammateKey) return false
    if (isMindscapeGatedBuff(read.tag.name, mindscape)) return false
    const key = `${read.tag.sheet}:${read.tag.name}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function filterDocumentsForTeamBuffs(
  documents: Document[],
  teamBuffNames: ReadonlySet<string>,
  usedConditionalKeys: ReadonlySet<string>,
  mindscape: number
): Document[] {
  const filtered: Document[] = []
  for (const document of documents) {
    switch (document.type) {
      case 'fields': {
        const fields = filterTeamBuffFields(
          document.fields,
          teamBuffNames,
          mindscape
        )
        if (fields.length) filtered.push({ ...document, fields })
        break
      }
      case 'conditional': {
        const fields = filterTeamBuffFields(
          document.conditional.fields ?? [],
          teamBuffNames,
          mindscape
        )
        const condSheet = document.conditional.metadata.sheet
        const condKey = document.conditional.metadata.name
        const shouldKeepEmptyConditional =
          !!condSheet &&
          !!condKey &&
          usedConditionalKeys.has(`${condSheet}:${condKey}`)

        // Keep conditional UI if it has relevant fields, or if it gates any
        // displayed team buff (e.g. Weeping Cradle "attack" enables stacks).
        if (fields.length || shouldKeepEmptyConditional) {
          filtered.push({
            ...document,
            conditional: {
              ...document.conditional,
              fields: fields.length ? fields : undefined,
            },
          })
        }
        break
      }
      case 'text':
        break
    }
  }
  return filtered
}

function filterTeamBuffFields(
  fields: Field[],
  teamBuffNames: ReadonlySet<string>,
  mindscape: number
): Field[] {
  return fields.filter(
    (field) =>
      isTagField(field) &&
      !!field.fieldRef.name &&
      teamBuffNames.has(field.fieldRef.name) &&
      !isMindscapeGatedBuff(field.fieldRef.name, mindscape)
  )
}

function buffNamesInDocuments(documents: Document[]): Set<string> {
  const names = new Set<string>()
  for (const document of documents) {
    if (document.type === 'fields') {
      for (const field of document.fields) {
        if (isTagField(field) && field.fieldRef.name)
          names.add(field.fieldRef.name)
      }
    } else if (document.type === 'conditional') {
      for (const field of document.conditional.fields ?? []) {
        if (isTagField(field) && field.fieldRef.name)
          names.add(field.fieldRef.name)
      }
    }
  }
  return names
}
