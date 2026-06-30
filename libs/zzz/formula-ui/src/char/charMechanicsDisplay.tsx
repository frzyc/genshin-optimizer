import { ImgIcon } from '@genshin-optimizer/common/ui'
import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  DocumentContent,
  DocumentDisplay,
  DocumentGroupProvider,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { formulas } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import { Box, Stack, Typography } from '@mui/material'
import { type ReactNode, useMemo } from 'react'
import {
  formulaMatchesAbility,
  skillSectionFlatIconKey,
} from '../bundledFormulaFields'
import {
  talentSheetElementIcon,
  talentSheetElementLabel,
} from '../optPanelSections'
import { st } from '../util'
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

const mechanicsAbilityCardSx = {
  mb: 1,
  overflow: 'hidden',
} as const

const mechanicsSectionCardSx = {
  overflow: 'hidden',
} as const

function CharMechanicsSectionHeader({
  iconSrc,
  children,
}: {
  iconSrc?: string
  children: ReactNode
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 2,
        py: 1.25,
        borderBottom: (theme) =>
          `1px solid ${theme.palette.contentLight.light}`,
      }}
    >
      {iconSrc && <ImgIcon src={iconSrc} size={1.5} />}
      <Typography
        variant="h6"
        component="div"
        sx={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}
      >
        {children}
      </Typography>
    </Box>
  )
}

function AbilityMechanicsCard({ documents }: { documents: Document[] }) {
  if (!documents.length) return null
  const hasConditional = documents.some((doc) => doc.type === 'conditional')
  if (hasConditional) {
    return (
      <Stack spacing={1} sx={{ mb: 1 }}>
        {documents.map((document, i) => (
          <ZCard key={i} bgt="normal" sx={mechanicsAbilityCardSx}>
            <DocumentDisplay
              document={document}
              typoVariant="body2"
              collapse={document.type === 'text'}
            />
          </ZCard>
        ))}
      </Stack>
    )
  }
  return (
    <DocumentGroupProvider>
      <ZCard bgt="normal" sx={mechanicsAbilityCardSx}>
        {documents.map((document, i) => (
          <DocumentContent
            key={i}
            document={document}
            typoVariant="body2"
            collapse={document.type === 'text'}
          />
        ))}
      </ZCard>
    </DocumentGroupProvider>
  )
}

function CharMechanicsSectionCard({
  iconSrc,
  title,
  children,
}: {
  iconSrc?: string
  title: ReactNode
  children: ReactNode
}) {
  return (
    <ZCard bgt="light" sx={mechanicsSectionCardSx}>
      <CharMechanicsSectionHeader iconSrc={iconSrc}>
        {title}
      </CharMechanicsSectionHeader>
      <Box sx={{ px: 1.5, py: 1.5 }}>{children}</Box>
    </ZCard>
  )
}

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
    <Stack spacing={2} sx={{ pb: 1 }}>
      {skillSections.map(({ section, abilities }) => (
        <CharMechanicsSectionCard
          key={section}
          iconSrc={commonDefIcon(
            skillSectionFlatIconKey(section) as Parameters<
              typeof commonDefIcon
            >[0]
          )}
          title={st(`skills.${section}`)}
        >
          {abilities.map(({ skill, ability, documents }) => (
            <AbilityMechanicsCard
              key={`${skill}_${ability}`}
              documents={documents}
            />
          ))}
        </CharMechanicsSectionCard>
      ))}
      {nonSkillSheetKeys.map((sheetKey) => {
        const element = charSheets[charKey][sheetKey]
        if (!element?.documents.length) return null
        return (
          <CharMechanicsSectionCard
            key={sheetKey}
            iconSrc={talentSheetElementIcon(sheetKey)}
            title={talentSheetElementLabel(sheetKey)}
          >
            <Stack spacing={1}>
              {element.documents.map((document, i) => (
                <ZCard
                  key={`${sheetKey}_${i}`}
                  bgt="normal"
                  sx={mechanicsAbilityCardSx}
                >
                  <DocumentDisplay
                    document={document}
                    typoVariant="body2"
                    collapse={document.type === 'text'}
                  />
                </ZCard>
              ))}
            </Stack>
          </CharMechanicsSectionCard>
        )
      })}
    </Stack>
  )
}
