import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import { Button, CardContent, CardHeader, Divider } from '@mui/material'
import { Suspense, useContext, useMemo } from 'react'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'
import { Build } from './Build'
import BuildTc from './BuildTc'
import { BuildEquipped } from './BuildEquipped'
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
            <CardHeader title="Loadouts" />
            <Divider />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <BuildEquipped active={buildType === 'equipped'} />
              <Button
                fullWidth
                color="info"
                size="small"
                onClick={() => database.teamChars.newBuild(teamCharId)}
              >
                New Loadout
              </Button>
              {buildIds.map((id) => (
                <Build
                  key={id}
                  buildId={id}
                  active={buildType === 'real' && buildId === id}
                />
              ))}
              <Button
                fullWidth
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
