import { CardThemed } from '@genshin-optimizer/common/ui'
import { useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import EditIcon from '@mui/icons-material/Edit'
import ScienceIcon from '@mui/icons-material/Science'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  Tooltip,
  Typography,
} from '@mui/material'
import { useContext } from 'react'
import { CharacterContext } from '../../../Context/CharacterContext'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'
import BuildEquip from './BuildEquip'
export function BuildEquipped({ active = false }: { active: boolean }) {
  const { teamCharId } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey, equippedArtifacts, equippedWeapon },
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
  const weaponTypeKey = getCharData(characterKey).weaponType
  const copyToTc = () => {
    const newBuildTcId = database.teamChars.newBuildTcFromBuild(
      teamCharId,
      weaponTypeKey,
      database.weapons.get(equippedWeapon),
      Object.values(equippedArtifacts).map((id) => database.arts.get(id))
    )
    if (!newBuildTcId) return
    // copy over name
    database.buildTcs.set(newBuildTcId, {
      name: `Equipped - Copied`,
      description: 'Copied from Equipped Build',
    })
  }
  return (
    <CardThemed
      bgt="light"
      sx={{
        undefined,
        boxShadow: active ? '0px 0px 0px 2px green inset' : undefined,
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <CardThemed sx={{ flexGrow: 1 }}>
            <CardActionArea disabled={active} onClick={onActive} sx={{ p: 1 }}>
              <Typography variant="h6">Equipped</Typography>
            </CardActionArea>
          </CardThemed>
          <Tooltip
            title={<Typography>Edit Build Settings</Typography>}
            placement="top"
            arrow
          >
            <Button disabled color="info" size="small">
              <EditIcon />
            </Button>
          </Tooltip>
          <Tooltip
            title={<Typography>Copy to TC Builds</Typography>}
            placement="top"
            arrow
          >
            <Button color="info" size="small" onClick={copyToTc}>
              <ScienceIcon />
            </Button>
          </Tooltip>
          <Tooltip
            title={<Typography>Duplicate Build</Typography>}
            placement="top"
            arrow
          >
            <Button color="info" size="small" onClick={onDupe}>
              <ContentCopyIcon />
            </Button>
          </Tooltip>
        </Box>

        <BuildEquip weaponId={equippedWeapon} artifactIds={equippedArtifacts} />
      </CardContent>
    </CardThemed>
  )
}
