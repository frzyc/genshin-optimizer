import { useBoolState } from '@genshin-optimizer/common/react-util'
import { ModalWrapper } from '@genshin-optimizer/common/ui'
import { Difference } from '@mui/icons-material'
import { Box, Button, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export default function CompareBuildButton({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation('page_character')
  const [show, onShow, onHide] = useBoolState(false)

  return (
    <>
      <ModalWrapper
        open={show}
        onClose={onHide}
        containerProps={{ maxWidth: 'xl' }}
      >
        <Box>{children}</Box>
      </ModalWrapper>
      <Tooltip
        title={<Typography>{t`tabEquip.compare`}</Typography>}
        placement="top"
        arrow
      >
        <Button color="info" size="small" onClick={onShow}>
          <Difference />
        </Button>
      </Tooltip>
    </>
  )
}
