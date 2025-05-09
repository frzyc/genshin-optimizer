import { AdResponsive } from '@genshin-optimizer/common/ad'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import {
  BuildInfoAlert,
  EquippedBuildInfoAlert,
  GOAdWrapper,
  TCBuildInfoAlert,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  Typography,
} from '@mui/material'
import { useCallback, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { BuildEquipped } from './Build/BuildEquipped'
import BuildReal from './Build/BuildReal'
import BuildTc from './Build/BuildTc'

export function BuildsEditorModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation('page_team')

  return (
    <ModalWrapper open={open} onClose={onClose}>
      <CardThemed>
        <CardHeader
          title={t('buildInfo.editorTitle')}
          avatar={<CheckroomIcon />}
          titleTypographyProps={{ variant: 'h6' }}
          action={
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          }
        />
        <Divider />
        <CardContent>
          <BuildManagementContent onClose={onClose} />
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
const columns = { xs: 1, sm: 1, md: 2, lg: 2 }
function BuildManagementContent({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation('loadout')
  const database = useDatabase()
  const {
    teamCharId,
    loadoutDatum,
    teamChar: { key: characterKey, buildIds, buildTcIds },
  } = useContext(TeamCharacterContext)

  const weaponTypeKey = getCharStat(characterKey).weaponType
  const onChangeBuild = useCallback(
    () => setTimeout(onClose, 1000),

    [onClose]
  )
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <EquippedBuildInfoAlert />
      <Grid container columns={columns} spacing={2}>
        <Grid item xs={1}>
          <BuildEquipped
            active={loadoutDatum?.buildType === 'equipped'}
            onChangeBuild={onChangeBuild}
          />
        </Grid>
        <Grid item xs={1}>
          <AdResponsive dataAdSlot="5385429639" bgt="light" Ad={GOAdWrapper} />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="h6">{t('loadoutSettings.builds')}</Typography>
        <Button
          startIcon={<AddIcon />}
          color="info"
          size="small"
          onClick={() => database.teamChars.newBuild(teamCharId)}
        >
          {t('loadoutSettings.newBuildBtn')}
        </Button>
      </Box>
      <BuildInfoAlert />
      <Box>
        <Grid container columns={columns} spacing={2}>
          {buildIds.map((id) => (
            <Grid item xs={1} key={id}>
              <BuildReal
                buildId={id}
                active={
                  loadoutDatum?.buildType === 'real' &&
                  loadoutDatum?.buildId === id
                }
                onChangeBuild={onChangeBuild}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="h6">{t('loadoutSettings.tcBuilds')}</Typography>
        <Button
          startIcon={<AddIcon />}
          color="info"
          size="small"
          onClick={() =>
            database.teamChars.newBuildTcFromBuild(teamCharId, weaponTypeKey)
          }
        >
          {t('loadoutSettings.newTcBuildBtn')}
        </Button>
      </Box>
      <TCBuildInfoAlert />
      <Box>
        <Grid container columns={columns} spacing={2}>
          {buildTcIds.map((id) => (
            <Grid item xs={1} key={id}>
              <BuildTc
                buildTcId={id}
                active={
                  loadoutDatum?.buildType === 'tc' &&
                  loadoutDatum?.buildTcId === id
                }
                onChangeBuild={onChangeBuild}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  )
}
