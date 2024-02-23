import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import {
  charKeyToLocCharKey,
  type ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import { useBuild, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import ScienceIcon from '@mui/icons-material/Science'
import {
  Box,
  Button,
  CardActionArea,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import EquippedGrid from '../../../Components/Character/EquippedGrid'
import CloseButton from '../../../Components/CloseButton'
import { CharacterContext } from '../../../Context/CharacterContext'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'
import BuildEquip from './BuildEquip'
// TODO: Translation
export function Build({
  buildId,
  active = false,
}: {
  buildId: string
  active: boolean
}) {
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamCharId,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { name, description, weaponId, artifactIds } = useBuild(buildId)
  const onActive = () =>
    database.teamChars.set(teamCharId, { buildType: 'real', buildId })
  const onEquip = () => {
    // Cannot equip a loadout without weapon
    if (!weaponId) return
    if (
      !window.confirm(
        `Do you want to equip all gear in this loadout to this character? The currently equipped build will be overwritten.`
      )
    )
      return
    const char = database.chars.get(characterKey)
    Object.entries(artifactIds).forEach(([slotKey, id]) => {
      if (id)
        database.arts.set(id, { location: charKeyToLocCharKey(characterKey) })
      else {
        const oldAid = char.equippedArtifacts[slotKey]
        if (oldAid && database.arts.get(oldAid))
          database.arts.set(oldAid, { location: '' })
      }
    })
    if (weaponId)
      database.weapons.set(weaponId, {
        location: charKeyToLocCharKey(characterKey),
      })
  }
  const onRemove = () => {
    //TODO: prompt user for removal
    database.builds.remove(buildId)
    // trigger validation
    database.teamChars.set(teamCharId, {})
  }
  const weaponTypeKey = getCharData(characterKey).weaponType
  const copyToTc = () => {
    const newBuildTcId = database.teamChars.newBuildTcFromBuild(
      teamCharId,
      weaponTypeKey,
      database.weapons.get(weaponId),
      Object.values(artifactIds).map((id) => database.arts.get(id))
    )
    // copy over name/desc
    database.buildTcs.set(newBuildTcId, {
      name: `${name} - Copied`,
      description,
    })
  }

  return (
    <>
      <ModalWrapper open={open} onClose={onClose}>
        <BuildEditor buildId={buildId} onClose={onClose} />
      </ModalWrapper>
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
              <CardActionArea disabled={!weaponId || active} onClick={onActive}>
                <Box
                  component="span"
                  sx={{ p: 1, display: 'flex', gap: 1, alignItems: 'center' }}
                >
                  <Typography variant="h6">{name}</Typography>
                  <BootstrapTooltip
                    title={<Typography>{description}</Typography>}
                  >
                    <InfoIcon />
                  </BootstrapTooltip>
                </Box>
              </CardActionArea>
            </CardThemed>
            <Button color="info" size="small" onClick={onOpen}>
              <EditIcon />
            </Button>
            <Button color="info" size="small" onClick={copyToTc}>
              <ScienceIcon />
            </Button>
            <Button
              color="success"
              size="small"
              disabled={!weaponId || active}
              onClick={onEquip}
            >
              <CheckroomIcon />
            </Button>
            <Button color="error" size="small" onClick={onRemove}>
              <DeleteForeverIcon />
            </Button>
          </Box>

          <BuildEquip weaponId={weaponId} artifactIds={artifactIds} />
        </CardContent>
      </CardThemed>
    </>
  )
}

function BuildEditor({
  buildId,
  onClose,
}: {
  buildId: string
  onClose: () => void
}) {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const weaponTypeKey = getCharData(characterKey).weaponType
  const database = useDatabase()
  const build = useBuild(buildId)

  const [name, setName] = useState(build.name)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(build.description)
  const descDeferred = useDeferredValue(desc)

  // trigger on buildId change, to use the new team's name/desc
  useEffect(() => {
    const { name, description } = database.builds.get(buildId)
    setName(name)
    setDesc(description)
  }, [database, buildId])

  useEffect(() => {
    database.builds.set(buildId, (build) => {
      build.name = nameDeferred
    })
    // Don't need to trigger when buildId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, nameDeferred])

  useEffect(() => {
    database.builds.set(buildId, (build) => {
      build.description = descDeferred
    })
    // Don't need to trigger when buildId is changed, only when the name is changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [database, descDeferred])
  return (
    <CardThemed>
      <CardHeader
        title="Build Settings"
        action={<CloseButton onClick={onClose} />}
      />
      <Divider />
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Build Name"
          placeholder="Build Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label="Build Description"
          placeholder="Build Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          multiline
          rows={4}
        />
        <Box>
          <EquippedGrid
            weaponTypeKey={weaponTypeKey}
            weaponId={build.weaponId}
            artifactIds={build.artifactIds}
            setWeapon={(id: string) =>
              database.builds.set(buildId, { weaponId: id })
            }
            setArtifact={(slotKey: ArtifactSlotKey, id: string) =>
              database.builds.set(buildId, (build) => {
                build.artifactIds[slotKey] = id
              })
            }
          />
        </Box>
      </CardContent>
    </CardThemed>
  )
}
