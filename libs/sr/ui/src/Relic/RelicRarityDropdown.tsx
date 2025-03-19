import { DropdownButton, StarsDisplay } from '@genshin-optimizer/common/ui'
import type { RarityKey } from '@genshin-optimizer/sr/consts'
import {
  type RelicRarityKey,
  allRelicRarityKeys,
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
          <StarNumDisplay stars={rarity} showNumber={showNumber} />
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
          <StarNumDisplay stars={rarity} showNumber={showNumber} />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
function StarNumDisplay({
  stars,
  showNumber,
}: {
  stars: RarityKey
  showNumber?: boolean
}) {
  if (showNumber)
    return (
      <span>
        {stars} <StarsDisplay stars={1} inline />
      </span>
    )
  return <StarsDisplay stars={stars} inline />
}
