import { ImgIcon } from '@genshin-optimizer/common/ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import { useSetDebugTarget } from '@genshin-optimizer/game-opt/formula-ui'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import { type CharacterKey, isSkillKey } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import HelpIcon from '@mui/icons-material/Help'
import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { isAbilityFormulaTag } from './abilityTag'
import { formulaFieldTitle } from './bundledFormulaFields'
import {
  abilityDisplayTitle,
  abilityHitParamTitle,
  resolveAbilityDisplay,
} from './char/abilityFormulaLabels'
import type { TalentSheetElementKey } from './char/consts'
import { getFieldCategory } from './char/fieldCategory'
import { damageTypeKeysMap } from './char/util'
import { TagDisplay } from './components'
import {
  OptCollapsibleSectionHeader,
  skillSectionFlatIconKey,
  talentSheetElementIcon,
  talentSheetElementLabel,
} from './optPanelSections'
import { formulaReadForTag } from './optTarget'
import { st } from './util'

/** Label for sheet-listed formulas (heal, shield, etc.) with a display section. */
export function OptTargetFormulaLabel({
  charKey,
  tag,
  inline = false,
}: {
  charKey: CharacterKey
  tag: Tag
  inline?: boolean
}) {
  const category = getFieldCategory(charKey, tag)
  const formulaTitle = <TagDisplay tag={tag} />

  if (!category) {
    return inline ? (
      <Typography component="span" variant="body2" noWrap>
        {formulaTitle}
      </Typography>
    ) : (
      formulaTitle
    )
  }

  const sectionName = isSkillKey(category)
    ? st(`skills.${category}`)
    : talentSheetElementLabel(category)
  const iconSrc = isSkillKey(category)
    ? commonDefIcon(
        skillSectionFlatIconKey(category) as Parameters<typeof commonDefIcon>[0]
      )
    : talentSheetElementIcon(category)
  const icon = iconSrc ? (
    <ImgIcon src={iconSrc} size={inline ? 1.1 : 1.25} />
  ) : null

  if (inline) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          gap: 0.75,
          alignItems: 'center',
          minWidth: 0,
          overflow: 'hidden',
        }}
      >
        {icon}
        <Typography
          component="span"
          variant="body2"
          noWrap
          sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {sectionName}
          <Typography component="span" variant="body2" color="text.secondary">
            {' · '}
            {formulaTitle}
          </Typography>
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 0 }}>
      {icon}
      <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Typography component="span" variant="body2" noWrap>
          {sectionName}
        </Typography>
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          noWrap
        >
          {formulaTitle}
        </Typography>
      </Box>
    </Box>
  )
}

export function OptTargetSelectedLabel({
  charKey,
  tag,
  inline = false,
}: {
  charKey: CharacterKey
  tag: Tag
  inline?: boolean
}) {
  if (isAbilityFormulaTag(tag)) {
    return <AbilityOptTargetLabel charKey={charKey} tag={tag} inline={inline} />
  }
  if (getFieldCategory(charKey, tag)) {
    return <OptTargetFormulaLabel charKey={charKey} tag={tag} inline={inline} />
  }
  return formulaFieldTitle(tag)
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

export function AbilityOptTargetLabel({
  charKey,
  tag,
  inline = false,
}: {
  charKey: CharacterKey
  tag: Tag
  /** Single-line layout for compact button titles. */
  inline?: boolean
}) {
  const resolved = resolveAbilityDisplay(tag)
  if (!resolved) {
    console.error(
      '[zzz-formula-ui] AbilityOptTargetLabel: tag is not an ability formula',
      { charKey, tag }
    )
    return null
  }

  const { skill } = resolved
  const abilityName = abilityDisplayTitle(charKey, tag)
  const skillName = st(`skills.${skill}`)
  const hitLabel = abilityHitParamTitle(charKey, tag) ?? null
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

  if (inline) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          gap: 0.75,
          alignItems: 'center',
          minWidth: 0,
          overflow: 'hidden',
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
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 0 }}>
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
  readByListingKey,
}: {
  tag: Tag
  readByListingKey?: Map<string, Read<Tag>>
}) {
  const setDebugTarget = useSetDebugTarget()
  const calcRead = useMemo(
    () => formulaReadForTag(tag, readByListingKey),
    [tag, readByListingKey]
  )

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
