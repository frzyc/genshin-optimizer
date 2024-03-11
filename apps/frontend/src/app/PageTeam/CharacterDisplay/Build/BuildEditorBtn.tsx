import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper, SqBadge } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import AddIcon from '@mui/icons-material/Add'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import {
  Alert,
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material'
import { Suspense, useContext } from 'react'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'
import { Build } from './Build'
import { BuildEquipped } from './BuildEquipped'
import BuildTc from './BuildTc'

// TODO: Translation
export default function BuildEditorBtn() {
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
  // TODO: Translate for the `equippedName` variable
  const name = database.teamChars.getActiveBuildName(teamCharId)
  return (
    <>
      <Button
        startIcon={<CheckroomIcon />}
        color="info"
        onClick={() => {
          open ? onClose() : onOpen()
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <strong>{name}</strong>
          <SqBadge
            color={buildIds.length ? 'success' : 'secondary'}
            sx={{ marginLeft: 'auto' }}
          >
            {buildIds.length} Builds
          </SqBadge>
          <SqBadge color={buildTcIds.length ? 'success' : 'secondary'}>
            {buildTcIds.length} TC Builds
          </SqBadge>
        </Box>
      </Button>
      <Suspense fallback={null}>
        <ModalWrapper open={open} onClose={onClose}>
          <CardThemed>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <CheckroomIcon />
                  <span>Build Management</span>
                </Box>
              }
            />
            <Divider />
            <CardContent
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
              <Alert variant="filled" severity="info">
                A <strong>Build</strong> is comprised of a weapon and 5
                artifacts. A <strong>TC Build</strong> allows the artifacts to
                be created from its stats.
              </Alert>
              <BuildEquipped active={buildType === 'equipped'} />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Typography variant="h6">Builds</Typography>
                <Button
                  startIcon={<AddIcon />}
                  color="info"
                  size="small"
                  onClick={() => database.teamChars.newBuild(teamCharId)}
                >
                  New Build
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
                <Typography variant="h6">TC Builds</Typography>
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
                  New TC Build
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
