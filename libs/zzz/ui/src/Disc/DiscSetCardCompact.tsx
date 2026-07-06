import { CardThemed, ImgIcon, SqBadge } from '@genshin-optimizer/common/ui'
import { discDefIcon } from '@genshin-optimizer/zzz/assets'
import type { DiscSlotKey } from '@genshin-optimizer/zzz/consts'
import type { ICachedDisc } from '@genshin-optimizer/zzz/db'
import { useDiscSets } from '@genshin-optimizer/zzz/db-ui'
import { Typography } from '@mui/material'
import { Stack } from '@mui/system'
import { useTranslation } from 'react-i18next'
import { ZCard } from '../Components'
import { COMPACT_CARD_HEIGHT_PX, EmptyCompactCard } from '../util'
import { DiscSetName } from './DiscTrans'

export function DiscSetCardCompact({
  discs,
}: {
  discs: Record<DiscSlotKey, ICachedDisc | undefined>
}) {
  const { t } = useTranslation('disc')
  const sets = useDiscSets(discs)

  return sets && Object.keys(sets).length ? (
    <ZCard
      bgt="dark"
      sx={{
        width: '100%',
      }}
    >
      <Stack
        component="div"
        sx={{ p: 0.5, height: `${COMPACT_CARD_HEIGHT_PX}px` }}
        spacing={0.5}
      >
        {Object.entries(sets).map(([key, count]) => (
          <CardThemed
            key={key}
            bgt="light"
            sx={(theme) => ({
              height: `${
                (COMPACT_CARD_HEIGHT_PX - parseFloat(theme.spacing(0.5 * 4))) /
                3
              }px`,
              display: 'flex',
              px: 0.5,
              borderRadius: '12px',
              alignItems: 'center',
              gap: 1,
            })}
          >
            <ImgIcon size={2.4} src={discDefIcon(key)} />
            <Typography
              key={key}
              sx={{
                fontWeight: '900',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                flexGrow: 1,
              }}
            >
              <DiscSetName setKey={key} />
            </Typography>
            <SqBadge
              color="success"
              sx={{
                borderRadius: '12px',
                px: '10px',
                py: '5px',
                fontWeight: '900',
              }}
            >
              {count}
            </SqBadge>
          </CardThemed>
        ))}
      </Stack>
    </ZCard>
  ) : (
    <EmptyCompactCard placeholder={t('noActiveSets')} />
  )
}
