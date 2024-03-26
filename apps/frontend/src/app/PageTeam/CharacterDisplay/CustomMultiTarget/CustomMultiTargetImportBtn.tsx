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

export default function CustomMultiTargetImportBtn({
  setCustomMultiTarget,
  btnProps = {},
}: {
  setCustomMultiTarget: (t: CustomMultiTarget) => void
  btnProps?: ButtonProps
}) {
  const [show, onShow, onHide] = useBoolState()
  const [data, setData] = useState('')

  const importData = () => {
    try {
      const dataObj = JSON.parse(data)
      const validated = validateCustomMultiTarget(dataObj)
      if (!validated) window.alert('Invalid Multi-Optimization Config')
      else {
        setCustomMultiTarget(validated)
        onHide()
      }
    } catch (e) {
      window.alert(`Data Import failed. ${e}`)
      return
    }
  }
  return (
    <>
      <Button {...btnProps} onClick={onShow}>
        Import Multi-Opt
      </Button>
      <ModalWrapper open={show} onClose={onHide}>
        <CardThemed>
          <CardHeader title="Import Multi-Opt" />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography>Import a Multi-opt in JSON form below.</Typography>
            <TextField
              fullWidth
              label="JSON Data"
              placeholder="Paste your Team JSON here"
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
              Import
            </Button>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
