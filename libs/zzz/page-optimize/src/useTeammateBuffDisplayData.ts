import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { Tag } from '@genshin-optimizer/zzz/formula'
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
    () => listTeammateTeamBuffReads(calc, teammateKey, mindscape),
    [calc, teammateKey, mindscape]
  )
  const usedConditionalKeys = useMemo(
    // Keep conditionals that gate displayed buffs, even without a direct field row.
    () => (calc ? conditionalKeysFromReads(calc, teamBuffReads) : new Set()),
    [calc, teamBuffReads]
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
    // Character kit docs can be huge; keep only teammate→main relevant rows.
    const charSheet = charSheets[teammateKey]
    const charDocuments = charSheet
      ? Object.values(charSheet).flatMap((section) => section?.documents ?? [])
      : []
    return filterTeamBuffDocuments(charDocuments)
  }, [teammateKey, filterTeamBuffDocuments])
  const wengineDocuments = useMemo(
    () =>
      wengine
        ? filterTeamBuffDocuments(
            wengineUiSheets[wengine.key]?.documents ?? []
          )
        : [],
    [wengine, filterTeamBuffDocuments]
  )
  const discDisplays = useMemo(
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

function isMindscapeGatedBuff(
  buffName: string | null | undefined,
  mindscape: number
): boolean {
  const match = buffName?.match(/^m(\d)_/)
  return !!match && parseInt(match[1], 10) > mindscape
}

function isEnemyDebuffListingRead(read: Read): boolean {
  const q = read.tag.q
  return read.tag.qt === 'common' && !!q && ENEMY_DEBUFF_QS.has(q)
}

function teamBuffListingKey(tag: Tag): string | null {
  // Match listing reads and sheet fields by sheet + register name.
  const { sheet, name } = tag
  return sheet && name ? `${sheet}:${name}` : null
}

function listingKeysFromTags(tags: readonly Tag[]): Set<string> {
  return new Set(
    tags
      .map(teamBuffListingKey)
      .filter((key): key is string => !!key)
  )
}

function fieldsFromDocument(document: Document): Field[] {
  return document.type === 'fields'
    ? document.fields
    : document.type === 'conditional'
      ? (document.conditional.fields ?? [])
      : []
}

function buffListingKeysInDocuments(documents: Document[]): Set<string> {
  return listingKeysFromTags(
    documents
      .flatMap(fieldsFromDocument)
      .filter(isTagField)
      .map((field) => field.fieldRef)
  )
}

function conditionalKeysFromReads(
  calc: NonNullable<ReturnType<typeof useZzzCalcContext>>,
  reads: Read[]
): Set<string> {
  return new Set(
    reads.flatMap((read) => {
      const conds = calc.compute(read).meta.conds as
        | Record<string, Record<string, Record<string, Record<string, unknown>>>>
        | undefined
      return Object.values(conds ?? {}).flatMap((dst) =>
        Object.values(dst ?? {}).flatMap((src) =>
          Object.entries(src ?? {}).flatMap(([sheet, names]) =>
            Object.keys(names ?? {}).map((name) => `${sheet}:${name}`)
          )
        )
      )
    })
  )
}

function listTeammateTeamBuffReads(
  calc: ReturnType<typeof useZzzCalcContext>,
  teammateKey: CharacterKey,
  mindscape: number
): Read[] {
  // A buff must be on `teamBuff.listing.buffs` (or whitelisted enemy debuff on
  // ownBuff.listing) and belong to this teammate's src to show on the card.
  if (!calc) return []

  const reads = [
    ...calc.listFormulas(teamBuff.listing.buffs),
    ...calc.listFormulas(ownBuff.listing.buffs).filter(isEnemyDebuffListingRead),
  ]

  return uniqReadsByListingKey(
    reads.filter(
      (read) =>
        read.tag.src === teammateKey &&
        // Global anomaly team buffs (e.g. Frostbite) use AnomalySection on this page.
        read.tag.sheet !== 'anomaly' &&
        !isMindscapeGatedBuff(read.tag.name, mindscape)
    )
  )
}

function uniqReadsByListingKey(reads: Read[]): Read[] {
  const seen = new Set<string>()
  return reads.filter((read) => {
    const key = teamBuffListingKey(read.tag)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function filterDocumentsForTeamBuffs(
  documents: Document[],
  teamBuffListingKeys: ReadonlySet<string>,
  usedConditionalKeys: ReadonlySet<string>,
  mindscape: number
): Document[] {
  return documents.flatMap((document) => {
    switch (document.type) {
      case 'fields': {
        const fields = filterTeamBuffFields(
          document.fields,
          teamBuffListingKeys,
          mindscape
        )
        return fields.length ? [{ ...document, fields }] : []
      }
      case 'conditional': {
        const fields = filterTeamBuffFields(
          fieldsFromDocument(document),
          teamBuffListingKeys,
          mindscape
        )
        const { sheet: condSheet, name: condKey } = document.conditional.metadata
        const gatesListedBuff =
          !!condSheet &&
          !!condKey &&
          usedConditionalKeys.has(`${condSheet}:${condKey}`)

        // Keep conditional UI if it has relevant fields, or if it gates any
        // displayed team buff (e.g. Weeping Cradle "attack" enables stacks).
        return fields.length || gatesListedBuff
          ? [
              {
                ...document,
                conditional: {
                  ...document.conditional,
                  fields: fields.length ? fields : undefined,
                },
              },
            ]
          : []
      }
      default:
        return []
    }
  })
}

function filterTeamBuffFields(
  fields: Field[],
  teamBuffListingKeys: ReadonlySet<string>,
  mindscape: number
): Field[] {
  return fields.filter(
    (field) =>
      isTagField(field) &&
      isListedTeamBuffField(field.fieldRef, teamBuffListingKeys, mindscape)
  )
}

function isListedTeamBuffField(
  fieldRef: Tag,
  teamBuffListingKeys: ReadonlySet<string>,
  mindscape: number
): boolean {
  const key = teamBuffListingKey(fieldRef)
  return (
    !!key &&
    teamBuffListingKeys.has(key) &&
    !isMindscapeGatedBuff(fieldRef.name, mindscape)
  )
}

function discDisplaysFromSets(
  sets: Partial<Record<DiscSetKey, number>>,
  filterTeamBuffDocuments: (documents: Document[]) => Document[]
): DiscDisplay[] {
  // Disc UI is split by 2pc/4pc; include only pieces with relevant team-buff rows.
  return Object.entries(sets).flatMap(([setKey, count]) => {
    if (!count) return []
    const uiSheet = discUiSheets[setKey as DiscSetKey]
    if (!uiSheet) return []

    const pieces = (['2', '4'] as const).flatMap((piece) => {
      const minPieces = piece === '2' ? 2 : 4
      if (count < minPieces) return []
      const documents = filterTeamBuffDocuments(uiSheet[piece]?.documents ?? [])
      return documents.length ? [{ piece, documents }] : []
    })

    return pieces.length
      ? [{ setKey: setKey as DiscSetKey, pieces }]
      : []
  })
}
