import { CardThemed } from '@genshin-optimizer/common/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import ScienceIcon from '@mui/icons-material/Science'
import {
  CardActionArea,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export function BuildCard({
  name,
  description,
  active = false,
  onActive,
  children,
  onEdit,
  onCopyToTc,
  onDupe,
  onEquip,
  onRemove,
  hideFooter = false,
}: {
  name: ReactNode
  description?: ReactNode
  active?: boolean
  onActive?: () => void
  children: ReactNode
  onEdit?: () => void
  onCopyToTc?: () => void
  onDupe?: () => void
  onEquip?: () => void
  onRemove?: () => void
  hideFooter?: boolean
}) {
  const { t } = useTranslation('build')
  const clickableAreaContent = (
    <>
      <CardHeader
        title={
          <Typography noWrap gutterBottom variant="h6">
            {name}
          </Typography>
        }
        action={
          description && (
            <Tooltip title={<Typography>{description}</Typography>}>
              <InfoIcon />
            </Tooltip>
          )
        }
      />
      <CardContent sx={{ pt: 0, pb: 1 }}>{children}</CardContent>
    </>
  )
  return (
    <CardThemed
      bgt="light"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: active ? '0px 0px 0px 2px green inset' : undefined,
      }}
    >
      {onActive ? (
        <CardActionArea onClick={onActive}>
          {clickableAreaContent}
        </CardActionArea>
      ) : (
        clickableAreaContent
      )}
      {!hideFooter && (
        <CardActions
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            marginTop: 'auto',
          }}
        >
          <Tooltip
            title={<Typography>{t('buildCardTip.edit')}</Typography>}
            placement="top"
            arrow
          >
            <IconButton
              color="info"
              size="small"
              onClick={onEdit}
              disabled={!onEdit}
            >
              <span>
                <EditIcon />
              </span>
            </IconButton>
          </Tooltip>
          <Tooltip
            title={<Typography>{t('buildCardTip.copyTc')}</Typography>}
            placement="top"
            arrow
          >
            <IconButton
              color="info"
              size="small"
              onClick={onCopyToTc}
              disabled={!onCopyToTc}
            >
              <ScienceIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={<Typography>{t('buildCardTip.duplicate')}</Typography>}
            placement="top"
            arrow
          >
            <IconButton
              color="info"
              size="small"
              onClick={onDupe}
              disabled={!onDupe}
            >
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={<Typography>{t('buildCardTip.equip')}</Typography>}
            placement="top"
            arrow
          >
            <IconButton
              color="info"
              size="small"
              onClick={onEquip}
              disabled={!onEquip}
            >
              <CheckroomIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={<Typography>{t('buildCardTip.delete')}</Typography>}
            placement="top"
            arrow
          >
            <IconButton
              color="error"
              size="small"
              onClick={onRemove}
              disabled={!onRemove}
            >
              <DeleteForeverIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </CardThemed>
  )
}
