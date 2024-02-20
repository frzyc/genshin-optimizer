import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { Button } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SnowContext } from '../Context/SnowContext'

export function SnowToggle() {
  const { snow, setSnow } = useContext(SnowContext)
  const { t } = useTranslation()
  return (
    <Button
      fullWidth
      color={snow ? 'success' : 'secondary'}
      onClick={() => setSnow(!snow)}
      startIcon={snow ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
    >
      &#10052; {t('settings:letsnow')} &#10052;
    </Button>
  )
}
