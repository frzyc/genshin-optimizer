import CloseIcon from '@mui/icons-material/Close'
import FilterListIcon from '@mui/icons-material/FilterList'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { Box, Button, Paper, useMediaQuery, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useOptimizePage } from '../context/OptimizePageContext'

export function MobileOptimizeBar() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { t } = useTranslation('page_optimize')
  const { optimizeActions, setFiltersOpen } = useOptimizePage()

  if (!isMobile || !optimizeActions) return null

  const { disabled, optimizing, onRun, onCancel } = optimizeActions

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 120,
        p: 1,
        display: 'flex',
        gap: 1,
        borderRadius: 0,
      }}
    >
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={() => setFiltersOpen(true)}
        sx={{ flexShrink: 0 }}
      >
        {t('filters')}
      </Button>
      <Button
        fullWidth
        disabled={disabled && !optimizing}
        color={optimizing ? 'error' : 'primary'}
        startIcon={optimizing ? <CloseIcon /> : <TrendingUpIcon />}
        onClick={optimizing ? onCancel : onRun}
      >
        {optimizing ? t('cancel') : t('optimize')}
      </Button>
    </Paper>
  )
}

/** Reserve space so content is not hidden behind the fixed bar. */
export function MobileOptimizeBarSpacer() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { optimizeActions } = useOptimizePage()
  if (!isMobile || !optimizeActions) return null
  return <Box sx={{ height: 72 }} />
}
