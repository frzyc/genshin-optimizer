import { ImgIcon } from '@genshin-optimizer/common/ui'
import type { Document } from '@genshin-optimizer/game-opt/sheet-ui'
import {
  DocumentContent,
  DocumentGroupProvider,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import { ZCard } from '@genshin-optimizer/zzz/ui'
import { Box, Stack, Typography } from '@mui/material'
import { type ReactNode, useMemo } from 'react'
import {
  skillSectionFlatIconKey,
  talentSheetElementIcon,
  talentSheetElementLabel,
} from '../optPanelSections'
import { st } from '../util'
import {
  allMindscapeSheetElementKeys,
  allTalentSheetElementKey,
} from './consts'
import { groupDocumentsByHeader } from './documentGrouping'
import { charSheets } from './sheets'

const nonSkillSheetKeys = allTalentSheetElementKey.filter(
  (
    k
  ): k is Exclude<
    (typeof allTalentSheetElementKey)[number],
    | (typeof allSkillKeys)[number]
    | (typeof allMindscapeSheetElementKeys)[number]
  > =>
    !allSkillKeys.includes(k as (typeof allSkillKeys)[number]) &&
    !allMindscapeSheetElementKeys.includes(
      k as (typeof allMindscapeSheetElementKeys)[number]
    )
)

const talentSheetDocumentsSx = {
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

function TalentSheetDocuments({ documents }: { documents: Document[] }) {
  if (!documents.length) return null
  return (
    <DocumentGroupProvider>
      <ZCard bgt="normal" sx={talentSheetDocumentsSx}>
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

function groupedTalentSheetDocuments(
  documents: Document[],
  keyPrefix: string
): ReactNode {
  return groupDocumentsByHeader(documents).map((group, i) => (
    <TalentSheetDocuments key={`${keyPrefix}_${i}`} documents={group} />
  ))
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
    () =>
      allSkillKeys
        .map((skill) => ({
          skill,
          documents: charSheets[charKey][skill]?.documents ?? [],
        }))
        .filter(({ documents }) => documents.length > 0),
    [charKey]
  )

  return (
    <Stack spacing={2} sx={{ pb: 1 }}>
      {skillSections.map(({ skill, documents }) => (
        <CharMechanicsSectionCard
          key={skill}
          iconSrc={commonDefIcon(
            skillSectionFlatIconKey(skill) as Parameters<
              typeof commonDefIcon
            >[0]
          )}
          title={st(`skills.${skill}`)}
        >
          {groupedTalentSheetDocuments(documents, skill)}
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
            {groupedTalentSheetDocuments(element.documents, sheetKey)}
          </CharMechanicsSectionCard>
        )
      })}
      {allMindscapeSheetElementKeys.some(
        (sheetKey) => charSheets[charKey][sheetKey]?.documents.length
      ) && (
        <CharMechanicsSectionCard key="mindscapes" title={st('mindscapes')}>
          {allMindscapeSheetElementKeys.flatMap((sheetKey) => {
            const element = charSheets[charKey][sheetKey]
            if (!element?.documents.length) return []
            return groupedTalentSheetDocuments(element.documents, sheetKey)
          })}
        </CharMechanicsSectionCard>
      )}
    </Stack>
  )
}
