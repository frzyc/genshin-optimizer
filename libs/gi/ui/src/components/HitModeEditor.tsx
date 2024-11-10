import { iconInlineProps } from '@genshin-optimizer/common/svgicons'
import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import {
  DropdownButton,
  SolidToggleButtonGroup,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import type {
  AdditiveReactionKey,
  AmpReactionKey,
  ElementKey,
} from '@genshin-optimizer/gi/consts'
import {
  allAmpReactionKeys,
  allHitModeKeys,
  allowedAdditiveReactions,
  allowedAmpReactions,
} from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  TeamCharacterContext,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { isCharMelee } from '@genshin-optimizer/gi/stats'
import {
  CryoIcon,
  ElectroIcon,
  HydroIcon,
  PyroIcon,
} from '@genshin-optimizer/gi/svgicons'
import { infusionNode, uiInput as input } from '@genshin-optimizer/gi/wr'
import type { ToggleButtonGroupProps } from '@mui/material'
import { MenuItem, ToggleButton } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { DataContext } from '../context'
import { AdditiveReactionModeText } from './AdditiveReactionModeText'
import { AmpReactionModeText } from './AmpReactionModeText'

export const infusionVals = {
  '': <span>No Team Melee Infusion</span>,
  pyro: (
    <span>
      <PyroIcon {...iconInlineProps} /> <SqBadge>Bennett C6</SqBadge> Fire
      Ventures with Me
    </span>
  ),
  cryo: (
    <span>
      <CryoIcon {...iconInlineProps} /> <SqBadge>Chongyun Skill</SqBadge> Spirit
      Blade: Chonghua's Layered Frost
    </span>
  ),
  hydro: (
    <span>
      <HydroIcon {...iconInlineProps} /> <SqBadge>Candace Burst</SqBadge> Sacred
      Rite: Wagtail's Tide
    </span>
  ),
  electro: (
    <span>
      <ElectroIcon {...iconInlineProps} /> <SqBadge>Somnia Burst</SqBadge>{' '}
      Parallax Paws
    </span>
  ),
}
type InfusionAuraDropdownProps = Omit<
  DropdownButtonProps,
  'title' | 'onChange' | 'children'
>
export function InfusionAuraDropdown(props: InfusionAuraDropdownProps) {
  const {
    teamCharId,
    teamChar: { infusionAura },
  } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const database = useDatabase()
  if (!isCharMelee(characterKey)) return null
  return (
    <DropdownButton
      title={infusionVals[infusionAura || '']}
      color={infusionAura || 'secondary'}
      disableElevation
      disabled={!teamCharId}
      {...props}
    >
      {Object.entries(infusionVals).map(([key, text]) => (
        <MenuItem
          key={key}
          sx={key ? { color: `${key}.main` } : undefined}
          selected={key === infusionAura}
          disabled={key === infusionAura}
          onClick={() =>
            database.teamChars.set(teamCharId, { infusionAura: key })
          }
        >
          {text}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}

type ReactionToggleProps = Omit<ToggleButtonGroupProps, 'color'>
export function ReactionToggle(props: ReactionToggleProps) {
  const { t } = useTranslation('page_character')
  const {
    teamCharId,
    teamChar: { reaction },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { data } = useContext(DataContext)
  const charEleKey = data.get(input.charEle).value as ElementKey
  const infusion = data.get(infusionNode).value as ElementKey
  const reactions = [
    ...new Set([
      ...(allowedAmpReactions[charEleKey] ?? []),
      ...(allowedAmpReactions[infusion] ?? []),
      ...(allowedAdditiveReactions[charEleKey] ?? []),
      ...(allowedAdditiveReactions[infusion] ?? []),
    ]),
  ]
  return (
    <SolidToggleButtonGroup
      exclusive
      baseColor="secondary"
      value={reaction || ''}
      onChange={(_, reaction) =>
        database.teamChars.set(teamCharId, { reaction })
      }
      disabled={!teamCharId}
      {...props}
    >
      <ToggleButton value="" disabled={!reaction}>
        {t('noReaction')}
      </ToggleButton>
      {reactions.map((rm) => (
        <ToggleButton key={rm} value={rm} disabled={reaction === rm}>
          {([...allAmpReactionKeys] as string[]).includes(rm) ? (
            <AmpReactionModeText reaction={rm as AmpReactionKey} />
          ) : (
            <AdditiveReactionModeText reaction={rm as AdditiveReactionKey} />
          )}
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
type HitModeToggleProps = Omit<ToggleButtonGroupProps, 'color'>
export function HitModeToggle(props: HitModeToggleProps) {
  const { t } = useTranslation('page_character')
  const {
    teamCharId,
    teamChar: { hitMode = 'avgHit' },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  return (
    <SolidToggleButtonGroup
      exclusive
      baseColor="secondary"
      value={hitMode}
      onChange={(_, hitMode) => database.teamChars.set(teamCharId, { hitMode })}
      disabled={!teamCharId}
      {...props}
    >
      {allHitModeKeys.map((hm) => (
        <ToggleButton key={hm} value={hm} disabled={hitMode === hm}>
          {t(`hitmode.${hm}`)}
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
