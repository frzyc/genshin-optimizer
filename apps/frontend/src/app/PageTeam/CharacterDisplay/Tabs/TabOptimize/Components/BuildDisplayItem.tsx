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
    teamChar: {
      optConfigId,
      buildType,
      buildId,
      compare,
      compareType,
      compareBuildId,
    },
  } = useContext(TeamCharacterContext)
  const {
    character: { key: characterKey, equippedArtifacts, equippedWeapon },
  } = useContext(CharacterContext)
  const { mainStatAssumptionLevel, allowLocationsState } = useOptConfig(
    optConfigId
  ) ?? { mainStatAssumptionLevel: 0, allowLocationsState: 'all' }
  const database = useDatabase()
  const { data } = useContext(DataContext)
  const [newOld, setNewOld] = useState(undefined as NewOld | undefined)
  const close = useCallback(() => setNewOld(undefined), [setNewOld])
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

  const compareEquippedArtifactIds: Record<
    ArtifactSlotKey,
    string | undefined
  > = useMemo(() => {
    if (!compare) return buildEquippedArtifactIds
    if (compareType === 'tc') return objKeyMap(allArtifactSlotKeys, () => 'tc')
    if (compareType === 'equipped') return equippedArtifacts
    if (compareType === 'real')
      return database.builds.get(compareBuildId)!.artifactIds

    // default
    return objKeyMap(allArtifactSlotKeys, () => '')
  }, [
    compareType,
    compare,
    compareBuildId,
    database,
    equippedArtifacts,
    buildEquippedArtifactIds,
  ])

  const buildEquippedWeaponId: string = useMemo(() => {
    if (buildType === 'tc') return 'tc'
    if (buildType === 'equipped') return equippedWeapon
    if (buildType === 'real')
      return database.builds.get(buildId)!.weaponId ?? ''
    // default
    return ''
  }, [buildType, buildId, database, equippedWeapon])
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
              const oldId = compareEquippedArtifactIds[slotKey]
              const newId = artifactIdsBySlot[slotKey]!
              setNewOld({ oldId: oldId !== newId ? oldId : undefined, newId })
            }}
          />
        </Grid>
      )),
    [
      setNewOld,
      compareEquippedArtifactIds,
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
        {newOld && (
          <CompareArtifactModal
            newOld={newOld}
            mainStatAssumptionLevel={mainStatAssumptionLevel}
            onClose={close}
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
            <Grid item xs={1}>
              <WeaponCardNano
                showLocation
                weaponId={data.get(input.weapon.id).value!}
              />
            </Grid>
            {artNanos}
          </Grid>
          <StatDisplayComponent />
        </CardContent>
      </Suspense>
    </CardLight>
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
    teamChar: { buildType, buildId },
  } = useContext(TeamCharacterContext)
  const buildEquip = buildId && buildType === 'real'
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const onEquip = useCallback(() => {
    const confirmMsg = buildEquip
      ? 'Do you want to equip this artifact to this build?'
      : 'Do you want to equip this artifact to this character?'
    if (!window.confirm(confirmMsg)) return
    if (buildEquip) {
      const art = database.arts.get(newId)
      if (!art) return
      if (art.slotKey)
        database.builds.set(buildId, (build) => {
          build.artifactIds[art.slotKey] = newId
        })
    } else
      database.arts.set(newId, { location: charKeyToLocCharKey(characterKey) })
    onClose()
  }, [newId, buildEquip, buildId, database, characterKey, onClose])
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
                  canEquip={!buildEquip}
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
              <Button
                onClick={onEquip}
                sx={{ display: 'flex' }}
                disabled={oldId === 'tc'}
              >
                <ChevronRight sx={{ fontSize: 40 }} />
              </Button>
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
              canEquip={!buildEquip}
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
