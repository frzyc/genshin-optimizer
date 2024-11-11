import { DropdownButton, StarsDisplay } from '@genshin-optimizer/common/ui'
import {
  allRelicRarityKeys,
  type RelicRarityKey,
} from '@genshin-optimizer/sr/consts'
import type { ButtonProps } from '@mui/material'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

type props = ButtonProps & {
  rarity?: RelicRarityKey
  onRarityChange: (rarity: RelicRarityKey) => void
  filter?: (rarity: RelicRarityKey) => boolean
  showNumber?: boolean
}

export function RelicRarityDropdown({
  rarity,
  onRarityChange,
  filter,
  showNumber = false,
  ...props
}: props) {
  const { t } = useTranslation('relic')
  return (
    <DropdownButton
      {...props}
      title={
        rarity ? (
          showNumber ? (
            <span>
              {rarity} <StarsDisplay stars={1} inline />
            </span>
          ) : (
            <StarsDisplay stars={rarity} inline />
          )
        ) : (
          t('editor.rarity')
        )
      }
      color={rarity ? 'success' : 'primary'}
    >
      {allRelicRarityKeys.map((rarity) => (
        <MenuItem
          key={rarity}
          disabled={filter ? !filter?.(rarity) : false}
          onClick={() => onRarityChange(rarity)}
        >
          {showNumber ? (
            <span>
              {rarity} <StarsDisplay stars={1} inline />
            </span>
          ) : (
            <StarsDisplay stars={rarity} inline />
          )}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
