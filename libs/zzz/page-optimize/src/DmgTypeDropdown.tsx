import { DropdownButton } from '@genshin-optimizer/common/ui'
import type { DamageType } from '@genshin-optimizer/zzz/formula'
import { Box, MenuItem } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function DmgTypeDropdown<T extends DamageType>({
  dmgType,
  keys,
  setDmgType,
}: {
  dmgType?: T
  keys: T[]
  setDmgType: (dmgType?: T) => void
}) {
  const { t } = useTranslation(['page_optimize', 'statKey_gen'])
  return (
    <DropdownButton
      title={
        <Box sx={{ textWrap: 'nowrap' }}>
          {t('page_optimize:dmgType')}
          {dmgType ? t(`statKey_gen:${dmgType}`) : t('page_optimize:any')}
        </Box>
      }
    >
      <MenuItem
        key={'any'}
        selected={!dmgType}
        disabled={!dmgType}
        onClick={() => setDmgType()}
      >
        {t('page_optimize:any')}
      </MenuItem>
      {keys.map((k) => (
        <MenuItem
          key={k}
          selected={dmgType === k}
          disabled={dmgType === k}
          onClick={() => setDmgType(k)}
        >
          {t(`statKey_gen:${k}`)}
        </MenuItem>
      ))}
    </DropdownButton>
  )
}
