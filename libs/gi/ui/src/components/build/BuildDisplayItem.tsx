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
import { objKeyMap, toggleArr } from '@genshin-optimizer/common/util'
import type {
  ArtifactSlotKey,
  LocationCharacterKey,
} from '@genshin-optimizer/gi/consts'
import {
  allArtifactSlotKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import type {
  AllowLocationsState,
  ArtSetExclusionKey,
  ICachedArtifact,
} from '@genshin-optimizer/gi/db'
import { allArtifactSetExclusionKeys } from '@genshin-optimizer/gi/db'
import {
  CharacterContext,
  TeamCharacterContext,
  useArtifact,
  useDBMeta,
  useDatabase,
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
import { ArtifactCard, ArtifactCardNano, SetInclusionButton } from '../artifact'
import { ArtifactSetBadges } from '../artifact/ArtifactSetBadges'
import { CharacterName } from '../character'
import { StatDisplayComponent } from '../character/StatDisplayComponent'
import { WeaponCard, WeaponCardNano } from '../weapon'
import { EquipBuildModal } from './EquipBuildModal'
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
  allowLocationsState: AllowLocationsState
}

// TODO: Translation for build UI
//for displaying each artifact build
export const BuildDisplayItem = memo(function BuildDisplayItem({
  label,
  extraButtonsRight,
  extraButtonsLeft,
  disabled,
  mainStatAssumptionLevel,
  allowLocationsState,
}: BuildDisplayItemProps) {
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

  const artifactIdsBySlot = useMemo(
    () =>
      Object.fromEntries(
        allArtifactSlotKeys.map((slotKey) => [
          slotKey,
          data.get(input.art[slotKey].id).value?.toString(),
        ])
      ),
    [data]
  )
  const artifacts = useMemo(
    () =>
      artifactIdsBySlot &&
      (Object.values(artifactIdsBySlot)
        .map((artiId: string) => database.arts.get(artiId))
        .filter((arti) => arti) as ICachedArtifact[]),
    [artifactIdsBySlot, database.arts]
  )

  const weapNano = useMemo(() => {
    return (
      <Grid item xs={1}>
        <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
          <WeaponCardNano
            showLocation
            weaponId={data.get(input.weapon.id).value!}
            onClick={onShowWeapon}
          />
        </CardThemed>
      </Grid>
    )
  }, [data, onShowWeapon])

  // Memoize Arts because of its dynamic onClick
  const artNanos = useMemo(
    () =>
      allArtifactSlotKeys.map((slotKey) => (
        <Grid item xs={1} key={slotKey}>
          <CardThemed sx={{ height: '100%', maxHeight: '8em' }}>
            <ArtifactCardNano
              showLocation
              slotKey={slotKey}
              artifactId={artifactIdsBySlot[slotKey]}
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
      setArtNewOld,
      artifactNewOldBySlot,
      mainStatAssumptionLevel,
      artifactIdsBySlot,
    ]
  )

  const currentlyEquipped =
    allArtifactSlotKeys.every(
      (slotKey) => artifactIdsBySlot[slotKey] === equippedArtifacts[slotKey]
    ) && data.get(input.weapon.id).value === equippedWeapon

  const sameAsBuildIds = useMemo(
    () =>
      dbDirty &&
      buildIds.filter((buildId) => {
        const build = database.builds.get(buildId)
        if (!build) return false
        const { artifactIds, weaponId } = build
        return (
          allArtifactSlotKeys.every(
            (slotKey) => artifactIdsBySlot[slotKey] === artifactIds[slotKey]
          ) && data.get(input.weapon.id).value === weaponId
        )
      }),
    [dbDirty, database, buildIds, artifactIdsBySlot, data]
  )

  const isActiveBuild = buildType === 'real' && sameAsBuildIds.includes(buildId)
  const isActiveBuildOrEquip =
    isActiveBuild || (buildType === 'equipped' && currentlyEquipped)

  // An undefined buildType indicates this was accessed from outside a team. This currently occurs
  // when comparing from the character editor.
  const compareFromCharEditor = buildType === undefined

  const activeWeapon = useMemo(() => {
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

  const activeArtifacts = useMemo(() => {
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

  const equipChangeProps = {
    currentName:
      buildType === 'real' ? database.builds.get(buildId)!.name : 'Equipped',
    currentWeapon: activeWeapon,
    currentArtifacts: activeArtifacts,
    newWeapon: data.get(input.weapon.id).value!,
    newArtifacts: objKeyMap(
      allArtifactSlotKeys,
      (s) => data.get(input.art[s].id).value!
    ),
  }

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
            allowLocationsState={allowLocationsState}
            compareFromCharEditor={compareFromCharEditor}
          />
        )}
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box display="flex" gap={1} flexWrap="wrap">
            {label !== undefined && (
              <SqBadge color={currentlyEquipped ? 'success' : 'info'}>
                <Typography sx={{ display: 'flex', gap: 1 }}>
                  <strong>{label}</strong>
                  {/* TODO: Translation */}
                  {currentlyEquipped && <span>(Equipped)</span>}
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
                  {/* TODO: Translation */}
                  {isActiveBuild && <span>(current build)</span>}
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
              equipChangeProps={equipChangeProps}
              showPrompt={showEquipChange}
              onEquip={equipBuild}
              OnHidePrompt={onHideEquipChange}
            />
            <Button
              size="small"
              color="success"
              onClick={onShowEquipChange}
              disabled={disabled || isActiveBuild}
              startIcon={<Checkroom />}
            >
              Equip to Current Build
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
                  Old Weapon
                </Typography>
              </CardThemed>
              {oldId === 'tc' ? (
                <Typography variant="h6" textAlign="center" color="info">
                  <SqBadge>TC Weapon</SqBadge>
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
                New Weapon
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
  allowLocationsState,
  compareFromCharEditor,
}: {
  newOld: NewOld
  mainStatAssumptionLevel: number
  onClose: () => void
  allowLocationsState: AllowLocationsState
  compareFromCharEditor: boolean
}) {
  const database = useDatabase()
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)

  const newLoc = database.arts.get(newId)?.location ?? ''
  const newArtifact = useArtifact(newId)
  const oldArtifact = useArtifact(oldId)

  const deleteArtifact = useCallback(
    (id: string) => database.arts.remove(id),
    [database]
  )

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
          {oldId && (
            <Box minWidth={320} display="flex" flexDirection="column" gap={1}>
              <CardThemed bgt="light" sx={{ p: 1 }}>
                <Typography variant="h6" textAlign="center">
                  Old Artifact
                </Typography>
              </CardThemed>
              {oldId === 'tc' ? (
                <Typography variant="h6" textAlign="center" color="info">
                  <SqBadge>TC Artifact</SqBadge>
                </Typography>
              ) : (
                <ArtifactCard
                  artifactId={oldId}
                  onDelete={deleteArtifact}
                  mainStatAssumptionLevel={mainStatAssumptionLevel}
                  editorProps={{
                    disableSet: true,
                    fixedSlotKey: oldArtifact?.slotKey,
                  }}
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
            <CardThemed bgt="light" sx={{ p: 1 }}>
              <Typography variant="h6" textAlign="center">
                New Artifact
              </Typography>
            </CardThemed>
            <ArtifactCard
              artifactId={newId}
              onDelete={deleteArtifact}
              mainStatAssumptionLevel={mainStatAssumptionLevel}
              editorProps={{
                disableSet: true,
                fixedSlotKey: newArtifact?.slotKey,
              }}
            />
            {!compareFromCharEditor && (
              <>
                {newArtifact && <ArtInclusionButton id={newId} />}
                {newLoc &&
                  newLoc !== charKeyToLocCharKey(characterKey) &&
                  allowLocationsState !== 'all' && (
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
          <Typography>{t`excludeArt.includeArtifactTip`}</Typography>
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
        {t`excludeArt.includeArtifactButton`}
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
        {t`excludeChar.allowEquip`}{' '}
        <strong>
          <CharacterName characterKey={characterKey} gender={gender} />
        </strong>
      </span>
    </Button>
  )
}
