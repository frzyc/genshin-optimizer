import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { DiscRarityKey } from '@genshin-optimizer/zzz/consts'
import { allDiscRarityKeys } from '@genshin-optimizer/zzz/consts'
import type { ButtonProps } from '@mui/material'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

type props = ButtonProps & {
  rarity?: DiscRarityKey
  onRarityChange: (rarity: DiscRarityKey) => void
  filter?: (rarity: DiscRarityKey) => boolean
}

export function DiscRarityDropdown({
  rarity,
  onRarityChange,
  filter,
  ...props
}: props) {
  const { t } = useTranslation('disc')
  return (
    <DropdownButton
      {...props}
      title={rarity ?? t('editor.rarity')}
      color={rarity ? 'success' : 'primary'}
    >
      {allDiscRarityKeys.map((rarity) => (
        <MenuItem
          key={rarity}
          disabled={filter ? !filter?.(rarity) : false}
          onClick={() => onRarityChange(rarity)}
        >
          {rarity}
          {/* <StarNumDisplay stars={rarity} showNumber={showNumber} /> */}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
