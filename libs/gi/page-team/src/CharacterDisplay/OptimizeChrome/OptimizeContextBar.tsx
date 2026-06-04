import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { LoadoutDatum } from '@genshin-optimizer/gi/db'
import {
  TeamCharacterContext,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import {
  CharIconSide,
  CharacterName,
  CharacterSingleSelectionModal,
  ensureOptimizeContext,
  getExperimentCanonicalPath,
  getTeamCharTabPath,
  type OptimizeFlowKind,
} from '@genshin-optimizer/gi/ui'
import { Button, CardContent } from '@mui/material'
import { Suspense, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import BuildDropdown from '../../BuildDropdown'
import { LoadoutDropdown } from '../../LoadoutDropdown'

export function OptimizeContextBar({ flow = 'experiment' }: { flow?: OptimizeFlowKind }) {
  const navigate = useNavigate()
  const database = useDatabase()
  const { gender } = useDBMeta()
  const { teamId, teamCharId, teamChar, loadoutDatum } =
    useContext(TeamCharacterContext)
  const characterKey = teamChar.key

  const [showChar, onShowChar, onHideChar] = useBoolState()

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

  return (
    <>
      <Suspense fallback={false}>
        <CharacterSingleSelectionModal
          show={showChar}
          onHide={onHideChar}
          onSelect={onCharacterSelect}
        />
      </Suspense>
      <CardThemed bgt="light">
        <CardContent
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            alignItems: 'center',
            '& .MuiButton-root': { minWidth: 0 },
          }}
        >
          <Button
            startIcon={<CharIconSide characterKey={characterKey} />}
            onClick={onShowChar}
            color="info"
            sx={{ flex: '1 1 140px' }}
          >
            <CharacterName characterKey={characterKey} gender={gender} />
          </Button>

          <LoadoutDropdown
            teamCharId={teamCharId}
            onChangeTeamCharId={onPlaystyleChange}
            i18nNs="playstyle"
            label
            dropdownBtnProps={{ sx: { flex: '1 1 140px' } }}
          />

          <BuildDropdown
            teamId={teamId}
            loadoutDatum={loadoutDatum}
            dropdownBtnProps={{ sx: { flex: '1 1 120px' } }}
          />
        </CardContent>
      </CardThemed>
    </>
  )
}
