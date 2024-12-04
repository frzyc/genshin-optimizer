import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { extractJSON } from '@genshin-optimizer/common/util'
import type { CustomMultiTarget } from '@genshin-optimizer/gi/db'
import { validateCustomMultiTarget } from '@genshin-optimizer/gi/db'
import UploadIcon from '@mui/icons-material/Upload'
import type { ButtonProps } from '@mui/material'
import {
  Button,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function CustomMultiTargetImportBtn({
  setCustomMultiTarget,
  btnProps = {},
}: {
  setCustomMultiTarget: (t: CustomMultiTarget) => void
  btnProps?: ButtonProps
}) {
  const { t } = useTranslation('loadout')
  const [show, onShow, onHide] = useBoolState()
  const [data, setData] = useState('')

  const importData = () => {
    try {
      const dataObj = extractJSON(data)
      const validated = dataObj && validateCustomMultiTarget(dataObj)
      if (!validated) window.alert(t('mTargetImport.invalid'))
      else {
        setCustomMultiTarget(validated)
        onHide()
      }
    } catch (e) {
      window.alert(t('mTargetImport.failed') + `\n${e}`)
      return
    }
  }
  return (
    <>
      <Button {...btnProps} onClick={onShow}>
        {t('mTargetImport.button')}
      </Button>
      <ModalWrapper open={show} onClose={onHide}>
        <CardThemed>
          <CardHeader title={t('mTargetImport.title')} />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography>{t('mTargetImport.desc')}</Typography>
            <TextField
              fullWidth
              label={t('mTargetImport.label')}
              placeholder={t('mTargetImport.placeholder')}
              value={data}
              onChange={(e) => setData(e.target.value)}
              multiline
              rows={4}
            />
            <Button
              startIcon={<UploadIcon />}
              disabled={!data}
              onClick={importData}
            >
              {t('mTargetImport.import')}
            </Button>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
