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

// TODO: Translation
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
  const clickableAreaContent = (
    <>
      <CardHeader
        title={name}
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
            title={<Typography>Edit Build Settings</Typography>}
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
            title={<Typography>Copy to TC Builds</Typography>}
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
            title={<Typography>Duplicate Build</Typography>}
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
            title={<Typography>Equip Build</Typography>}
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
            title={<Typography>Delete Build</Typography>}
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
