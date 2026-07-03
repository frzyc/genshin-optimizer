import { useBoolState } from '@genshin-optimizer/common/react-util'
import { SqBadge } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharEle } from '@genshin-optimizer/gi/stats'
import {
  CharIconSide,
  CharacterName,
  CharacterSingleSelectionModal,
  type OptimizeFlowKind,
  ensureOptimizeContext,
  getExperimentCanonicalPath,
  getTeamCharTabPath,
} from '@genshin-optimizer/gi/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import PersonIcon from '@mui/icons-material/Person'
import { Box, Button, Typography } from '@mui/material'
import { Suspense, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { BuildsEditorModal } from '../BuildsEditorModal'
import { LoadoutEditorModal } from '../LoadoutEditorModal'
import {
  chromeJoinedButtonSx,
  elementHeaderGradientSx,
} from './optimizeChromeTheme'

const SEGMENT_COUNT = 3

export function OptimizeContextBar({
  flow = 'experiment',
}: { flow?: OptimizeFlowKind }) {
  const navigate = useNavigate()
  const database = useDatabase()
  const { gender } = useDBMeta()
  const { teamId, teamCharId, teamChar, loadoutDatum } =
    useContext(TeamCharacterContext)
  const characterKey = teamChar.key
  const elementKey = getCharEle(characterKey)
  const { t } = useTranslation(['playstyle', 'build'])
  const { buildType } = loadoutDatum
  const activeBuildName = database.teams.getActiveBuildName(loadoutDatum)

  const [showChar, onShowChar, onHideChar] = useBoolState()
  const [showPlaystyle, onShowPlaystyle, onHidePlaystyle] = useBoolState()
  const [showBuild, onShowBuild, onHideBuild] = useBoolState()

  const onCharacterSelect = (ck: CharacterKey) => {
    const ctx = ensureOptimizeContext(database, { characterKey: ck })
    navigate(
      flow === 'experiment'
        ? getExperimentCanonicalPath(ctx)
        : getTeamCharTabPath(ctx.teamId, ctx.characterKey, 'optimize')
    )
  }

  const onPlaystyleChange = (newTeamCharId: string) => {
    database.dbMeta.set({ optTeamCharId: newTeamCharId })
    database.teams.set(teamId, (team) => {
      const idx = team.loadoutData.findIndex(
        (ld) => ld?.teamCharId === teamCharId
      )
      if (idx >= 0) {
        team.loadoutData[idx] = { teamCharId: newTeamCharId } as LoadoutDatum
      }
    })
  }

  const segmentProps = (index: number) => ({
    variant: 'outlined' as const,
    color: elementKey,
    sx: chromeJoinedButtonSx(index, SEGMENT_COUNT),
  })

  return (
    <>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={showChar}
          onHide={onHideChar}
          onSelect={onCharacterSelect}
        />
      </Suspense>
      <LoadoutEditorModal
        open={showPlaystyle}
        onClose={onHidePlaystyle}
        i18nNs="playstyle"
        onChangeTeamCharId={onPlaystyleChange}
      />
      <BuildsEditorModal open={showBuild} onClose={onHideBuild} />
      <Box sx={elementHeaderGradientSx(elementKey)}>
        <Box sx={{ display: 'flex', width: '100%' }}>
          <Button
            {...segmentProps(0)}
            startIcon={<CharIconSide characterKey={characterKey} />}
            onClick={onShowChar}
          >
            <Typography variant="h6" noWrap component="span">
              <CharacterName characterKey={characterKey} gender={gender} />
            </Typography>
          </Button>

          <Button
            {...segmentProps(1)}
            startIcon={<PersonIcon />}
            fullWidth
            onClick={onShowPlaystyle}
          >
            <Typography variant="h6" noWrap component="span">
              {t('playstyle:dropdownLabel')}
              <strong>{teamChar.name}</strong>
            </Typography>
          </Button>

          <Button
            {...segmentProps(2)}
            startIcon={<CheckroomIcon />}
            fullWidth
            onClick={onShowBuild}
          >
            <Box
              component="span"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                minWidth: 0,
                overflow: 'hidden',
              }}
            >
              <Typography variant="h6" noWrap component="span">
                {activeBuildName}
              </Typography>
              {buildType === 'tc' && (
                <SqBadge color="success">
                  {t('build:buildDropdown.tcBadge')}
                </SqBadge>
              )}
            </Box>
          </Button>
        </Box>
      </Box>
    </>
  )
}
