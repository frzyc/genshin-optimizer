import { DropdownButton, StarsDisplay } from '@genshin-optimizer/common_ui'
import {
  allRelicRarityKeys,
  type RelicRarityKey,
} from '@genshin-optimizer/sr_consts'
import type { ButtonProps } from '@mui/material'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

type props = ButtonProps & {
  rarity?: RelicRarityKey
  onRarityChange: (rarity: RelicRarityKey) => void
  filter: (rarity: RelicRarityKey) => boolean
}

export default function RelicRarityDropdown({
  rarity,
  onRarityChange,
  filter,
  ...props
}: props) {
  const { t } = useTranslation('relic')
  return (
    <DropdownButton
      {...props}
      title={rarity ? <StarsDisplay stars={rarity} inline /> : t`editor.rarity`}
      color={rarity ? 'success' : 'primary'}
    >
      {allRelicRarityKeys.map((rarity) => (
        <MenuItem
          key={rarity}
          disabled={!filter(rarity)}
          onClick={() => onRarityChange(rarity)}
        >
          <StarsDisplay stars={rarity} inline />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
