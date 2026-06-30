import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import { DocumentDisplay } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { formulas } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { Box, Stack } from '@mui/material'
import { useMemo } from 'react'
import { formulaMatchesAbility } from '../bundledFormulaFields'
import { OptTalentSheetSectionHeader } from '../optPanelSections'
import { OptTargetSkillSectionHeader } from '../optTargetDisplay'
import { allTalentSheetElementKey } from './consts'
import {
  DISPLAY_SECTION_ORDER,
  type DisplaySection,
  resolveAbilityDisplaySection,
} from './displaySection'
import { charSheets } from './sheets'

export type SkillAbilityDocuments = {
  skill: SkillKey
  ability: string
  documents: Document[]
}

/** Split a skill tab's flat `documents` array into per-ability chunks. */
export function iterSkillAbilityDocuments(
  charKey: CharacterKey
): SkillAbilityDocuments[] {
  const dm = mappedStats.char[charKey]
  const result: SkillAbilityDocuments[] = []

  for (const skill of allSkillKeys) {
    const allDocs = charSheets[charKey][skill]?.documents ?? []
    const abilities = Object.keys(dm[skill])
    let idx = 0

    for (const ability of abilities) {
      const documents: Document[] = []
      if (idx < allDocs.length && allDocs[idx].type === 'text') {
        documents.push(allDocs[idx++])
      }
      if (idx < allDocs.length && allDocs[idx].type === 'fields') {
        documents.push(allDocs[idx++])
      }
      while (idx < allDocs.length) {
        const doc = allDocs[idx]
        if (doc.type === 'text' && doc.header) break
        documents.push(allDocs[idx++])
      }
      result.push({ skill, ability, documents })
    }
  }

  return result
}

function groupSkillMechanicsByDisplaySection(charKey: CharacterKey) {
  const form = formulas[charKey] as Record<string, IFormulaData<Tag>>
  const bySection = new Map<DisplaySection, SkillAbilityDocuments[]>()

  for (const entry of iterSkillAbilityDocuments(charKey)) {
    const { skill, ability } = entry
    const matched = Object.values(form).filter((f) =>
      formulaMatchesAbility(f, ability)
    )
    const section = resolveAbilityDisplaySection(skill, ability, matched)
    const list = bySection.get(section) ?? []
    list.push(entry)
    bySection.set(section, list)
  }

  const sections: Array<{
    section: DisplaySection
    abilities: SkillAbilityDocuments[]
  }> = []
  const seen = new Set<string>()

  for (const section of DISPLAY_SECTION_ORDER) {
    const abilities = bySection.get(section)
    if (!abilities?.length) continue
    seen.add(section)
    sections.push({ section, abilities })
  }
  for (const [section, abilities] of bySection) {
    if (seen.has(section) || !abilities.length) continue
    sections.push({ section, abilities })
  }

  return sections
}

const nonSkillSheetKeys = allTalentSheetElementKey.filter(
  (k): k is Exclude<(typeof allTalentSheetElementKey)[number], SkillKey> =>
    !allSkillKeys.includes(k as SkillKey)
)

export function CharMechanicsGroupedDisplay({
  charKey,
}: {
  charKey: CharacterKey
}) {
  const skillSections = useMemo(
    () => groupSkillMechanicsByDisplaySection(charKey),
    [charKey]
  )

  return (
    <Stack spacing={1.5}>
      {skillSections.map(({ section, abilities }) => (
        <Box key={section}>
          <OptTargetSkillSectionHeader skill={section} />
          {abilities.map(({ skill, ability, documents }) => (
            <Box key={`${skill}_${ability}`}>
              {documents.map((document, i) => (
                <DocumentDisplay
                  key={`${skill}_${ability}_${i}`}
                  document={document}
                  collapse
                />
              ))}
            </Box>
          ))}
        </Box>
      ))}
      {nonSkillSheetKeys.map((sheetKey) => {
        const element = charSheets[charKey][sheetKey]
        if (!element?.documents.length) return null
        return (
          <Box key={sheetKey}>
            <OptTalentSheetSectionHeader sheetKey={sheetKey} />
            {element.documents.map((document, i) => (
              <DocumentDisplay
                key={`${sheetKey}_${i}`}
                document={document}
                collapse
              />
            ))}
          </Box>
        )
      })}
    </Stack>
  )
}
