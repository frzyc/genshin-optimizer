import type { Document, Field } from '@genshin-optimizer/game-opt/sheet-ui'
import { isTagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import {
  isMindscapeGatedBuff,
  teamBuffListingKey,
} from '@genshin-optimizer/zzz/formula'
import type { CharUISheet } from '../char/consts'

export function listingKeysFromTags(tags: readonly Tag[]): Set<string> {
  return new Set(
    tags.map(teamBuffListingKey).filter((key): key is string => !!key)
  )
}

export function fieldsFromDocument(document: Document): Field[] {
  return document.type === 'fields'
    ? document.fields
    : document.type === 'conditional'
      ? (document.conditional.fields ?? [])
      : []
}

export function buffListingKeysInDocuments(documents: Document[]): Set<string> {
  return listingKeysFromTags(
    documents
      .flatMap(fieldsFromDocument)
      .filter(isTagField)
      .map((field) => field.fieldRef)
  )
}

/** Mindscape sheet tabs (`m1`…`m6`) only when the teammate has that mindscape. */
export function isKitSheetSectionUnlocked(
  sectionKey: string,
  mindscape: number
): boolean {
  const match = sectionKey.match(/^m(\d)$/)
  if (!match) return true
  return Number.parseInt(match[1], 10) <= mindscape
}

/** Flatten kit UI docs, skipping locked mindscape sections. */
export function kitDocumentsForMindscape(
  charSheet: CharUISheet | undefined,
  mindscape: number
): Document[] {
  if (!charSheet) return []
  return Object.entries(charSheet).flatMap(([sectionKey, section]) => {
    if (!isKitSheetSectionUnlocked(sectionKey, mindscape)) return []
    return section?.documents ?? []
  })
}

export function filterDocumentsForTeamBuffs(
  documents: Document[],
  teamBuffListingKeys: ReadonlySet<string>,
  usedConditionalKeys: ReadonlySet<string>,
  mindscape: number
): Document[] {
  const result: Document[] = []
  for (const document of documents) {
    switch (document.type) {
      case 'fields': {
        const fields = filterTeamBuffFields(
          document.fields,
          teamBuffListingKeys,
          mindscape
        )
        if (fields.length) result.push({ ...document, fields })
        break
      }
      case 'conditional': {
        // Self-only rows are dropped first; only team listing fields remain.
        const fields = filterTeamBuffFields(
          fieldsFromDocument(document),
          teamBuffListingKeys,
          mindscape
        )
        const { sheet: condSheet, name: condKey } =
          document.conditional.metadata
        const gatesListedBuff =
          !!condSheet &&
          !!condKey &&
          usedConditionalKeys.has(`${condSheet}:${condKey}`)

        // Keep conditional UI if it has relevant fields, or if it gates any
        // displayed team buff (e.g. Weeping Cradle "attack" enables stacks).
        if (fields.length || gatesListedBuff) {
          result.push({
            ...document,
            conditional: {
              ...document.conditional,
              fields: fields.length ? fields : undefined,
            },
          })
        }
        break
      }
      default:
        break
    }
  }
  // Same DB conditional key → one toggle; union remaining team-buff fields.
  return mergeConditionalDocumentsByKey(result)
}

/**
 * Collapse duplicate conditional UI blocks that share `sheet:name`.
 * Char sheets often repeat the same conditional under core / m2 / m6 with
 * different fields; teammate UI should show one control.
 */
export function mergeConditionalDocumentsByKey(
  documents: Document[]
): Document[] {
  const merged: Document[] = []
  const conditionalIndexByKey = new Map<string, number>()

  for (const document of documents) {
    if (document.type !== 'conditional') {
      merged.push(document)
      continue
    }

    const { sheet, name } = document.conditional.metadata
    const key = sheet && name ? `${sheet}:${name}` : null
    if (!key) {
      merged.push(document)
      continue
    }

    const existingIndex = conditionalIndexByKey.get(key)
    if (existingIndex === undefined) {
      conditionalIndexByKey.set(key, merged.length)
      merged.push(document)
      continue
    }

    const existing = merged[existingIndex]
    if (existing.type !== 'conditional') continue

    merged[existingIndex] = {
      ...existing,
      conditional: {
        ...existing.conditional,
        fields: mergeUniqueTagFields(
          existing.conditional.fields,
          document.conditional.fields
        ),
      },
    }
  }

  return merged
}

function mergeUniqueTagFields(
  left: Field[] | undefined,
  right: Field[] | undefined
): Field[] | undefined {
  const combined = [...(left ?? []), ...(right ?? [])]
  if (!combined.length) return undefined

  const seen = new Set<string>()
  const fields: Field[] = []
  for (const field of combined) {
    if (!isTagField(field)) {
      fields.push(field)
      continue
    }
    const key = teamBuffListingKey(field.fieldRef)
    if (key) {
      if (seen.has(key)) continue
      seen.add(key)
    }
    fields.push(field)
  }
  return fields.length ? fields : undefined
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
