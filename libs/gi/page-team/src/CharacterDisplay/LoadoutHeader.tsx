import { useBoolState } from '@genshin-optimizer/common/react-util'
import { BootstrapTooltip } from '@genshin-optimizer/common/ui'
import type { ElementKey } from '@genshin-optimizer/gi/consts'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import BorderColorIcon from '@mui/icons-material/BorderColor'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import PersonIcon from '@mui/icons-material/Person'
import { Box, Button, Typography } from '@mui/material'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { BuildsEditorModal } from './BuildsEditorModal'
import { LoadoutEditorModal } from './LoadoutEditorModal'

export function LoadoutHeader({ elementKey }: { elementKey: ElementKey }) {
  const { teamChar, loadoutDatum } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { t } = useTranslation('page_team')
  const [showLoadout, onShowLoadout, onCloseLoadout] = useBoolState()
  const [showBuild, onShowBuild, onCloseBuild] = useBoolState()

  return (
    <Box sx={{ display: 'flex' }}>
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
        <Button
          variant="outlined"
          fullWidth
          startIcon={<PersonIcon />}
          color={elementKey}
          sx={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderTopRightRadius: 0,
          }}
          onClick={onShowLoadout}
        >
          <Typography variant="h6" noWrap>
            {teamChar.name}
          </Typography>
        </Button>
      </BootstrapTooltip>
      <LoadoutEditorModal open={showLoadout} onClose={onCloseLoadout} />
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
        <Button
          variant="outlined"
          fullWidth
          startIcon={<CheckroomIcon />}
          color={elementKey}
          sx={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            borderTopLeftRadius: 0,
          }}
          onClick={onShowBuild}
        >
          <Typography variant="h6" noWrap>
            {database.teams.getActiveBuildName(loadoutDatum)}
          </Typography>
        </Button>
      </BootstrapTooltip>
      <BuildsEditorModal open={showBuild} onClose={onCloseBuild} />
    </Box>
  )
}
