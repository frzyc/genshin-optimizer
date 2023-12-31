import type { ButtonProps } from '@mui/material'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { DropdownButton, StarsDisplay } from '@genshin-optimizer/ui-common'
import type { RelicRarityKey } from '@genshin-optimizer/sr-consts'

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
      {([5, 4, 3, 2] as RelicRarityKey[]).map((rarity) => (
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
