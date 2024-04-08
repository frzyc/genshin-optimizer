import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
  type ArtifactSlotKey,
} from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  TeamCharacterContext,
  useBuild,
  useDBMeta,
  useDatabase,
} from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import {
  ArtifactCardNano,
  ArtifactSlotName,
  BuildCard,
  CharacterName,
  EquipBuildModal,
  EquippedGrid,
  WeaponCardNano,
} from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Alert,
  Box,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useDeferredValue, useEffect, useState } from 'react'

// TODO: Translation
export default function BuildReal({
  buildId,
  active = false,
}: {
  buildId: string
  active?: boolean
}) {
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamId,
    teamCharId,
    teamChar: { key: characterKey },
    team: { loadoutData },
  } = useContext(TeamCharacterContext)
  const {
    character: { equippedWeapon, equippedArtifacts },
  } = useContext(CharacterContext)
  const { gender } = useDBMeta()
  const database = useDatabase()
  const { name, description, weaponId, artifactIds } = useBuild(buildId)!
  const onActive = () =>
    database.teams.setLoadoutDatum(teamId, teamCharId, {
      buildType: 'real',
      buildId,
    })
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
  }
  const weaponTypeKey = getCharStat(characterKey).weaponType
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
  const weaponUsedInLoadoutDatum = loadoutData.find(
    (loadoutDatum) =>
      loadoutDatum &&
      loadoutDatum.teamCharId !== teamCharId &&
      database.teams.getLoadoutWeapon(loadoutDatum).id === weaponId
  )
  const weaponUsedInTeamCharKey =
    weaponUsedInLoadoutDatum &&
    database.teamChars.get(weaponUsedInLoadoutDatum?.teamCharId)!.key

  const artUsedInTeamCharKeys = objKeyMap(allArtifactSlotKeys, (slotKey) => {
    const artId = artifactIds[slotKey]
    if (!artId) return undefined
    const loadoutDatum = loadoutData.find(
      (loadoutDatum) =>
        loadoutDatum &&
        loadoutDatum.teamCharId !== teamCharId &&
        database.teams.getLoadoutArtifacts(loadoutDatum)[slotKey]?.id === artId
    )
    return loadoutDatum && database.teamChars.get(loadoutDatum.teamCharId)!.key
  })

  const equipChangeProps = {
    currentName: 'Equipped',
    currentWeapon: equippedWeapon,
    currentArtifacts: equippedArtifacts,
    newWeapon: weaponId,
    newArtifacts: artifactIds,
  }

  const [showPrompt, onShowPrompt, OnHidePrompt] = useBoolState()
  return (
    <>
      <ModalWrapper open={open} onClose={onClose}>
        <BuildEditor buildId={buildId} onClose={onClose} />
      </ModalWrapper>
      <EquipBuildModal
        equipChangeProps={equipChangeProps}
        showPrompt={showPrompt}
        onEquip={onEquip}
        OnHidePrompt={OnHidePrompt}
      />
      <BuildCard
        name={name}
        description={description}
        active={active}
        onEdit={onOpen}
        onActive={onActive}
        onCopyToTc={copyToTc}
        onDupe={onDupe}
        onEquip={weaponId ? onShowPrompt : undefined}
        onRemove={onRemove}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            alignItems: 'stretch',
          }}
        >
          <Grid
            container
            spacing={1}
            columns={{ xs: 2, sm: 2, md: 2, lg: 3, xl: 3 }}
          >
            <Grid item xs={1}>
              <CardThemed
                sx={{
                  height: '100%',
                  maxHeight: '8em',
                  boxShadow: weaponUsedInTeamCharKey
                    ? '0px 0px 0px 2px red'
                    : undefined,
                }}
              >
                <WeaponCardNano
                  weaponId={weaponId}
                  weaponTypeKey={weaponTypeKey}
                />
              </CardThemed>
            </Grid>
            {Object.entries(artifactIds).map(([slotKey, id]) => (
              <Grid item key={id || slotKey} xs={1}>
                <CardThemed
                  sx={{
                    height: '100%',
                    maxHeight: '8em',
                    boxShadow: artUsedInTeamCharKeys[slotKey]
                      ? '0px 0px 0px 2px red'
                      : undefined,
                  }}
                >
                  <ArtifactCardNano artifactId={id} slotKey={slotKey} />
                </CardThemed>
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
        </Box>
      </BuildCard>
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
  const weaponTypeKey = getCharStat(characterKey).weaponType
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
        action={
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        }
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
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          multiline
          minRows={2}
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
