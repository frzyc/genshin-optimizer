import { ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { commonDefIcon } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import type { FormulaDimension } from '@genshin-optimizer/zzz/formula'
import {
  type Tag,
  parseLegacyFormulaName,
} from '@genshin-optimizer/zzz/formula'
import { Box, ListSubheader, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { skillFromTag, skillSectionFlatIconKey } from './bundledFormulaFields'
import { getFormulaDisplaySection } from './char/displaySection'
import { tagFieldMap } from './char/tagFieldMap'
import { FullTagDisplay, TagDisplay } from './components'
import { st, trans } from './util'

export const FORMULA_DIMENSION_LABEL: Record<FormulaDimension, string> = {
  dmg: 'DMG',
  daze: 'Daze',
  anomBuildup: 'Anom',
}

export function parseAbilityFromTag(
  tag: Tag
): { skill: SkillKey; abilityKey: string; hitIndex?: string } | undefined {
  const skill = skillFromTag(tag)
  if (!skill || !tag.name) return undefined

  const legacy = parseLegacyFormulaName(tag.name)
  const baseName = legacy?.baseName ?? tag.name.split(':')[0]
  const underscoreIdx = baseName.lastIndexOf('_')
  if (underscoreIdx === -1) return { skill, abilityKey: baseName }

  const abilityKey = baseName.slice(0, underscoreIdx)
  const hitIndex = baseName.slice(underscoreIdx + 1)
  if (!/^\d+$/.test(hitIndex)) return { skill, abilityKey: baseName }

  return { skill, abilityKey, hitIndex }
}

export function isAbilityFormulaTag(tag: Tag): boolean {
  return !!parseAbilityFromTag(tag)
}

function optTargetFormulaTitle(tag: Tag): ReactNode {
  return (
    tagFieldMap.subset(tag)[0]?.title ?? (
      <TagDisplay tag={tag} preventRecursion />
    )
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
  const section = getFormulaDisplaySection(charKey, tag)
  const formulaTitle = optTargetFormulaTitle(tag)

  if (!section) return <FullTagDisplay tag={tag} />

  const sectionName = st(`skills.${section}`)
  const icon = (
    <ImgIcon
      src={commonDefIcon(
        skillSectionFlatIconKey(section) as Parameters<typeof commonDefIcon>[0]
      )}
      size={inline ? 1.1 : 1.25}
    />
  )

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
  if (getFormulaDisplaySection(charKey, tag)) {
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
  const parsed = parseAbilityFromTag(tag)
  if (!parsed) return <FullTagDisplay tag={tag} />

  const { skill, abilityKey, hitIndex } = parsed
  const [chg] = trans('char', charKey)
  const abilityName = chg(`${skill}.${abilityKey}.name`)
  const skillName = st(`skills.${skill}`)
  const hitLabel =
    hitIndex !== undefined
      ? chg(`${skill}.${abilityKey}.params.${hitIndex.replace(/\D/g, '')}`)
      : null

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
          </Typography>
        </Typography>
        {showDimension && formulaDimension && (
          <SqBadge>{FORMULA_DIMENSION_LABEL[formulaDimension]}</SqBadge>
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
        </Typography>
      </Box>
      {showDimension && formulaDimension && (
        <SqBadge>{FORMULA_DIMENSION_LABEL[formulaDimension]}</SqBadge>
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
