import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed, ModalWrapper } from '@genshin-optimizer/common/ui'
import { charKeyToLocCharKey } from '@genshin-optimizer/gi/consts'
import {
  CharacterContext,
  TeamCharacterContext,
  useBuild,
  useDatabase,
  useEquippedInTeam,
} from '@genshin-optimizer/gi/db-ui'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import {
  ArtifactCardNano,
  BuildCard,
  BuildEditContext,
  EquipBuildModal,
  EquippedGrid,
  TeammateEquippedAlert,
  WeaponCardNano,
} from '@genshin-optimizer/gi/ui'
import CloseIcon from '@mui/icons-material/Close'
import {
  Box,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  IconButton,
  TextField,
} from '@mui/material'
import {
  useContext,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'

export default function BuildReal({
  buildId,
  active = false,
  onChangeBuild,
}: {
  buildId: string
  active?: boolean
  onChangeBuild?: () => void
}) {
  const { t } = useTranslation('build')
  const [open, onOpen, onClose] = useBoolState()
  const {
    teamId,
    teamCharId,
    teamChar: { key: characterKey },
  } = useContext(TeamCharacterContext)
  const {
    character: { equippedWeapon, equippedArtifacts },
  } = useContext(CharacterContext)
  const database = useDatabase()

  const { name, description, weaponId, artifactIds } = useBuild(buildId)!
  const onActive = useMemo(() => {
    if (active) return undefined
    return () => {
      database.teams.setLoadoutDatum(teamId, teamCharId, {
        buildType: 'real',
        buildId,
      })
      onChangeBuild?.()
    }
  }, [active, database.teams, teamId, teamCharId, buildId, onChangeBuild])
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
      name: t('buildRealCard.copy.nameTc', { name }),
      description,
    })
  }
  const onDupe = () =>
    database.teamChars.newBuild(teamCharId, {
      name: t('buildRealCard.copy.nameReal', { name }),
      artifactIds: artifactIds,
      weaponId: weaponId,
    })

  const { weaponUsedInTeamCharKey, artUsedInTeamCharKeys } = useEquippedInTeam(
    weaponId!,
    artifactIds
  )

  const [show, onShow, onHide] = useBoolState()
  return (
    <>
      <ModalWrapper open={open} onClose={onClose}>
        <BuildEditor buildId={buildId} onClose={onClose} />
      </ModalWrapper>
      <EquipBuildModal
        currentName={t('buildRealCard.copy.equipped')}
        currentWeaponId={equippedWeapon}
        currentArtifactIds={equippedArtifacts}
        newWeaponId={weaponId}
        newArtifactIds={artifactIds}
        show={show}
        onEquip={onEquip}
        onHide={onHide}
      />
      <BuildCard
        name={name}
        description={description}
        active={active}
        onEdit={onOpen}
        onActive={onActive}
        onCopyToTc={copyToTc}
        onDupe={onDupe}
        onEquip={weaponId ? onShow : undefined}
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
                    ? '0px 0px 0px 2px yellow'
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
                      ? '0px 0px 0px 2px yellow'
                      : undefined,
                  }}
                >
                  <ArtifactCardNano artifactId={id} slotKey={slotKey} />
                </CardThemed>
              </Grid>
            ))}
          </Grid>
          <TeammateEquippedAlert
            weaponUsedInTeamCharKey={weaponUsedInTeamCharKey}
            artUsedInTeamCharKeys={artUsedInTeamCharKeys}
          />
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
  const { t } = useTranslation('build')
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
        title={t('buildRealCard.edit.title')}
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
          label={t('buildRealCard.edit.label')}
          placeholder={t('buildRealCard.edit.placeholder')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label={t('buildRealCard.edit.desc')}
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          multiline
          minRows={2}
        />
        <Box>
          <BuildEditContext.Provider value={buildId}>
            <EquippedGrid
              weaponTypeKey={weaponTypeKey}
              weaponId={build.weaponId}
              artifactIds={build.artifactIds}
              setWeapon={(id: string) =>
                database.builds.set(buildId, { weaponId: id })
              }
              setArtifact={(slotKey, id) =>
                database.builds.set(buildId, (build) => {
                  build.artifactIds[slotKey] = id ? id : undefined
                })
              }
            />
          </BuildEditContext.Provider>
        </Box>
      </CardContent>
    </CardThemed>
  )
}
