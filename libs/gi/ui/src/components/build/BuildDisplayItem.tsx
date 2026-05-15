import {
  useBoolState,
  useForceUpdate,
} from '@genshin-optimizer/common/react-util'
import {
  BootstrapTooltip,
  CardThemed,
  ModalWrapper,
  SqBadge,
} from '@genshin-optimizer/common/ui'
import { notEmpty, objKeyMap, toggleArr } from '@genshin-optimizer/common/util'
import type {
  ArtifactSlotKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type { ArtSetExclusionKey } from '@genshin-optimizer/gi/db'
import { allArtifactSetExclusionKeys } from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  TeamCharacterContext,
  useArtifact,
  useDBMeta,
  useDatabase,
  useEquippedInTeam,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { uiInput as input } from '@genshin-optimizer/gi/wr'
import { Checkroom, ChevronRight } from '@mui/icons-material'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import CheckroomIcon from '@mui/icons-material/Checkroom'
import InfoIcon from '@mui/icons-material/Info'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import {
  Suspense,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { DataContext } from '../../context'
import {
  ArtifactCard,
  ArtifactCardNano,
  ArtifactEditor,
  SetInclusionButton,
} from '../artifact'
import { ArtifactSetBadges } from '../artifact/ArtifactSetBadges'
import { CharacterName } from '../character'
import { StatDisplayComponent } from '../character/StatDisplayComponent'
import { WeaponCard, WeaponCardNano } from '../weapon'
import { EquipBuildModal } from './EquipBuildModal'
import { TeammateEquippedAlert } from './TeammateEquippedAlert'
type NewOld = {
  newId: string
  oldId?: string
}

type BuildDisplayItemProps = {
  label?: ReactNode
  disabled?: boolean
  extraButtonsRight?: JSX.Element
  extraButtonsLeft?: JSX.Element
  mainStatAssumptionLevel: number
}

//for displaying each artifact build
export const BuildDisplayItem = memo(function BuildDisplayItem({
  label,
  extraButtonsRight,
  extraButtonsLeft,
  disabled,
  mainStatAssumptionLevel,
}: BuildDisplayItemProps) {
  const { t } = useTranslation('build')
  const {
    loadoutDatum: { buildType, buildId },
    teamChar: { buildIds = [] },
  } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey, equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)
  const database = useDatabase()
  const { data, compareData } = useContext(DataContext)

  const [dbDirty, setDbDirty] = useForceUpdate()
  // update when a build is changed
  useEffect(() => {
    const unfollowBuilds = buildIds.map((buildId) =>
      database.builds.follow(buildId, setDbDirty)
    )
    return () => unfollowBuilds.forEach((unFollow) => unFollow())
  }, [database, buildIds, setDbDirty])

  // update when data is recalc'd
  const weaponNewOld = useMemo(
    () => ({
      oldId: compareData?.get(input.weapon.id)?.value,
      newId: data.get(input.weapon.id).value ?? '',
    }),
    [data, compareData]
  )

  // state for showing weapon compare modal
  const [showWeapon, onShowWeapon, onHideWeapon] = useBoolState(false)

  // update when data is recalc'd
  const artifactNewOldBySlot: Record<ArtifactSlotKey, NewOld> = useMemo(
    () =>
      objKeyMap(allArtifactSlotKeys, (slotKey) => ({
        oldId: compareData?.get(input.art[slotKey].id)?.value,
        newId: data.get(input.art[slotKey].id).value ?? '',
      })),
    [data, compareData]
  )

  // state for showing art compare modal
  const [artNewOld, setArtNewOld] = useState<NewOld | undefined>()
  const closeArt = useCallback(() => setArtNewOld(undefined), [setArtNewOld])
  const buildEquip = buildId && buildType === 'real'
  const equipBuild = useCallback(() => {
    if (buildEquip) {
      database.builds.set(buildId, {
        weaponId: data.get(input.weapon.id).value,
        artifactIds: objKeyMap(allArtifactSlotKeys, (s) =>
          data.get(input.art[s].id).value?.toString()
        ),
      })
      return
    }
    const char = database.chars.get(characterKey)
    if (!char) return
    allArtifactSlotKeys.forEach((s) => {
      const aid = data.get(input.art[s].id).value?.toString()
      if (aid)
        database.arts.set(aid, { location: charKeyToLocCharKey(characterKey) })
      else {
        const oldAid = char.equippedArtifacts[s]
        if (oldAid && database.arts.get(oldAid))
          database.arts.set(oldAid, { location: '' })
      }
    })
    const weapon = data.get(input.weapon.id).value
    if (weapon)
      database.weapons.set(weapon, {
        location: charKeyToLocCharKey(characterKey),
      })
  }, [characterKey, buildEquip, buildId, data, database])

  const artifactIds = useMemo(
    () =>
      objKeyMap(allArtifactSlotKeys, (slotKey) =>
        data.get(input.art[slotKey].id).value?.toString()
      ),
    [data]
  )
  const artifacts = useMemo(
    () =>
      Object.values(artifactIds)
        .filter(notEmpty)
        .map((artiId: string) => database.arts.get(artiId))
        .filter(notEmpty),
    [artifactIds, database.arts]
  )
  const weaponId = data.get(input.weapon.id).value!

  const { weaponUsedInTeamCharKey, artUsedInTeamCharKeys } = useEquippedInTeam(
    weaponId!,
    artifactIds
  )

  const weapNano = useMemo(() => {
    return (
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
            showLocation
            weaponId={weaponId}
            onClick={onShowWeapon}
          />
        </CardThemed>
      </Grid>
    )
  }, [weaponUsedInTeamCharKey, weaponId, onShowWeapon])

  // Memoize Arts because of its dynamic onClick
  const artNanos = useMemo(
    () =>
      allArtifactSlotKeys.map((slotKey) => (
        <Grid item xs={1} key={slotKey}>
          <CardThemed
            sx={{
              height: '100%',
              maxHeight: '8em',
              boxShadow: artUsedInTeamCharKeys[slotKey]
                ? '0px 0px 0px 2px yellow'
                : undefined,
            }}
          >
            <ArtifactCardNano
              showLocation
              slotKey={slotKey}
              artifactId={artifactIds[slotKey]}
              mainStatAssumptionLevel={mainStatAssumptionLevel}
              onClick={() => {
                const oldId = artifactNewOldBySlot[slotKey].oldId
                const newId = artifactNewOldBySlot[slotKey].newId!
                setArtNewOld({
                  oldId: oldId !== newId ? oldId : undefined,
                  newId,
                })
              }}
            />
          </CardThemed>
        </Grid>
      )),
    [
      artUsedInTeamCharKeys,
      artifactIds,
      mainStatAssumptionLevel,
      artifactNewOldBySlot,
    ]
  )

  const currentlyEquipped =
    allArtifactSlotKeys.every(
      (slotKey) => artifactIds[slotKey] === equippedArtifacts[slotKey]
    ) && data.get(input.weapon.id).value === equippedWeapon

  const sameAsBuildIds = useMemo(
    () =>
      dbDirty &&
      buildIds.filter((buildId) => {
        const build = database.builds.get(buildId)
        if (!build) return false
        const { artifactIds: buildArtIds, weaponId: buildWeaponId } = build
        return (
          allArtifactSlotKeys.every(
            (slotKey) => artifactIds[slotKey] === buildArtIds[slotKey]
          ) && weaponId === buildWeaponId
        )
      }),
    [dbDirty, database, buildIds, artifactIds, weaponId]
  )

  const isActiveBuild = buildType === 'real' && sameAsBuildIds.includes(buildId)
  const isActiveBuildOrEquip =
    isActiveBuild || (buildType === 'equipped' && currentlyEquipped)

  // An undefined buildType indicates this was accessed from outside a team. This currently occurs
  // when comparing from the character editor.
  const compareFromCharEditor = buildType === undefined

  const currentWeaponId = useMemo(() => {
    if (compareFromCharEditor) return equippedWeapon
    if (dbDirty && buildType === 'real')
      return database.builds.get(buildId)!.weaponId
    if (dbDirty && buildType === 'equipped') return equippedWeapon

    // default
    return ''
  }, [
    dbDirty,
    database,
    buildType,
    buildId,
    equippedWeapon,
    compareFromCharEditor,
  ])

  const currentArtifactIds = useMemo(() => {
    if (compareFromCharEditor) return equippedArtifacts
    if (dbDirty && buildType === 'real')
      return database.builds.get(buildId)!.artifactIds
    if (dbDirty && buildType === 'equipped') return equippedArtifacts

    // default
    return objKeyMap(allArtifactSlotKeys, () => '')
  }, [
    dbDirty,
    database,
    buildType,
    buildId,
    equippedArtifacts,
    compareFromCharEditor,
  ])

  const [showEquipChange, onShowEquipChange, onHideEquipChange] = useBoolState()

  return (
    <CardThemed
      bgt="light"
      sx={{
        boxShadow: isActiveBuildOrEquip
          ? '0px 0px 0px 2px green inset'
          : undefined,
      }}
    >
      <Suspense
        fallback={<Skeleton variant="rectangular" width="100%" height={600} />}
      >
        {weaponNewOld && (
          <CompareWeaponModal
            newOld={weaponNewOld}
            showWeapon={showWeapon}
            onClose={onHideWeapon}
          />
        )}
        {artNewOld && (
          <CompareArtifactModal
            newOld={artNewOld}
            mainStatAssumptionLevel={mainStatAssumptionLevel}
            onClose={closeArt}
            compareFromCharEditor={compareFromCharEditor}
          />
        )}
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box display="flex" gap={1} flexWrap="wrap">
            {label !== undefined && (
              <SqBadge color={currentlyEquipped ? 'success' : 'info'}>
                <Typography sx={{ display: 'flex', gap: 1 }}>
                  <strong>{label}</strong>
                  {currentlyEquipped && (
                    <span>{t('buildDisplay.equippedBadge')}</span>
                  )}
                </Typography>
              </SqBadge>
            )}
            {!!sameAsBuildIds.length && (
              <SqBadge color={isActiveBuild ? 'success' : 'info'}>
                <Typography sx={{ display: 'flex', gap: 1 }}>
                  <CheckroomIcon />
                  <span>
                    {
                      database.builds.get(
                        isActiveBuild ? buildId : sameAsBuildIds[0]
                      )?.name
                    }
                  </span>
                  {isActiveBuild && (
                    <span>{t('buildDisplay.currentBadge')}</span>
                  )}
                  {sameAsBuildIds.length > 1 && (
                    <Tooltip
                      arrow
                      title={
                        <Box>
                          {sameAsBuildIds.map((buildId) => (
                            <Typography
                              sx={{
                                display: 'flex',
                                gap: 1,
                                alignItems: 'center',
                              }}
                            >
                              <CheckroomIcon />
                              {database.builds.get(buildId)?.name}
                            </Typography>
                          ))}
                        </Box>
                      }
                    >
                      <InfoIcon />
                    </Tooltip>
                  )}
                </Typography>
              </SqBadge>
            )}
            <ArtifactSetBadges artifacts={artifacts} />
            <Box
              sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}
            />
            {extraButtonsLeft}
            <EquipBuildModal
              currentName={
                buildType === 'real'
                  ? database.builds.get(buildId)!.name
                  : t('buildDisplay.equipped')
              }
              currentWeaponId={currentWeaponId}
              currentArtifactIds={currentArtifactIds}
              newWeaponId={data.get(input.weapon.id).value!}
              newArtifactIds={objKeyMap(
                allArtifactSlotKeys,
                (s) => data.get(input.art[s].id).value!
              )}
              show={showEquipChange}
              onEquip={equipBuild}
              onHide={onHideEquipChange}
            />
            <Button
              size="small"
              color="success"
              onClick={onShowEquipChange}
              disabled={disabled || isActiveBuild}
              startIcon={<Checkroom />}
            >
              {t('buildDisplay.equipToCrr')}
            </Button>
            {extraButtonsRight}
          </Box>
          <Box>
            <Grid
              container
              spacing={1}
              columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}
            >
              {weapNano}
              {artNanos}
            </Grid>
          </Box>
          <TeammateEquippedAlert
            weaponUsedInTeamCharKey={weaponUsedInTeamCharKey}
            artUsedInTeamCharKeys={artUsedInTeamCharKeys}
          />
          <StatDisplayComponent />
        </CardContent>
      </Suspense>
    </CardThemed>
  )
})

