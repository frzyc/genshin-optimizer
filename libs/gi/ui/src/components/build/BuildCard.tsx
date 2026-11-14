import { CardThemed } from '@genshin-optimizer/common/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import ScienceIcon from '@mui/icons-material/Science'
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

export type BuildCardActionKey =
  | 'edit'
  | 'copyTc'
  | 'duplicate'
  | 'equip'
  | 'delete'

export function BuildCard({
  avatar,
  name,
  description,
  source,
  active = false,
  onActive,
  children,
  onEdit,
  onCopyToTc,
  onDupe,
  onEquip,
  onRemove,
  disabledTips = {},
  hideFooter = false,
}: {
  avatar?: ReactNode
  name: ReactNode
  description?: ReactNode
  /** Loadout name for `srcTeamCharId` display. */
  source?: string
  active?: boolean
  onActive?: () => void
  children: ReactNode
  onEdit?: () => void
  onCopyToTc?: () => void
  onDupe?: () => void
  onEquip?: () => void
  onRemove?: () => void
  /**
   * Explains why an action is unavailable. Shown in place of the action's
   * regular tooltip when its handler is not provided (button is disabled).
   */
  disabledTips?: Partial<Record<BuildCardActionKey, ReactNode>>
  hideFooter?: boolean
}) {
  const { t } = useTranslation('build')
  const clickableAreaContent = (
    <Box>
      <CardHeader
        avatar={avatar}
        disableTypography
        title={
          <Box>
            <Typography noWrap gutterBottom variant="h6">
              {name}
            </Typography>
            {source && (
              <Typography
                noWrap
                variant="caption"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {t('buildCard.source', { name: source })}
              </Typography>
            )}
          </Box>
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
    </Box>
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
        <Button
          color="neutral300"
          onClick={onActive}
          variant="outlined"
          sx={{ p: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          {clickableAreaContent}
        </Button>
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
          <BuildCardAction
            title={t('buildCardTip.edit')}
            disabledTip={disabledTips.edit}
            onClick={onEdit}
            icon={<EditIcon />}
          />
          <BuildCardAction
            title={t('buildCardTip.copyTc')}
            disabledTip={disabledTips.copyTc}
            onClick={onCopyToTc}
            icon={<ScienceIcon />}
          />
          <BuildCardAction
            title={t('buildCardTip.duplicate')}
            disabledTip={disabledTips.duplicate}
            onClick={onDupe}
            icon={<ContentCopyIcon />}
          />
          <BuildCardAction
            title={t('buildCardTip.equip')}
            disabledTip={disabledTips.equip}
            onClick={onEquip}
            icon={<CheckroomIcon />}
          />
          <BuildCardAction
            title={t('buildCardTip.delete')}
            disabledTip={disabledTips.delete}
            onClick={onRemove}
            icon={<DeleteForeverIcon />}
            color="error"
          />
        </CardActions>
      )}
    </CardThemed>
  )
}

function BuildCardAction({
  title,
  disabledTip,
  onClick,
  icon,
  color = 'info',
}: {
  title: ReactNode
  disabledTip?: ReactNode
  onClick?: () => void
  icon: ReactNode
  color?: 'info' | 'error'
}) {
  return (
    <Tooltip
      title={<Typography>{(!onClick && disabledTip) || title}</Typography>}
      placement="top"
      arrow
    >
      {/* Wrapper so the tooltip still shows when the button is disabled */}
      <Box>
        <IconButton
          color={color}
          size="small"
          onClick={onClick}
          disabled={!onClick}
        >
          {icon}
        </IconButton>
      </Box>
    </Tooltip>
  )
}
