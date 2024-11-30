import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
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
import { useNavigate } from "react-router-dom"
import { useDatabase } from '@genshin-optimizer/gi/db-ui'

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
  const database = useDatabase()
  const navigate = useNavigate()

  const importData = () => {
    try {
      const dataObj = JSON.parse(data)
      const validated = validateCustomMultiTarget(dataObj)
      if (!validated) {
        const validatedTeam = database.teams.validate(dataObj) // The user is trying to import a team by accident
        if (validatedTeam) {
          if (window.confirm(t('mTargetImport.team'))) {
            navigate('/teams', { state: { openImportModal: true, teamData: JSON.stringify(dataObj) } }) // Redirect and automatically open the team import form
          }
        }
        else window.alert(t('mTargetImport.invalid'))
      }
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
