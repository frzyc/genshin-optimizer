import type { ButtonProps } from '@mui/material'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { ArtifactRarity } from '@genshin-optimizer/consts'
import { DropdownButton, StarsDisplay } from '@genshin-optimizer/ui-common'

type props = ButtonProps & {
  rarity?: ArtifactRarity
  onRarity: (rarity: ArtifactRarity) => void
  filter: (rarity: ArtifactRarity) => boolean
}

export default function ArtifactRarityDropdown({
  rarity,
  onRarity,
  filter,
  ...props
}: props) {
  const { t } = useTranslation('artifact')
  return (
    <DropdownButton
      {...props}
      title={rarity ? <StarsDisplay stars={rarity} inline /> : t`editor.rarity`}
      color={rarity ? 'success' : 'primary'}
    >
      {([5, 4, 3] as ArtifactRarity[]).map((rarity) => (
        <MenuItem
          key={rarity}
          disabled={!filter(rarity)}
          onClick={() => onRarity(rarity)}
        >
          <StarsDisplay stars={rarity} inline />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
