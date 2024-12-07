import { useBoolState } from '@genshin-optimizer/common/react-util'
import { SqBadge } from '@genshin-optimizer/common/ui'
import { TeamCharacterContext } from '@genshin-optimizer/gi/db-ui'
import BarChartIcon from '@mui/icons-material/BarChart'
import type { ButtonProps } from '@mui/material'
import { Button } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import BonusStatsModal from './BonusStatsModal'

export function DetailStatButton({
  buttonProps = {},
}: {
  buttonProps?: ButtonProps
}) {
  const { t } = useTranslation('page_character')
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamChar: { bonusStats },
  } = useContext(TeamCharacterContext)
  const bStatsNum = Object.keys(bonusStats).length
  return (
    <>
      <Button
        color="info"
        startIcon={<BarChartIcon />}
        onClick={onOpen}
        {...buttonProps}
      >
        {t('addStats.title')}
        {!!bStatsNum && (
          <SqBadge sx={{ ml: 1 }} color="success">
            {bStatsNum}
          </SqBadge>
        )}
      </Button>
      <BonusStatsModal open={open} onClose={onClose} />
    </>
  )
}
