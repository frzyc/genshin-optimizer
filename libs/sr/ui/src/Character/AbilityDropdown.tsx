import type { DropdownButtonProps } from '@genshin-optimizer/common/ui'
import { DropdownButton } from '@genshin-optimizer/common/ui'
import { range } from '@genshin-optimizer/common/util'
import {
  type AbilityKey,
  type CharacterKey,
  allAbilityLimits,
} from '@genshin-optimizer/sr/consts'
import { useCharacter, useDatabaseContext } from '@genshin-optimizer/sr/db-ui'
import { MenuItem } from '@mui/material'

type AbilityDropdownProps = {
  characterKey: CharacterKey | ''
  abilityKey: Exclude<AbilityKey, 'technique' | 'overworld'>
  dropDownButtonProps?: Omit<DropdownButtonProps, 'title' | 'children'>
}

export function AbilityDropdown({
  characterKey,
  abilityKey,
  dropDownButtonProps = {},
}: AbilityDropdownProps) {
  const character = useCharacter(characterKey)
  const { database } = useDatabaseContext()

  const displayName = abilityKey.charAt(0).toUpperCase() + abilityKey.slice(1)

  return (
    <DropdownButton
      title={`${displayName} Lv. ${character?.[abilityKey] ?? 1}`}
      disabled={!character}
      {...dropDownButtonProps}
    >
      {!!characterKey &&
        range(1, allAbilityLimits[abilityKey][character?.ascension ?? 0]).map(
          (level) => (
            <MenuItem
              key={`${abilityKey}_${level}`}
              selected={character?.[abilityKey] === level}
              disabled={character?.[abilityKey] === level}
              onClick={() =>
                database.chars.set(characterKey, { [abilityKey]: level })
              }
            >
              {displayName} Lv. {level}
            </MenuItem>
          )
        )}
    </DropdownButton>
  )
}
