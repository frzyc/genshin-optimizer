import { CardThemed } from '@genshin-optimizer/common/ui'
import { objMap } from '@genshin-optimizer/common/util'
import { SdStorage } from '@mui/icons-material'
import {
  Alert,
  Box,
  CardContent,
  CircularProgress,
  Divider,
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  tableCellClasses,
} from '@mui/material'
import { useTranslation } from 'react-i18next'

const MAX_LOCAL_STORAGE_MB = 5
const COLORS = {
  activeGo: '#55aaff',
  goDb1: '#5577ff',
  goDb2: '#22ff55',
  goDb3: '#ffaa55',
  goDb4: '#ff6655',
  activeZo: '#ff2255',
  zoDb1: '#aa55ff',
  zoDb2: '#aaff55',
  zoDb3: '#2255aa',
  zoDb4: '#22aa55',
}
const DISPLAY_PERCENT_THRESH = 1
const WARNING_PERCENT_THRESH = 75
const ERROR_PERCENT_THRESH = 90
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
        sx={{
          display: 'flex',
          alignItems: 'start',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        {percent > WARNING_PERCENT_THRESH && (
          <Alert
            sx={{ width: '100%' }}
            severity={percent > ERROR_PERCENT_THRESH ? 'error' : 'warning'}
          >
            {t('storage.warning')}
          </Alert>
        )}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexBasis: 250,
            flexGrow: 1,
            gap: 2,
          }}
        >
          <Typography pb={4}>{t('storage.info')}</Typography>
          {/* Stack a bunch of circle bars together */}
          <CircularProgress
            size={100}
            thickness={5}
            variant="determinate"
            value={100}
            sx={{
              color: 'contentNormal.main',
            }}
          />
          {Object.entries(percentByCategory)
            .sort((a, b) => a[1] - b[1])
            .filter(([, percent]) => percent > DISPLAY_PERCENT_THRESH)
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
          {/* Text next to circle bars */}
          <Typography variant="h6">
            <Box
              component="span"
              color={
                percent > ERROR_PERCENT_THRESH
                  ? 'error.main'
                  : percent > WARNING_PERCENT_THRESH
                    ? 'warning.main'
                    : undefined
              }
            >
              {totalMB.toFixed(2)}MB
            </Box>{' '}
            <Box component="span" color="secondary.main">
              / {MAX_LOCAL_STORAGE_MB}MB
            </Box>{' '}
            <br />
            <Box
              component="span"
              color={
                percent > ERROR_PERCENT_THRESH
                  ? 'error.main'
                  : percent > WARNING_PERCENT_THRESH
                    ? 'warning.main'
                    : undefined
              }
            >
              {percent.toFixed(2)}%
            </Box>
          </Typography>
        </Box>
        {/* Table */}
        <Box display="flex">
          <TableContainer sx={{ width: 'max-content' }}>
            <Table
              size="small"
              sx={{
                width: 'max-content',
                [`& .${tableCellClasses.root}`]: {
                  borderBottom: 'none',
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 6 }}>{t('storage.category')}</TableCell>
                  <TableCell>{t('storage.size')}</TableCell>
                </TableRow>
              </TableHead>
              {Object.entries(MBByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([key, megabytes]) => (
                  <TableRow
                    sx={{
                      opacity:
                        percentByCategory[key] > DISPLAY_PERCENT_THRESH
                          ? undefined
                          : 0.5,
                    }}
                  >
                    <TableCell>
                      <Box
                        display="inline-block"
                        width="16px"
                        height="16px"
                        mr={2}
                        sx={{
                          backgroundColor:
                            percentByCategory[key] > DISPLAY_PERCENT_THRESH
                              ? COLORS[key]
                              : undefined,
                        }}
                      />
                      {t(`storage.${key}`)}
                    </TableCell>
                    <TableCell>
                      {megabytes.toFixed(2)}MB (
                      {percentByCategory[key].toFixed(2)}%)
                    </TableCell>
                  </TableRow>
                ))}
            </Table>
          </TableContainer>
        </Box>
      </CardContent>
    </CardThemed>
  )
}
