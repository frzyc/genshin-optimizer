import { ImgIcon } from '@genshin-optimizer/common/ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { useSetDebugTarget } from '@genshin-optimizer/game-opt/formula-ui'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import { isSkillKey } from '@genshin-optimizer/zzz/consts'
import type { FormulaRef, Tag } from '@genshin-optimizer/zzz/formula'
import { lookupFormulaRef } from '@genshin-optimizer/zzz/formula'
import HelpIcon from '@mui/icons-material/Help'
import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { isAbilityFormulaTag } from './abilityTag'
import { abilityLabelParts } from './char/abilityFormulaLabels'
import type { TalentSheetElementKey } from './char/consts'
import { damageTypeKeysMap, getVariant } from './char/util'
import { TagTitle } from './components/TagTitle'
import {
  OptCollapsibleSectionHeader,
  skillSectionFlatIconKey,
  talentSheetElementIcon,
  talentSheetElementLabel,
} from './optPanelSections'
import { st } from './util'

export function OptTargetSelectedLabel({
  formulaRef,
  inline = false,
}: {
  formulaRef: FormulaRef
  inline?: boolean
}) {
  const looked = lookupFormulaRef(formulaRef)
  if (!looked) return null
  const { tag } = looked
  if (isAbilityFormulaTag(tag)) {
    return <AbilityOptTargetLabel tag={tag} inline={inline} />
  }
  return <TagTitle tag={tag} />
}

function AbilityOptTargetSecondaryLine({
  skillName,
  hitLabel,
  damageType2Label,
}: {
  skillName: ReactNode
  hitLabel: ReactNode | null
  damageType2Label: string | null
}) {
  return (
    <>
      {skillName}
      {hitLabel && (
        <>
          {' · '}
          {hitLabel}
        </>
      )}
      {damageType2Label && (
        <>
          {' · '}
          {damageType2Label}
        </>
      )}
    </>
  )
}

function AbilityOptTargetLabel({
  tag,
  inline = false,
}: {
  tag: Tag
  /** Single-line layout for compact button titles. */
  inline?: boolean
}) {
  const parts = abilityLabelParts(tag)
  if (!parts) {
    console.error(
      '[zzz-formula-ui] AbilityOptTargetLabel: tag missing ability identity',
      { tag }
    )
    return null
  }

  const variant = getVariant(tag)
  const { skill, name: abilityName } = parts
  const skillName = st(`skills.${skill}`)
  const hitLabel = parts.hitLabel ?? null
  const damageType2Label =
    tag.damageType2 && tag.damageType2 in damageTypeKeysMap
      ? damageTypeKeysMap[tag.damageType2 as keyof typeof damageTypeKeysMap]
      : null
  const secondary = (
    <AbilityOptTargetSecondaryLine
      skillName={skillName}
      hitLabel={hitLabel}
      damageType2Label={damageType2Label}
    />
  )
  const iconSize = inline ? 1.1 : 1.25
  const colorSx = variant ? { color: `${variant}.main` } : undefined

  if (inline) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          gap: 0.75,
          alignItems: 'center',
          minWidth: 0,
          overflow: 'hidden',
          ...colorSx,
        }}
      >
        <ImgIcon src={commonDefIcon(`${skill}Flat`)} size={iconSize} />
        <Typography
          component="span"
          variant="body2"
          noWrap
          sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {abilityName}
          <Typography component="span" variant="body2" color="text.secondary">
            {' · '}
            {secondary}
          </Typography>
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        alignItems: 'center',
        minWidth: 0,
        ...colorSx,
      }}
    >
      <ImgIcon src={commonDefIcon(`${skill}Flat`)} size={iconSize} />
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography component="span" variant="body2" noWrap>
          {abilityName}
        </Typography>
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          noWrap
        >
          {secondary}
        </Typography>
      </Box>
    </Box>
  )
}

export function OptTargetCategorySectionHeader({
  category,
}: {
  category: TalentSheetElementKey
}) {
  const headerContent = isSkillKey(category) ? (
    <OptTargetSkillSectionHeaderContent skill={category} />
  ) : (
    <OptTalentSheetSectionHeaderContent sheetKey={category} />
  )

  return (
    <OptCollapsibleSectionHeader sectionKey={category}>
      {headerContent}
    </OptCollapsibleSectionHeader>
  )
}

function OptTargetSkillSectionHeaderContent({ skill }: { skill: string }) {
  return (
    <>
      <ImgIcon
        src={commonDefIcon(
          skillSectionFlatIconKey(skill) as Parameters<typeof commonDefIcon>[0]
        )}
        size={1.25}
      />
      {st(`skills.${skill}`)}
    </>
  )
}

function OptTalentSheetSectionHeaderContent({
  sheetKey,
}: {
  sheetKey: string
}) {
  const icon = talentSheetElementIcon(sheetKey)
  return (
    <>
      {icon && <ImgIcon src={icon} size={1.25} />}
      {talentSheetElementLabel(sheetKey)}
    </>
  )
}

/** Dev help icon: opens `DebugReadModal` for the current optimization target. */
export function OptTargetDebugHelp({
  tag,
  calcRead,
}: {
  tag: Tag
  calcRead?: Read<Tag>
}) {
  const setDebugTarget = useSetDebugTarget()

  if (!shouldShowDevComponents || !calcRead) return null

  return (
    <HelpIcon
      fontSize="small"
      aria-label="Debug optimization target formula"
      onClick={(e) => {
        e.stopPropagation()
        setDebugTarget?.(calcRead, tag)
      }}
      sx={{ flexShrink: 0, cursor: 'pointer' }}
    />
  )
}
