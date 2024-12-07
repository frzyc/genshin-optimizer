import { useBoolState } from '@genshin-optimizer/common/react-util'
import { SqBadge } from '@genshin-optimizer/common/ui'
import { TeamCharacterContext } from '@genshin-optimizer/gi/db-ui'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import type { ButtonProps } from '@mui/material'
import { Box, Button } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { CustomMultiTargetModal } from './CustomMultiTargetModal'

export function CustomMultiTargetButton({
  buttonProps = {},
}: {
  buttonProps?: ButtonProps
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onClose] = useBoolState()
  const { teamChar } = useContext(TeamCharacterContext)
  return (
    <>
      <Button
        color="info"
        onClick={onShow}
        startIcon={<DashboardCustomizeIcon />}
        {...buttonProps}
      >
        <Box display="flex" gap={1} alignItems="center">
          <span>{t('multiTarget.title')}</span>
          <SqBadge
            color={teamChar.customMultiTargets.length ? 'success' : 'secondary'}
          >
            {teamChar.customMultiTargets.length}
          </SqBadge>
        </Box>
      </Button>
      <CustomMultiTargetModal open={show} onClose={onClose} />
    </>
  )
}
