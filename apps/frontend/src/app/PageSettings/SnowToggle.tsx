import { Button } from '@mui/material'
import { useContext } from 'react'
import { SnowContext } from '../Context/SnowContext'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import { useTranslation } from 'react-i18next'

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
