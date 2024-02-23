import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import AddIcon from '@mui/icons-material/Add'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material'
import { Suspense, useContext, useMemo } from 'react'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'
import { Build } from './Build'
import { BuildEquipped } from './BuildEquipped'
import BuildTc from './BuildTc'

// TODO: Translation
export default function LoadoutBtn() {
  const database = useDatabase()
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamCharId,
    teamChar: {
      key: characterKey,
      buildType,
      buildId,
      buildIds,
      buildTcId,
      buildTcIds,
    },
  } = useContext(TeamCharacterContext)
  const weaponTypeKey = getCharData(characterKey).weaponType
  const name = useMemo(() => {
    switch (buildType) {
      case 'equipped':
        return 'Equipped'
      case 'real':
        return database.builds.get(buildId).name
      case 'tc':
        return database.buildTcs.get(buildTcId).name
    }
  }, [database, buildType, buildId, buildTcId])
  return (
    <>
      <Button
        startIcon={<CheckroomIcon />}
        onClick={() => {
          open ? onClose() : onOpen()
        }}
      >
        Loadout: <strong>{name}</strong>
      </Button>
      <Suspense fallback={null}>
        <ModalWrapper open={open} onClose={onClose}>
          <CardThemed>
            <CardHeader title="Loadout Management" />
            <Divider />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <BuildEquipped active={buildType === 'equipped'} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="h6">Loadouts</Typography>
                <Button
                  startIcon={<AddIcon />}
                  color="info"
                  size="small"
                  onClick={() => database.teamChars.newBuild(teamCharId)}
                >
                  New Loadout
                </Button>
              </Box>

              {buildIds.map((id) => (
                <Build
                  key={id}
                  buildId={id}
                  active={buildType === 'real' && buildId === id}
                />
              ))}
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="h6">TC Loadouts</Typography>
                <Button
                  startIcon={<AddIcon />}
                  color="info"
                  size="small"
                  onClick={() =>
                    database.teamChars.newBuildTcFromBuild(
                      teamCharId,
                      weaponTypeKey
                    )
                  }
                >
                  New TC Loadout
                </Button>
              </Box>
              {buildTcIds.map((id) => (
                <BuildTc
                  key={id}
                  buildTcId={id}
                  active={buildType === 'tc' && buildTcId === id}
                />
              ))}
            </CardContent>
          </CardThemed>
        </ModalWrapper>
      </Suspense>
    </>
  )
}
