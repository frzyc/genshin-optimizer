import { useBoolState } from '@genshin-optimizer/common/react-util'
import { BootstrapTooltip } from '@genshin-optimizer/common/ui'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  CardActionArea,
  CardContent,
  Divider,
  Typography,
} from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { BuildsEditorModal } from './BuildsEditorModal'
import { LoadoutEditorModal } from './LoadoutEditorModal'

export function LoadoutHeader() {
  const { teamChar, loadoutDatum } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { t } = useTranslation('page_team')
  const [showLoadout, onShowLoadout, onCloseLoadout] = useBoolState()
  const [showBuild, onShowBuild, onCloseBuild] = useBoolState()

  return (
    <Box sx={{ display: 'flex' }}>
      <CardActionArea onClick={onShowLoadout}>
        <BootstrapTooltip
          placement="top"
          title={
            <Box>
              <Box sx={{ display: 'flex', color: 'info.light', gap: 1 }}>
                <BorderColorIcon />
                <Typography>
                  <strong>{t('loadout.edit')}</strong>
                </Typography>
              </Box>
              {!!teamChar.description && (
                <Typography>{teamChar.description}</Typography>
              )}
            </Box>
          }
        >
          <CardContent
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
              position: 'relative',
              '&:hover': {
                color: 'info.light',
              },
              alignItems: 'center',
            }}
          >
            <PersonIcon />
            <Typography
              variant="h6"
              noWrap
              sx={{
                gap: 1,
                alignItems: 'center',
                justifyContent: 'center',
                textShadow: '#000 0 0 10px !important',
              }}
            >
              <strong>{teamChar.name}</strong>
            </Typography>
          </CardContent>
        </BootstrapTooltip>
      </CardActionArea>
      <LoadoutEditorModal open={showLoadout} onClose={onCloseLoadout} />
      <Divider orientation="vertical" flexItem />
      <CardActionArea onClick={onShowBuild}>
        <BootstrapTooltip
          placement="top"
          title={
            <Box>
              <Box sx={{ display: 'flex', color: 'info.light', gap: 1 }}>
                <BorderColorIcon />
                <Typography>
                  <strong>{t('buildInfo.editorTitle')}</strong>
                </Typography>
              </Box>
              {!!teamChar.description && (
                <Typography>{teamChar.description}</Typography>
              )}
            </Box>
          }
        >
          <CardContent
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'center',
              position: 'relative',
              '&:hover': {
                color: 'info.light',
              },
              alignItems: 'center',
            }}
          >
            <CheckroomIcon />
            <Typography
              variant="h6"
              noWrap
              sx={{
                gap: 1,
                alignItems: 'center',
                justifyContent: 'center',
                textShadow: '#000 0 0 10px !important',
              }}
            >
              {database.teams.getActiveBuildName(loadoutDatum)}
            </Typography>
          </CardContent>
        </BootstrapTooltip>
      </CardActionArea>
      <BuildsEditorModal open={showBuild} onClose={onCloseBuild} />
    </Box>
  )
}
