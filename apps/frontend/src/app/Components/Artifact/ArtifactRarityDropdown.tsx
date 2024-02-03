import type { ButtonProps } from '@mui/material'
import { MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'
import type { ArtifactRarity } from '@genshin-optimizer/gi/consts'
import DropdownButton from '../DropdownMenu/DropdownButton'
import { StarsDisplay } from '../StarDisplay'

type props = ButtonProps & {
  rarity?: ArtifactRarity
  onChange: (rarity: ArtifactRarity) => void
  filter: (ArtifactRarity) => boolean
}

export default function ArtifactRarityDropdown({
  rarity,
  onChange,
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
          onClick={() => onChange(rarity)}
        >
          <StarsDisplay stars={rarity} inline />
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
