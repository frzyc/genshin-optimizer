import {
  Box,
  CircularProgress,
  Link,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useOptimizeReadiness } from './useOptimizeReadiness'

export function OptimizeReadinessBadge() {
  const { t } = useTranslation('page_optimize')
  const { items, readyCount, total, isReady } = useOptimizeReadiness()
  if (isReady) return null

  const progress = (readyCount / total) * 100
  const firstIncomplete = items.find((i) => !i.done)

  return (
    <Tooltip
      title={
        <Stack spacing={0.5} sx={{ py: 0.5 }}>
          <Typography variant="caption" fontWeight={600}>
            {readyCount}/{total}
          </Typography>
          {items.map((item) => (
            <Box key={item.id}>
              {item.done ? (
                <Typography variant="caption" color="success.light">
                  ✓ {item.label}
                </Typography>
              ) : (
                <Link
                  component="button"
                  variant="caption"
                  color="inherit"
                  underline="hover"
                  onClick={item.action}
                  sx={{ textAlign: 'left' }}
                >
                  {item.label}
                </Link>
              )}
            </Box>
          ))}
        </Stack>
      }
    >
      <Box
        component="button"
        type="button"
        onClick={() => firstIncomplete?.action()}
        aria-label={t('readinessProgressAria', { readyCount, total })}
        sx={{
          border: 'none',
          background: 'none',
          p: 0.5,
          cursor: 'pointer',
          borderRadius: 1,
          position: 'relative',
          width: 40,
          height: 40,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <CircularProgress
          variant="determinate"
          value={progress}
          size={36}
          thickness={4}
          color="warning"
        />
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            fontSize: '0.65rem',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          {readyCount}/{total}
        </Typography>
      </Box>
    </Tooltip>
  )
}
