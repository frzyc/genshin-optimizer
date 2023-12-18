import type { ArtifactSlotKey } from '@genshin-optimizer/consts'
import { allArtifactSlotKeys } from '@genshin-optimizer/consts'
import { SlotIcon } from '@genshin-optimizer/gi-svgicons'
import { DropdownButton } from '@genshin-optimizer/ui-common'
import { Replay } from '@mui/icons-material'
import type { ButtonProps } from '@mui/material'
import { Divider, ListItemIcon, ListItemText, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

type ArtifactSlotDropdownProps = ButtonProps & {
  slotKey?: ArtifactSlotKey | ''
  onSlot: (slotKey: ArtifactSlotKey | '') => void
  hasUnselect?: boolean
}

export default function ArtifactSlotDropdown({
  slotKey = '',
  onSlot,
  hasUnselect = false,
  ...props
}: ArtifactSlotDropdownProps) {
  const { t } = useTranslation(['artifact', 'ui'])
  return (
    <DropdownButton
      title={slotKey ? t(`artifact:slotName:${slotKey}`) : t('artifact:slot')}
      color={slotKey ? 'success' : 'primary'}
      startIcon={slotKey ? <SlotIcon slotKey={slotKey} /> : undefined}
      {...props}
    >
      {hasUnselect && (
        <MenuItem
          selected={slotKey === ''}
          disabled={slotKey === ''}
          onClick={() => onSlot('')}
        >
          <ListItemIcon>
            <Replay />
          </ListItemIcon>
          <ListItemText>{t`ui:unselect`}</ListItemText>
        </MenuItem>
      )}
      {hasUnselect && <Divider />}
      {allArtifactSlotKeys.map((key) => (
        <MenuItem
          key={key}
          selected={slotKey === key}
          disabled={slotKey === key}
          onClick={() => onSlot(key)}
        >
          <ListItemIcon>
            <SlotIcon slotKey={key} />
          </ListItemIcon>
          <ListItemText>{t(`artifact:slotName:${key}`)}</ListItemText>
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
