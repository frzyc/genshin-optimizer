import { useBoolState } from '@genshin-optimizer/common/react-util'
import { CardThemed } from '@genshin-optimizer/common/ui'
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
  useArtifact,
  useDatabase,
  useOptConfig,
} from '@genshin-optimizer/gi/db-ui'
import { Checkroom, ChevronRight } from '@mui/icons-material'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank'
import {
  Box,
  Button,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material'
import { Suspense, useCallback, useContext, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import ArtifactCardNano from '../../../../../Components/Artifact/ArtifactCardNano'
import BootstrapTooltip from '../../../../../Components/BootstrapTooltip'
import CardDark from '../../../../../Components/Card/CardDark'
import CardLight from '../../../../../Components/Card/CardLight'
import StatDisplayComponent from '../../../../../Components/Character/StatDisplayComponent'
import ModalWrapper from '../../../../../Components/ModalWrapper'
import SqBadge from '../../../../../Components/SqBadge'
import WeaponCardNano from '../../../../../Components/Weapon/WeaponCardNano'
import { CharacterContext } from '../../../../../Context/CharacterContext'
import { DataContext } from '../../../../../Context/DataContext'
import { TeamCharacterContext } from '../../../../../Context/TeamCharacterContext'
import { getCharSheet } from '../../../../../Data/Characters'
import { uiInput as input } from '../../../../../Formula'
import ArtifactCard from '../../../../../PageArtifact/ArtifactCard'
import WeaponCard from '../../../../../PageWeapon/WeaponCard'
import { ArtifactSetBadges } from './ArtifactSetBadges'
import SetInclusionButton from './SetInclusionButton'

type NewOld = {
  newId: string
  oldId?: string
}

type BuildDisplayItemProps = {
  label?: Displayable
  disabled?: boolean
  extraButtonsRight?: JSX.Element
  extraButtonsLeft?: JSX.Element
}

// TODO: Translation for build UI
//for displaying each artifact build
export default function BuildDisplayItem({
  label,
  extraButtonsRight,
  extraButtonsLeft,
  disabled,
}: BuildDisplayItemProps) {
  const {
    teamChar: { optConfigId, buildType, buildId },
  } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey, equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)
  const { mainStatAssumptionLevel, allowLocationsState } = useOptConfig(
    optConfigId
  ) ?? { mainStatAssumptionLevel: 0, allowLocationsState: 'all' }
  const database = useDatabase()
  const { data, oldData } = useContext(DataContext)

  // update when data is recalc'd
  const weaponNewOld = useMemo(
    () => ({
      oldId: oldData?.get(input.weapon.id)?.value,
      newId: data.get(input.weapon.id).value ?? '',
    }),
    [data, oldData]
  )

  // state for showing weapon compare modal
  const [showWeapon, onShowWeapon, onHideWeapon] = useBoolState(false)

  // update when data is recalc'd
  const artifactNewOldBySlot: Record<ArtifactSlotKey, NewOld> = useMemo(
    () =>
      objKeyMap(allArtifactSlotKeys, (slotKey) => ({
        oldId: oldData?.get(input.art[slotKey].id)?.value,
        newId: data.get(input.art[slotKey].id).value ?? '',
      })),
    [data, oldData]
  )

  // state for showing art compare modal
  const [artNewOld, setArtNewOld] = useState<NewOld | undefined>()
  const closeArt = useCallback(() => setArtNewOld(undefined), [setArtNewOld])
  const buildEquip = buildId && buildType === 'real'
  const equipBuild = useCallback(() => {
    const confirmMsg = buildEquip
      ? 'Do you want to equip this build to the currently active build?'
      : 'Do you want to equip this build to this character?'
    if (!window.confirm(confirmMsg)) return
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

  const buildEquippedArtifactIds: Record<ArtifactSlotKey, string | undefined> =
    useMemo(() => {
      if (buildType === 'tc') return objKeyMap(allArtifactSlotKeys, () => 'tc')
      if (buildType === 'equipped') return equippedArtifacts
      if (buildType === 'real') return database.builds.get(buildId)!.artifactIds

      // default
      return objKeyMap(allArtifactSlotKeys, () => '')
    }, [buildType, buildId, database, equippedArtifacts])

  const buildEquippedWeaponId: string = useMemo(() => {
    if (buildType === 'tc') return 'tc'
    if (buildType === 'equipped') return equippedWeapon
    if (buildType === 'real')
      return database.builds.get(buildId)!.weaponId ?? ''
    // default
    return ''
  }, [buildType, buildId, database, equippedWeapon])

  const weapNano = useMemo(() => {
    return (
      <Grid item xs={1}>
        <WeaponCardNano
          showLocation
          weaponId={data.get(input.weapon.id).value!}
          onClick={onShowWeapon}
        />
      </Grid>
    )
  }, [data, onShowWeapon])

  // Memoize Arts because of its dynamic onClick
  const artNanos = useMemo(
    () =>
      allArtifactSlotKeys.map((slotKey) => (
        <Grid item xs={1} key={slotKey}>
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
      (slotKey) =>
        artifactIdsBySlot[slotKey] === buildEquippedArtifactIds[slotKey]
    ) && data.get(input.weapon.id).value === buildEquippedWeaponId

  return (
    <CardLight>
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
          />
        )}
        <CardContent>
          <Box display="flex" gap={1} sx={{ pb: 1 }} flexWrap="wrap">
            {label !== undefined && (
              <SqBadge color="info">
                <Typography>
                  <strong>
                    {label}
                    {currentlyEquipped ? ' (Equipped)' : ''}
                  </strong>
                </Typography>
              </SqBadge>
            )}
            <ArtifactSetBadges
              artifacts={artifacts}
              currentlyEquipped={currentlyEquipped}
            />
            <Box
              sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}
            />
            {extraButtonsLeft}
            <Button
              size="small"
              color="success"
              onClick={equipBuild}
              disabled={disabled || currentlyEquipped}
              startIcon={<Checkroom />}
            >
              Equip Build
            </Button>
            {extraButtonsRight}
          </Box>
          <Grid
            container
            spacing={1}
            sx={{ pb: 1 }}
            columns={{ xs: 2, sm: 3, md: 4, lg: 6 }}
          >
            {weapNano}
            {artNanos}
          </Grid>
          <StatDisplayComponent />
        </CardContent>
      </Suspense>
    </CardLight>
  )
}

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
      <CardDark>
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
      </CardDark>
    </ModalWrapper>
  )
}

function CompareArtifactModal({
  newOld: { newId, oldId },
  mainStatAssumptionLevel,
  onClose,
  allowLocationsState,
}: {
  newOld: NewOld
  mainStatAssumptionLevel: number
  onClose: () => void
  allowLocationsState: AllowLocationsState
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
      <CardDark>
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

              {oldId !== 'tc' && <ArtInclusionButton id={oldId} />}
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
          </Box>
        </CardContent>
      </CardDark>
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
  const characterSheet = getCharSheet(
    database.chars.LocationToCharacterKey(locationKey)
  )
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
        {t`excludeChar.allowEquip`} <strong>{characterSheet.name}</strong>
      </span>
    </Button>
  )
}
