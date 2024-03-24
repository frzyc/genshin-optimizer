import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  allAbilityLimits,
  type AbilityKey,
  type CharacterKey,
} from '@genshin-optimizer/sr/consts'
import { MenuItem } from '@mui/material'
import { useCharacter, useCharacterReducer } from '../Hook'

type AbilityDropdownProps = {
  characterKey: CharacterKey | ''
  abilityKey: Exclude<AbilityKey, 'technique' | 'overworld'>
}

export function AbilityDropdown({
  characterKey,
  abilityKey,
}: AbilityDropdownProps) {
  const character = useCharacter(characterKey)
  const charReducer = useCharacterReducer(characterKey)

  const displayName = abilityKey.charAt(0).toUpperCase() + abilityKey.slice(1)

  return (
    <DropdownButton
      title={`${displayName} Lv. ${character?.[abilityKey] ?? ''}`}
      disabled={!character}
    >
      {range(1, allAbilityLimits[abilityKey][character?.ascension ?? 0]).map(
        (level) => (
          <MenuItem
            key={`${abilityKey}_${level}`}
            selected={character?.[abilityKey] === level}
            disabled={character?.[abilityKey] === level}
            onClick={() => charReducer({ [abilityKey]: level })}
          >
            {displayName} Lv. {level}
          </MenuItem>
        )
      )}
    </DropdownButton>
  )
}
