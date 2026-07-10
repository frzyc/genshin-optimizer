import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { shouldShowDevComponents } from '@genshin-optimizer/common/util'
import { DebugReadContext } from '@genshin-optimizer/game-opt/formula-ui'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import { type SkillKey, isSkillKey } from '@genshin-optimizer/zzz/consts'
import { isAbilityDim } from '@genshin-optimizer/zzz/formula'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import HelpIcon from '@mui/icons-material/Help'
import { Box, ListSubheader, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useContext, useMemo } from 'react'
import { isAbilityFormulaTag } from './abilityTag'
import {
  abilityDisplayTitle,
  abilityHitParamTitle,
  resolveAbilityDisplay,
} from './char/abilityFormulaLabels'
import type { TalentSheetElementKey } from './char/consts'
import { getFieldCategory } from './char/fieldCategory'
import { tagFieldSubset } from './char/tagFieldMap'
import { damageTypeKeysMap } from './char/util'
import { FullTagDisplay, TagDisplay } from './components'
import type { FormulaDimension } from './formulaDimensionUi'
import { ABILITY_DIM_LABEL, formulaDimensionLabel } from './formulaDimensionUi'
import { useZzzCalcContext } from './hooks'
import {
  OptCollapsibleSectionHeader,
  skillSectionFlatIconKey,
  talentSheetElementIcon,
  talentSheetElementLabel,
} from './optPanelSections'
import { formulaReadForTag } from './optTarget'
import { st } from './util'

export {
  abilityDimLabel,
  ABILITY_DIM_LABEL,
  abilityDimsForDimension,
  dimensionByAbilityDim,
  formulaDimensionLabel,
  formulaDimensions,
  resolveAbilityDim,
} from './formulaDimensionUi'
export type { FormulaDimension } from './formulaDimensionUi'

function optTargetFormulaTitle(tag: Tag): ReactNode {
  return (
    tagFieldSubset(tag)[0]?.title ?? <TagDisplay tag={tag} preventRecursion />
  )
}

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
  const formulaTitle = optTargetFormulaTitle(tag)

  if (!category) return <FullTagDisplay tag={tag} />

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
  return <FullTagDisplay tag={tag} />
}

export function AbilityOptTargetLabel({
  charKey,
  tag,
  formulaDimension,
  showDimension = false,
  inline = false,
}: {
  charKey: CharacterKey
  tag: Tag
  formulaDimension?: FormulaDimension
  showDimension?: boolean
  /** Single-line layout for compact button titles. */
  inline?: boolean
}) {
  const category = getFieldCategory(charKey, tag)
  const skillHint: SkillKey | undefined =
    category && isSkillKey(category) ? category : undefined
  const resolved = resolveAbilityDisplay(tag, skillHint)
  if (!resolved) return <FullTagDisplay tag={tag} />

  const { skill } = resolved
  const abilityName = abilityDisplayTitle(charKey, tag, skillHint)
  const skillName = st(`skills.${skill}`)
  const hitLabel = abilityHitParamTitle(charKey, tag, skillHint) ?? null
  const damageType2Label =
    tag.damageType2 && tag.damageType2 in damageTypeKeysMap
      ? damageTypeKeysMap[tag.damageType2 as keyof typeof damageTypeKeysMap]
      : null
  const dimensionBadgeLabel =
    (tag.q && isAbilityDim(tag.q) ? ABILITY_DIM_LABEL[tag.q] : undefined) ??
    (formulaDimension ? formulaDimensionLabel(formulaDimension) : undefined)

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
        <ImgIcon src={commonDefIcon(`${skill}Flat`)} size={1.1} />
        <Typography
          component="span"
          variant="body2"
          noWrap
          sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {abilityName}
          <Typography component="span" variant="body2" color="text.secondary">
            {' · '}
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
          </Typography>
        </Typography>
        {showDimension && dimensionBadgeLabel && (
          <SqBadge>{dimensionBadgeLabel}</SqBadge>
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', minWidth: 0 }}>
      <ImgIcon src={commonDefIcon(`${skill}Flat`)} size={1.25} />
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
        </Typography>
      </Box>
      {showDimension && dimensionBadgeLabel && (
        <SqBadge>{dimensionBadgeLabel}</SqBadge>
      )}
    </Box>
  )
}

export function OptTargetSkillSectionHeader({ skill }: { skill: string }) {
  return (
    <ListSubheader
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        lineHeight: 2,
        bgcolor: 'background.paper',
      }}
    >
      <ImgIcon
        src={commonDefIcon(
          skillSectionFlatIconKey(skill) as Parameters<typeof commonDefIcon>[0]
        )}
        size={1.25}
      />
      {st(`skills.${skill}`)}
    </ListSubheader>
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
}: { sheetKey: string }) {
  const icon = talentSheetElementIcon(sheetKey)
  return (
    <>
      {icon && <ImgIcon src={icon} size={1.25} />}
      {talentSheetElementLabel(sheetKey)}
    </>
  )
}

/** Dev help icon: opens `DebugReadModal` for the current optimization target. */
export function OptTargetDebugHelp({ tag }: { tag: Tag }) {
  const calc = useZzzCalcContext()
  const { setRead } = useContext(DebugReadContext)
  const calcRead = useMemo(() => formulaReadForTag(calc, tag), [calc, tag])

  if (!shouldShowDevComponents) return null

  return (
    <HelpIcon
      fontSize="small"
      aria-label="Debug optimization target formula"
      onClick={(e) => {
        e.stopPropagation()
        setRead(calcRead)
      }}
      sx={{ flexShrink: 0, cursor: 'pointer' }}
    />
  )
}
