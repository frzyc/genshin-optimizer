import { useBoolState } from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
} from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
  type ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import { useBuild, useDBMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import { ArtifactSlotName, CharacterName } from '@genshin-optimizer/gi/ui'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'
import EditIcon from '@mui/icons-material/Edit'
import InfoIcon from '@mui/icons-material/Info'
import ScienceIcon from '@mui/icons-material/Science'
import type { ButtonProps } from '@mui/material'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  TextField,
  Tooltip,
  Typography,
  styled,
} from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'
import ArtifactCardNano from '../../../Components/Artifact/ArtifactCardNano'
import EquippedGrid from '../../../Components/Character/EquippedGrid'
import CloseButton from '../../../Components/CloseButton'
import WeaponCardNano from '../../../Components/Weapon/WeaponCardNano'
import { CharacterContext } from '../../../Context/CharacterContext'
import { TeamCharacterContext } from '../../../Context/TeamCharacterContext'

const UsedCard = styled(Card)(() => ({
  boxShadow: '0px 0px 0px 2px red',
}))
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
    team: { teamCharIds },
  } = useContext(TeamCharacterContext)
  const { gender } = useDBMeta()
  const database = useDatabase()
  const { name, description, weaponId, artifactIds } = useBuild(buildId)!
  const onActive = () =>
    database.teamChars.set(teamCharId, { buildType: 'real', buildId })
  const onEquip = () => {
    // Cannot equip a build without weapon
    if (!weaponId) return
    const char = database.chars.get(characterKey)!
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
    if (!newBuildTcId) return
    // copy over name/desc
    database.buildTcs.set(newBuildTcId, {
      name: `${name} - Copied`,
      description,
    })
  }
  const onDupe = () =>
    database.teamChars.newBuild(teamCharId, {
      name: `Duplicate of ${name}`,
      artifactIds: artifactIds,
      weaponId: weaponId,
    })
  const weaponUsedInTeamCharId = teamCharIds.find(
    (tcId) =>
      tcId !== teamCharId &&
      database.teamChars.getLoadoutWeapon(tcId).id === weaponId
  )
  const weaponUsedInTeamCharKey =
    weaponUsedInTeamCharId &&
    database.teamChars.get(weaponUsedInTeamCharId)!.key

  const artUsedInTeamCharKeys = objKeyMap(allArtifactSlotKeys, (slotKey) => {
    const artId = artifactIds[slotKey]
    if (!artId) return undefined
    const tcId = teamCharIds.find(
      (tcId) =>
        tcId !== teamCharId &&
        database.teamChars.getLoadoutArtifacts(tcId)[slotKey]?.id === artId
    )
    return tcId && database.teamChars.get(tcId)!.key
  })
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
            <Tooltip
              title={<Typography>Edit Build Settings</Typography>}
              placement="top"
              arrow
            >
              <Button color="info" size="small" onClick={onOpen}>
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
            <Tooltip
              title={<Typography>Equip Build</Typography>}
              placement="top"
              arrow
            >
              <EquipBuildButton
                color="success"
                size="small"
                disabled={!weaponId} // disabling equip of outfit with invalid weaponId
                onEquip={onEquip}
              >
                <CheckroomIcon />
              </EquipBuildButton>
            </Tooltip>
            <Tooltip
              title={<Typography>Delete Build</Typography>}
              placement="top"
              arrow
            >
              <Button color="error" size="small" onClick={onRemove}>
                <DeleteForeverIcon />
              </Button>
            </Tooltip>
          </Box>

          <Grid
            container
            spacing={1}
            columns={{ xs: 2, sm: 2, md: 3, lg: 6, xl: 6 }}
          >
            <Grid item xs={1}>
              <WeaponCardNano
                weaponId={weaponId}
                weaponTypeKey={weaponTypeKey}
                BGComponent={weaponUsedInTeamCharKey ? UsedCard : undefined}
              />
            </Grid>
            {Object.entries(artifactIds).map(([slotKey, id]) => (
              <Grid item key={id || slotKey} xs={1}>
                <ArtifactCardNano
                  artifactId={id}
                  slotKey={slotKey}
                  BGComponent={
                    artUsedInTeamCharKeys[slotKey] ? UsedCard : undefined
                  }
                />
              </Grid>
            ))}
          </Grid>
          {(weaponUsedInTeamCharKey ||
            Object.values(artUsedInTeamCharKeys).some((ck) => ck)) && (
            <Alert variant="outlined" severity="warning">
              {weaponUsedInTeamCharKey && (
                <Typography>
                  Teammate{' '}
                  <CharacterName
                    characterKey={weaponUsedInTeamCharKey}
                    gender={gender}
                  />{' '}
                  is already using this weapon.
                </Typography>
              )}
              {Object.entries(artUsedInTeamCharKeys).map(
                ([slotKey, ck]) =>
                  ck && (
                    <Typography>
                      Teammate{' '}
                      <CharacterName characterKey={ck} gender={gender} /> is
                      already using this <ArtifactSlotName slotKey={slotKey} />.
                    </Typography>
                  )
              )}
            </Alert>
          )}
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
  const build = useBuild(buildId)!

  const [name, setName] = useState(build.name)
  const nameDeferred = useDeferredValue(name)
  const [desc, setDesc] = useState(build.description)
  const descDeferred = useDeferredValue(desc)

  // trigger on buildId change, to use the new team's name/desc
  useEffect(() => {
    const newBuild = database.builds.get(buildId)
    if (!newBuild) return
    const { name, description } = newBuild
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

type EquipBuildButtonProps = ButtonProps & { onEquip: () => void }
function EquipBuildButton({
  onEquip,
  children,
  ...props
}: EquipBuildButtonProps) {
  const [name, setName] = useState('')
  const [copyEquipped, setCopyEquipped] = useState(false)
  const [showPrompt, onShowPrompt, OnHidePrompt] = useBoolState()

  const database = useDatabase()
  const { teamCharId } = useContext(TeamCharacterContext)
  const {
    character: { equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)

  const toEquip = () => {
    if (copyEquipped) {
      database.teamChars.newBuild(teamCharId, {
        name: name !== '' ? name : 'Duplicate of Equipped',
        artifactIds: equippedArtifacts,
        weaponId: equippedWeapon,
      })
    }

    onEquip()
    setName('')
    setCopyEquipped(false)
    OnHidePrompt()
  }
  return (
    <>
      <Button {...props} onClick={onShowPrompt}>
        {children}
      </Button>
      {/* TODO: Dialog Wanted to use a Dialog here, but was having some weird issues with closing out of it */}
      {/* TODO: Translation */}
      <ModalWrapper
        open={showPrompt}
        onClose={OnHidePrompt}
        containerProps={{ maxWidth: 'md' }}
      >
        <CardThemed>
          <CardHeader
            title="Do you want to equip all gear in this build to this character?"
            action={<CloseButton onClick={OnHidePrompt} />}
          />
          <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
            <FormControlLabel
              label="Copy my current equipment to a new build. Otherwise, the currently equipped build will be overwritten."
              control={
                <Checkbox
                  checked={copyEquipped}
                  onChange={(event) => setCopyEquipped(event.target.checked)}
                  color={copyEquipped ? 'success' : 'secondary'}
                />
              }
            />
            {copyEquipped && (
              <TextField
                label="Build Name"
                placeholder="Duplicate of Equipped"
                value={name}
                onChange={(e) => setName(e.target.value)}
                size="small"
                sx={{ width: '75%', marginX: 4 }}
              />
            )}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1,
                marginTop: 8,
              }}
            >
              <Button color="error" onClick={OnHidePrompt}>
                Cancel
              </Button>
              <Button color="success" onClick={toEquip}>
                Equip
              </Button>
            </Box>
          </CardContent>
        </CardThemed>
      </ModalWrapper>
    </>
  )
}