function CompareWeaponModal({
  newOld: { newId, oldId },
  showWeapon,
  onClose,
}: {
  newOld: NewOld
  showWeapon: boolean
  onClose: () => void
}) {
  const { t } = useTranslation('build')
  const database = useDatabase()
  const diffCurrentWeap = oldId !== newId

  const deleteWeapon = useCallback(
    (id: string) => database.weapons.remove(id),
    [database]
  )

  return (
    <ModalWrapper
      open={showWeapon}
      onClose={onClose}
      containerProps={{ maxWidth: diffCurrentWeap ? 'md' : 'xs' }}
    >
      <CardThemed>
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'stretch',
            gap: 2,
          }}
        >
          {diffCurrentWeap && (
            <Box minWidth={320} display="flex" flexDirection="column" gap={1}>
              <CardThemed bgt="light" sx={{ p: 1 }}>
                <Typography variant="h6" textAlign="center">
                  {t('buildDisplay.oldWeapon')}
                </Typography>
              </CardThemed>
              {oldId === 'tc' ? (
                <Typography variant="h6" textAlign="center" color="info">
                  <SqBadge>{t('buildDisplay.tcWeapon')}</SqBadge>
                </Typography>
              ) : (
                <WeaponCard weaponId={oldId!} onDelete={deleteWeapon} />
              )}
            </Box>
          )}
          {diffCurrentWeap && <Box display="flex" flexGrow={1} />}
          {diffCurrentWeap && (
            <Box display="flex" alignItems="center" justifyContent="center">
              <ChevronRight sx={{ fontSize: 40 }} />
            </Box>
          )}
          {diffCurrentWeap && <Box display="flex" flexGrow={1} />}
          <Box minWidth={320} display="flex" flexDirection="column" gap={1}>
            <CardThemed bgt="light" sx={{ p: 1 }}>
              <Typography variant="h6" textAlign="center">
                {t('buildDisplay.newWeapon')}
              </Typography>
            </CardThemed>
            <WeaponCard weaponId={newId} onDelete={deleteWeapon} />
          </Box>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}

