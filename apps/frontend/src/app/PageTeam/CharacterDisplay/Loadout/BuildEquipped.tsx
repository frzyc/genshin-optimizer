import { CardThemed } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Button, CardActionArea, Typography } from '@mui/material'
import { useContext } from 'react'
import { CharacterContext } from '../../../Context/CharacterContext'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'
import BuildEquip from './BuildEquip'

export function BuildEquipped({ active = false }: { active: boolean }) {
  const { teamCharId } = useContext(TeamCharacterContext)
  const {
    character: { equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)
  const database = useDatabase()
  const onActive = () =>
    database.teamChars.set(teamCharId, { buildType: 'equipped' })
  const onDupe = () =>
    database.teamChars.newBuild(teamCharId, {
      name: 'Duplicate of Equipped',
      artifactIds: equippedArtifacts,
      weaponId: equippedWeapon,
    })
  return (
    <CardThemed
      bgt="light"
      sx={{
        undefined,
        boxShadow: active ? '0px 0px 0px 2px green inset' : undefined,
      }}
    >
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <CardThemed sx={{ flexGrow: 1 }}>
            <CardActionArea disabled={active} onClick={onActive} sx={{ p: 1 }}>
              <Typography variant="h6">Equipped</Typography>
            </CardActionArea>
          </CardThemed>
          <Button disabled color="info" size="small">
            <EditIcon />
          </Button>
          <Button color="info" size="small" onClick={onDupe}>
            <ContentCopyIcon />
          </Button>
        </Box>

        <BuildEquip weaponId={equippedWeapon} artifactIds={equippedArtifacts} />
      </Box>
    </CardThemed>
  )
}
