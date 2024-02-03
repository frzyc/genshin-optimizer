import { CardThemed } from '@genshin-optimizer/common_ui'
import type { RelicSlotKey } from '@genshin-optimizer/sr_consts'
import { CardContent, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function EmptyRelicCard({ slot }: { slot: RelicSlotKey }) {
  const { t } = useTranslation('relic')
  return (
    <CardThemed sx={{ height: '100%' }}>
      <CardContent>
        <Typography>
          {t('slot')}: {slot}
        </Typography>
        <Typography>{t('empty')}</Typography>
      </CardContent>
    </CardThemed>
  )
}
