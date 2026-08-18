import { CardThemed } from '@genshin-optimizer/common/ui'
import { objMap } from '@genshin-optimizer/common/util'
import { SdStorage } from '@mui/icons-material'
import {
  Box,
  CardContent,
  CircularProgress,
  Divider,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

const MAX_LOCAL_STORAGE_MB = 5
const COLORS = {
  activeGo: '#550055',
  goDb1: '#555500',
  goDb2: '#005555',
  goDb3: '#55aa55',
  goDb4: '#5555aa',
  activeZo: '#aa5555',
  zoDb1: '#aaaa55',
  zoDb2: '#55aaaa',
  zoDb3: '#aa55aa',
  zoDb4: '#ffaaff',
}
export function LocalStorageUsageCard() {
  const { t } = useTranslation('common')
  let totalBytes = 0
  const bytesByCategory = {
    activeGo: 0,
    goDb1: 0,
    goDb2: 0,
    goDb3: 0,
    goDb4: 0,
    activeZo: 0,
    zoDb1: 0,
    zoDb2: 0,
    zoDb3: 0,
    zoDb4: 0,
  }

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue
    // Calculate bytes for both the key and the value
    const value = localStorage.getItem(key)
    const size = new Blob(value ? [key, value] : [key]).size
    totalBytes += size
    if (key.startsWith('zzz_extraDatabase')) {
      switch (key[key.length - 1]) {
        case '1':
          bytesByCategory.zoDb1 += size
          continue
        case '2':
          bytesByCategory.zoDb2 += size
          continue
        case '3':
          bytesByCategory.zoDb3 += size
          continue
        case '4':
          bytesByCategory.zoDb4 += size
          continue
      }
    } else if (key.startsWith('zzz_')) {
      bytesByCategory.activeZo += size
    } else if (key.startsWith('extraDatabase')) {
      switch (key[key.length - 1]) {
        case '1':
          bytesByCategory.goDb1 += size
          continue
        case '2':
          bytesByCategory.goDb2 += size
          continue
        case '3':
          bytesByCategory.goDb3 += size
          continue
        case '4':
          bytesByCategory.goDb4 += size
          continue
      }
    } else {
      bytesByCategory.activeGo += size
    }
  }
  const MBByCategory = objMap(bytesByCategory, (v) => v / 1024 / 1024)
  const percentByCategory = objMap(
    MBByCategory,
    (v) => (v / MAX_LOCAL_STORAGE_MB) * 100
  )

  const totalMB = totalBytes / 1024 / 1024
  const percent = (totalMB / MAX_LOCAL_STORAGE_MB) * 100
  let currentPercent = percent

  return (
    <CardThemed bgt="light">
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SdStorage sx={{ fontSize: '40px' }} />
        <Typography variant="h5">{t('storage.title')}</Typography>
      </CardContent>
      <Divider />
      <CardContent
        sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}
      >
        <Typography width={'100%'}>{t('storage.info')}</Typography>
        <CircularProgress
          size={100}
          thickness={5}
          variant="determinate"
          value={100}
          sx={{
            color: '#222222',
          }}
        />
        {Object.entries(percentByCategory)
          .sort((a, b) => a[1] - b[1])
          .map(([key, percent]) => {
            const prog = (
              <CircularProgress
                key={key}
                size={100}
                thickness={5}
                variant="determinate"
                value={currentPercent}
                sx={{ ml: '-116px', color: COLORS[key] }}
              />
            )
            currentPercent -= percent
            return prog
          })}
        <Typography
          variant="h6"
          color={percent > 90 ? 'error' : percent > 75 ? 'orange' : undefined}
        >
          {totalMB.toFixed(2)}MB / {MAX_LOCAL_STORAGE_MB}MB (
          {percent.toFixed(2)}%)
        </Typography>
        <Box display="flex" flexWrap="wrap">
          {Object.entries(MBByCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([key, megabytes]) => (
              <Box width="100%" display="flex" gap={1}>
                <Box
                  display="inline-block"
                  width="16px"
                  height="16px"
                  sx={{ backgroundColor: COLORS[key] }}
                />
                <Typography key={key}>
                  {t(`storage.${key}`)} - {megabytes.toFixed(2)}MB (
                  {percentByCategory[key].toFixed(2)}%)
                </Typography>
              </Box>
            ))}
        </Box>
      </CardContent>
    </CardThemed>
  )
}
