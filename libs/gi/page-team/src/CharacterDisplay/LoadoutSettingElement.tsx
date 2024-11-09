import { useBoolState } from '@genshin-optimizer/common/react-util'
import { SqBadge } from '@genshin-optimizer/common/ui'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import { TeamCharacterContext, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharEle, getCharStat } from '@genshin-optimizer/gi/stats'
import {
  AdResponsive,
  BuildInfoAlert,
  EquippedBuildInfoAlert,
  FormulaDataContext,
  LoadoutInfoAlert,
  TCBuildInfoAlert,
} from '@genshin-optimizer/gi/ui'
import AddIcon from '@mui/icons-material/Add'
import BarChartIcon from '@mui/icons-material/BarChart'
import CalculateIcon from '@mui/icons-material/Calculate'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import type { ButtonProps } from '@mui/material'
import {
  Box,
  Button,
  CardHeader,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LoadoutDropdown } from '../LoadoutDropdown'
import { BuildEquipped } from './Build/BuildEquipped'
import BuildReal from './Build/BuildReal'
import BuildTc from './Build/BuildTc'
import { CustomMultiTargetButton } from './CustomMultiTarget'
import StatModal from './StatModal'

const columns = { xs: 1, sm: 1, md: 2, lg: 2 }
export default function LoadoutSettingElement() {
  const database = useDatabase()
  const { teamId, teamChar, teamCharId } = useContext(TeamCharacterContext)

  const onChangeTeamCharId = (newTeamCharId: string) => {
    const index = database.teams
      .get(teamId)!
      .loadoutData.findIndex(
        (loadoutDatum) => loadoutDatum?.teamCharId === teamCharId
      )
    if (index < 0) return
    database.teams.set(teamId, (team) => {
      team.loadoutData[index] = { teamCharId: newTeamCharId } as LoadoutDatum
    })
  }
  const elementKey = getCharEle(teamChar.key)
  return (
    <Suspense
      fallback={<Skeleton variant="rectangular" width="100%" height={1000} />}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <LoadoutInfoAlert />
        <LoadoutDropdown
          teamCharId={teamCharId}
          onChangeTeamCharId={onChangeTeamCharId}
          dropdownBtnProps={{
            fullWidth: true,
            sx: { flexGrow: 1, backgroundColor: 'contentLight.main' },
            color: elementKey ?? 'info',
            variant: 'outlined',
          }}
          label
        />
        <Box display="flex" gap={2} flexWrap="wrap">
          <DetailStatButton
            buttonProps={{
              sx: { backgroundColor: 'contentLight.main', flexGrow: 1 },
              color: elementKey ?? 'info',
              variant: 'outlined',
            }}
          />
          <CustomMultiTargetButton
            buttonProps={{
              sx: { backgroundColor: 'contentLight.main', flexGrow: 1 },
              color: elementKey ?? 'info',
              variant: 'outlined',
            }}
          />
          <FormulasButton
            buttonProps={{
              sx: { backgroundColor: 'contentLight.main', flexGrow: 1 },
              color: elementKey ?? 'info',
              variant: 'outlined',
            }}
          />
        </Box>
      </Box>
      <BuildManagementContent />
    </Suspense>
  )
}

function BuildManagementContent() {
  const { t } = useTranslation('loadout')
  const database = useDatabase()
  const {
    teamCharId,
    loadoutDatum,
    teamChar: { key: characterKey, buildIds, buildTcIds },
  } = useContext(TeamCharacterContext)

  const weaponTypeKey = getCharStat(characterKey).weaponType
  return (
    <>
      <CardHeader
        title={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <CheckroomIcon />
            <span>{t('loadoutSettings.title')}</span>
          </Box>
        }
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <EquippedBuildInfoAlert />
        <Grid container columns={columns} spacing={2}>
          <Grid item xs={1}>
            <BuildEquipped active={loadoutDatum?.buildType === 'equipped'} />
          </Grid>
          <Grid item xs={1}>
            <AdResponsive dataAdSlot="5385429639" bgt="light" />
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
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </>
  )
}
function DetailStatButton({ buttonProps = {} }: { buttonProps?: ButtonProps }) {
  const { t } = useTranslation('page_character')
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamChar: { bonusStats },
  } = useContext(TeamCharacterContext)
  const bStatsNum = Object.keys(bonusStats).length
  return (
    <>
      <Button
        color="info"
        startIcon={<BarChartIcon />}
        onClick={onOpen}
        {...buttonProps}
      >
        {t('addStats.title')}
        {!!bStatsNum && (
          <SqBadge sx={{ ml: 1 }} color="success">
            {bStatsNum}
          </SqBadge>
        )}
      </Button>
      <StatModal open={open} onClose={onClose} />
    </>
  )
}
function FormulasButton({ buttonProps = {} }: { buttonProps?: ButtonProps }) {
  const { t } = useTranslation('loadout')
  const { onModalOpen } = useContext(FormulaDataContext)
  return (
    <Button
      color="info"
      startIcon={<CalculateIcon />}
      onClick={onModalOpen}
      {...buttonProps}
    >
      {t('showFormulas.button')}
    </Button>
  )
}
