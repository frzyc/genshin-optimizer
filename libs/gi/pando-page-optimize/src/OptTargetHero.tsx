import { useResolvedOptTarget } from '@genshin-optimizer/gi/formula-ui'
import FlagIcon from '@mui/icons-material/Flag'
import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useOptimizePage } from './context/OptimizePageContext'

export function OptTargetHero() {
  const { t } = useTranslation('page_optimize')
  const { tag } = useResolvedOptTarget()
  const { openTargetPicker } = useOptimizePage()

  if (tag) return null

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        gap: 1.5,
        py: 1,
        px: 1.5,
        borderRadius: 1,
        border: 1,
        borderStyle: 'dashed',
        borderColor: 'warning.main',
      }}
    >
      <FlagIcon color="warning" />
      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2">{t('targetHeroTitle')}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('targetHeroBody')}
        </Typography>
      </Box>
      <Button
        size="small"
        variant="contained"
        color="warning"
        onClick={openTargetPicker}
      >
        {t('selectOptTarget')}
      </Button>
    </Box>
  )
}
