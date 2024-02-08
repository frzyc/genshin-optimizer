import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
} from '@mui/material'
import { Trans, useTranslation } from 'react-i18next'
import ImgIcon from '../../../../Components/Image/ImgIcon'
import kqmIcon from './kqm.png'

export default function KQMSButton({
  action,
  disabled,
}: {
  action: () => void
  disabled: boolean
}) {
  const { t } = useTranslation(['page_character', 'ui'])
  const [open, onOpen, onClose] = useBoolState()
  return (
    <>
      <Button
        color="keqing"
        onClick={onOpen}
        startIcon={<ImgIcon src={kqmIcon} />}
        disabled={disabled}
      >
        {t('tabTheorycraft.kqmsDialog.kqmsBtn')}
      </Button>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>{t('tabTheorycraft.kqmsDialog.title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            <Trans t={t} i18nKey="tabTheorycraft.kqmsDialog.content">
              This will replace your current <strong>substat setup</strong> with
              one that adheres to the{' '}
              <Link
                href="https://compendium.keqingmains.com/kqm-standards"
                target="_blank"
              >
                KQM Standards
              </Link>
              .
            </Trans>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="error">
            {t('ui:close')}
          </Button>
          <Button
            color="success"
            onClick={() => {
              onClose()
              action()
            }}
            autoFocus
          >
            {t('tabTheorycraft.kqmsDialog.kqmsBtn')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