function CompareArtifactModal({
  newOld: { newId, oldId },
  mainStatAssumptionLevel,
  onClose,
  compareFromCharEditor,
}: {
  newOld: NewOld
  mainStatAssumptionLevel: number
  onClose: () => void
  compareFromCharEditor: boolean
}) {
  const { t } = useTranslation('page_character_optimize')
  const database = useDatabase()
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)

  const newLoc = database.arts.get(newId)?.location ?? ''
  const newArtifact = useArtifact(newId)
  const oldArtifact = useArtifact(oldId)

  const [fixedSlotKey, setFixedSlotKey] = useState<
    ArtifactSlotKey | undefined
  >()
  const [artifactIdToEdit, setArtifactIdToEdit] = useState<string | undefined>()
  return (
    <ModalWrapper
      open={!!newId}
      onClose={onClose}
      containerProps={{ maxWidth: oldId ? 'md' : 'xs' }}
    >
      <CardThemed>
        <CardContent
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'stretch',
            gap: 2,
          }}
        >
          <Suspense fallback={false}>
            <ArtifactEditor
              artifactIdToEdit={artifactIdToEdit}
              cancelEdit={() => setArtifactIdToEdit(undefined)}
              disableSet
              fixedSlotKey={fixedSlotKey}
            />
          </Suspense>
          {oldId && (
            <Box minWidth={320} display="flex" flexDirection="column" gap={1}>
              <CardThemed bgt="light" sx={{ p: 1 }}>
                <Typography variant="h6" textAlign="center">
                  {t('compareArtModal.oldArt')}
                </Typography>
              </CardThemed>
              {oldId === 'tc' ? (
                <Typography variant="h6" textAlign="center" color="info">
                  <SqBadge>{t('compareArtModal.tcArt')}</SqBadge>
                </Typography>
              ) : (
                <ArtifactCard
                  artifactId={oldId}
                  onDelete={() => database.arts.remove(oldId)}
                  mainStatAssumptionLevel={mainStatAssumptionLevel}
                  onEdit={() => {
                    setArtifactIdToEdit(oldId)
                    setFixedSlotKey(oldArtifact?.slotKey)
                  }}
                  onLockToggle={() =>
                    database.arts.set(oldId, ({ lock }) => ({ lock: !lock }))
                  }
                />
              )}

              {oldId !== 'tc' && !compareFromCharEditor && (
                <ArtInclusionButton id={oldId} />
              )}
            </Box>
          )}
          {oldId && <Box display="flex" flexGrow={1} />}
          {oldId && (
            <Box display="flex" alignItems="center" justifyContent="center">
              <ChevronRight sx={{ fontSize: 40 }} />
            </Box>
          )}
          {oldId && <Box display="flex" flexGrow={1} />}
          <Box minWidth={320} display="flex" flexDirection="column" gap={1}>
            {oldId && (
              <CardThemed bgt="light" sx={{ p: 1 }}>
                <Typography variant="h6" textAlign="center">
                  {t('compareArtModal.newArt')}
                </Typography>
              </CardThemed>
            )}
            <ArtifactCard
              artifactId={newId}
              onDelete={() => database.arts.remove(newId)}
              mainStatAssumptionLevel={mainStatAssumptionLevel}
              onEdit={() => {
                setArtifactIdToEdit(newId)
                setFixedSlotKey(newArtifact?.slotKey)
              }}
              onLockToggle={() =>
                database.arts.set(newId, ({ lock }) => ({ lock: !lock }))
              }
            />
            {!compareFromCharEditor && (
              <>
                {newArtifact && <ArtInclusionButton id={newId} />}
                {newLoc && newLoc !== charKeyToLocCharKey(characterKey) && (
                  <ExcludeEquipButton locationKey={newLoc} />
                )}
                {newArtifact &&
                  allArtifactSetExclusionKeys.includes(
                    newArtifact.setKey as ArtSetExclusionKey
                  ) && (
                    <SetInclusionButton
                      setKey={newArtifact.setKey as ArtSetExclusionKey}
                    />
                  )}
              </>
            )}
          </Box>
        </CardContent>
      </CardThemed>
    </ModalWrapper>
  )
}
function ArtInclusionButton({ id }: { id: string }) {
  const { t } = useTranslation('page_character_optimize')
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { artExclusion } = useOptConfig(optConfigId)!
  const excluded = artExclusion.includes(id)
  const toggle = useCallback(
    () =>
      database.optConfigs.set(optConfigId, {
        artExclusion: toggleArr(artExclusion, id),
      }),
    [id, artExclusion, database, optConfigId]
  )
  if (!optConfigId) return null
  return (
    <BootstrapTooltip
      title={
        <Box>
          <Typography>{t('excludeArt.includeArtifactTip')}</Typography>
        </Box>
      }
      placement="top"
      arrow
    >
      <Button
        onClick={toggle}
        color={excluded ? 'secondary' : 'success'}
        size="small"
        startIcon={excluded ? <CheckBoxOutlineBlankIcon /> : <CheckBoxIcon />}
      >
        {t('excludeArt.includeArtifactButton')}
      </Button>
    </BootstrapTooltip>
  )
}
function ExcludeEquipButton({
  locationKey,
}: {
  locationKey: LocationCharacterKey
}) {
  const { t } = useTranslation('page_character_optimize')
  const {
    teamChar: { optConfigId },
  } = useContext(TeamCharacterContext)
  const database = useDatabase()
  const { gender } = useDBMeta()
  const characterKey = database.chars.LocationToCharacterKey(locationKey)
  const { excludedLocations } = useOptConfig(optConfigId) ?? {
    excludedLocations: [] as LocationCharacterKey[],
  }
  const excluded = excludedLocations.includes(locationKey)
  const toggle = useCallback(
    () =>
      database.optConfigs.set(optConfigId, {
        excludedLocations: toggleArr(excludedLocations, locationKey),
      }),
    [locationKey, excludedLocations, database, optConfigId]
  )
  if (!optConfigId) return null
  return (
    <Button
      onClick={toggle}
      color={excluded ? 'secondary' : 'success'}
      size="small"
      startIcon={excluded ? <CheckBoxOutlineBlankIcon /> : <CheckBoxIcon />}
    >
      <span>
        {t('excludeChar.allowEquip')}{' '}
        <strong>
          <CharacterName characterKey={characterKey} gender={gender} />
        </strong>
      </span>
    </Button>
  )
}
