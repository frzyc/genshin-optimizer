import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import type { ArtifactSlotKey } from '@genshin-optimizer/gi/consts'
import { useBuild, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import {
  Box,
  Button,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import ArtifactCardNano from '../../Components/Artifact/ArtifactCardNano'
import EquippedGrid from '../../Components/Character/EquippedGrid'
import CloseButton from '../../Components/CloseButton'
import WeaponCardNano from '../../Components/Weapon/WeaponCardNano'
import { TeamCharacterContext } from '../../Context/TeamCharacterContext'
export default function LoadoutBtn() {
  const database = useDatabase()
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamCharId,
    teamChar: { buildType, buildId, buildIds, buildTcId, buildTcIds },
  } = useContext(TeamCharacterContext)
  return (
    <>
      <Button
        startIcon={<CheckroomIcon />}
        onClick={() => {
          open ? onClose() : onOpen()
        }}
      >
        Loadout: <strong>Equipped</strong>
      </Button>
      <ModalWrapper open={open} onClose={onClose}>
        <CardThemed>
          <CardHeader title="Loadouts" />
          <Divider />
          <CardContent
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            <EquippedBuild active={buildType === 'equipped'} />
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
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
function EquippedBuild({ active = false }: { active: boolean }) {
  const {
    teamCharId,
    character: { equippedArtifacts, equippedWeapon },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const onEquip = () =>
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
          <CardThemed sx={{ p: 1, flexGrow: 1 }}>
            <Typography variant="h6">Equipped</Typography>
          </CardThemed>
          <Button disabled color="info" size="small">
            <EditIcon />
          </Button>
          <Button
            color="success"
            size="small"
            disabled={active}
            onClick={onEquip}
          >
            <CheckroomIcon />
          </Button>
          <Button color="info" size="small" onClick={onDupe}>
            <ContentCopyIcon />
          </Button>
        </Box>

        <LoadoutEquip
          weaponId={equippedWeapon}
          artifactIds={equippedArtifacts}
        />
      </Box>
    </CardThemed>
  )
}
function Build({
  buildId,
  active = false,
}: {
  buildId: string
  active: boolean
}) {
  const [open, onOpen, onClose] = useBoolState()
  const { teamCharId } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { name, description, weaponId, artifactIds } = useBuild(buildId)
  const onEquip = () =>
    database.teamChars.set(teamCharId, { buildType: 'real', buildId })
  const onRemove = () => {
    //TODO: prompt user for removal
    database.builds.remove(buildId)
    // trigger validation
    database.teamChars.set(teamCharId, {})
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
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CardThemed sx={{ p: 1, flexGrow: 1 }}>
              <BootstrapTooltip title={<Typography>{description}</Typography>}>
                <Box
                  component="span"
                  sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                >
                  <Typography variant="h6">{name}</Typography>
                  <InfoIcon />
                </Box>
              </BootstrapTooltip>
            </CardThemed>
            <Button color="info" size="small" onClick={onOpen}>
              <EditIcon />
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

          <LoadoutEquip weaponId={weaponId} artifactIds={artifactIds} />
        </Box>
      </CardThemed>
    </>
  )
}
function LoadoutEquip({
  weaponId,
  artifactIds,
}: {
  weaponId: string
  artifactIds: Record<ArtifactSlotKey, string>
}) {
  const {
    character: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const weaponTypeKey = getCharData(characterKey).weaponType
  return (
    <Grid container spacing={1} columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}>
      <Grid item xs={1}>
        <WeaponCardNano weaponId={weaponId} weaponTypeKey={weaponTypeKey} />
      </Grid>
      {Object.entries(artifactIds).map(([slotKey, id]) => (
        <Grid item key={id || slotKey} xs={1}>
          <ArtifactCardNano artifactId={id} slotKey={slotKey} />
        </Grid>
      ))}
    </Grid>
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
  } = useContext(TeamCharacterContext)
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
