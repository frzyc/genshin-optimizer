import type { ElementKey } from '@genshin-optimizer/consts'
import type { ToggleButtonGroupProps } from '@mui/material'
import { MenuItem, ToggleButton } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { CharacterContext } from '../Context/CharacterContext'
import { DataContext } from '../Context/DataContext'
import { infusionNode, uiInput as input } from '../Formula'
import { iconInlineProps } from '../SVGIcons'
import CryoIcon from '../SVGIcons/Element/CryoIcon'
import HydroIcon from '../SVGIcons/Element/HydroIcon'
import PyroIcon from '../SVGIcons/Element/PyroIcon'
import type { AdditiveReactionKey, AmpReactionKey } from '../Types/consts'
import {
  allAmpReactions,
  allHitModes,
  allowedAdditiveReactions,
  allowedAmpReactions,
} from '../Types/consts'
import AdditiveReactionModeText from './AdditiveReactionModeText'
import AmpReactionModeText from './AmpReactionModeText'
import type { DropdownButtonProps } from './DropdownMenu/DropdownButton'
import DropdownButton from './DropdownMenu/DropdownButton'
import SolidToggleButtonGroup from './SolidToggleButtonGroup'
import SqBadge from './SqBadge'

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
}
type InfusionAuraDropdownProps = Omit<
  DropdownButtonProps,
  'title' | 'onChange' | 'children'
>
export function InfusionAuraDropdown(props: InfusionAuraDropdownProps) {
  const {
    characterSheet,
    character: { infusionAura },
    characterDispatch,
  } = useContext(CharacterContext)
  if (!characterSheet?.isMelee()) return null
  return (
    <DropdownButton
      title={infusionVals[infusionAura]}
      color={infusionAura || 'secondary'}
      disableElevation
      {...props}
    >
      {Object.entries(infusionVals).map(([key, text]) => (
        <MenuItem
          key={key}
          sx={key ? { color: `${key}.main` } : undefined}
          selected={key === infusionAura}
          disabled={key === infusionAura}
          onClick={() => characterDispatch({ infusionAura: key })}
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
    character: { reaction },
    characterDispatch,
  } = useContext(CharacterContext)
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
      value={reaction}
      onChange={(_, reaction) => characterDispatch({ reaction })}
      {...props}
    >
      <ToggleButton value="" disabled={!reaction}>{t`noReaction`}</ToggleButton>
      {reactions.map((rm) => (
        <ToggleButton key={rm} value={rm} disabled={reaction === rm}>
          {([...allAmpReactions] as string[]).includes(rm) ? (
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
    character: { hitMode },
    characterDispatch,
  } = useContext(CharacterContext)
  return (
    <SolidToggleButtonGroup
      exclusive
      baseColor="secondary"
      value={hitMode}
      onChange={(_, hitMode) => characterDispatch({ hitMode })}
      {...props}
    >
      {allHitModes.map((hm) => (
        <ToggleButton key={hm} value={hm} disabled={hitMode === hm}>
          {t(`hitmode.${hm}`)}
        </ToggleButton>
      ))}
    </SolidToggleButtonGroup>
  )
}
