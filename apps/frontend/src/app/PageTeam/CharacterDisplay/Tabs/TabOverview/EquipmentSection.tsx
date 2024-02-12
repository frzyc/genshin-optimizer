import { useBoolState } from '@genshin-optimizer/common/react-util'
import { objKeyMap } from '@genshin-optimizer/common/util'
import {
  allArtifactSlotKeys,
  allSubstatKeys,
  charKeyToLocCharKey,
} from '@genshin-optimizer/gi/consts'
import { useCharMeta, useDatabase } from '@genshin-optimizer/gi/db-ui'
import { getCharData } from '@genshin-optimizer/gi/stats'
import { Settings } from '@mui/icons-material'
import {
  Box,
  Button,
  CardContent,
  Grid,
  ListItem,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useCallback, useContext, useDeferredValue, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import SetEffectDisplay from '../../../../Components/Artifact/SetEffectDisplay'
import SubstatToggle from '../../../../Components/Artifact/SubstatToggle'
import CardDark from '../../../../Components/Card/CardDark'
import CardLight from '../../../../Components/Card/CardLight'
import EquippedGrid from '../../../../Components/Character/EquippedGrid'
import DocumentDisplay from '../../../../Components/DocumentDisplay'
import {
  BasicFieldDisplay,
  FieldDisplayList,
} from '../../../../Components/FieldDisplay'
import ModalWrapper from '../../../../Components/ModalWrapper'
import PercentBadge from '../../../../Components/PercentBadge'
import { CharacterContext } from '../../../../Context/CharacterContext'
import { DataContext } from '../../../../Context/DataContext'
import { TeamCharacterContext } from '../../../../Context/TeamCharacterContext'
import { dataSetEffects } from '../../../../Data/Artifacts'
import Artifact from '../../../../Data/Artifacts/Artifact'
import { uiInput as input } from '../../../../Formula'
import type { IFieldDisplay } from '../../../../Types/fieldDisplay'

export default function EquipmentSection() {
  const {
    character: { key: characterKey },
  } = useContext(CharacterContext)
  const {
    teamChar: { buildType, buildId },
  } = useContext(TeamCharacterContext)
  const loadoutEquip = buildId && buildType === 'real'
  const { teamData, data } = useContext(DataContext)
  const weaponSheet = teamData[characterKey]?.weaponSheet
  const database = useDatabase()
  const theme = useTheme()
  const breakpoint = useMediaQuery(theme.breakpoints.up('lg'))

  const weaponDoc = useMemo(
    () =>
      weaponSheet &&
      weaponSheet.document.length > 0 && (
        <CardLight>
          <Box p={1}>
            <DocumentDisplay sections={weaponSheet.document} />
          </Box>
        </CardLight>
      ),
    [weaponSheet]
  )

  const weaponTypeKey = getCharData(characterKey).weaponType
  const weaponId = data.get(input.weapon.id).value
  const artifactIds = useMemo(
    () =>
      objKeyMap(
        allArtifactSlotKeys,
        (slotKey) => data.get(input.art[slotKey].id).value
      ),
    [data]
  )
  return (
    <Box>
      <Grid container spacing={1}>
        {breakpoint && (
          <Grid
            item
            xs={12}
            md={12}
            lg={3}
            xl={3}
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            {weaponDoc && weaponDoc}
            <ArtifactSectionCard />
          </Grid>
        )}
        <Grid item xs={12} md={12} lg={9} xl={9} spacing={1}>
          <EquippedGrid
            weaponTypeKey={weaponTypeKey}
            weaponId={weaponId}
            artifactIds={artifactIds}
            setWeapon={(id) => {
              if (loadoutEquip) database.builds.set(buildId, { weaponId: id })
              else
                database.weapons.set(id, {
                  location: charKeyToLocCharKey(characterKey),
                })
            }}
            setArtifact={(id) => {
              if (loadoutEquip)
                database.builds.set(buildId, (build) => {
                  const art = database.arts.get(id)
                  if (art?.slotKey) build.artifactIds[art.slotKey] = id
                })
              else
                database.arts.set(id, {
                  location: charKeyToLocCharKey(characterKey),
                })
            }}
          />
        </Grid>
        {!breakpoint && (
          <Grid item xs={12} md={12} xl={3} container spacing={1}>
            {weaponDoc && (
              <Grid item xs={12} md={6} lg={4}>
                {weaponDoc}
              </Grid>
            )}
            <Grid
              item
              xs={12}
              md={6}
              lg={4}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              <ArtifactSectionCard />
            </Grid>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
function ArtifactSectionCard() {
  const { t } = useTranslation(['page_character', 'artifact'])
  const database = useDatabase()
  const {
    character,
    character: { key: characterKey, equippedArtifacts },
  } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const hasEquipped = useMemo(
    () => !!Object.values(equippedArtifacts).filter((i) => i).length,
    [equippedArtifacts]
  )
  const unequipArts = useCallback(() => {
    if (!character) return
    if (
      !window.confirm(
        'Do you want to move all currently equipped artifacts to inventory?'
      )
    )
      return
    Object.values(equippedArtifacts).forEach((aid) =>
      database.arts.set(aid, { location: '' })
    )
  }, [character, database, equippedArtifacts])

  const setEffects = useMemo(() => dataSetEffects(data), [data])
  const { rvFilter } = useCharMeta(characterKey)
  const setRVFilter = useCallback(
    (rvFilter) => database.charMeta.set(characterKey, { rvFilter }),
    [database, characterKey]
  )

  const [show, onShow, onHide] = useBoolState()
  const deferredrvFilter = useDeferredValue(rvFilter)
  const { rvField, rvmField } = useMemo(() => {
    const {
      currentEfficiency,
      currentEfficiency_,
      maxEfficiency,
      maxEfficiency_,
    } = Object.values(equippedArtifacts).reduce(
      (a, artid) => {
        const art = database.arts.get(artid)
        if (art) {
          const { currentEfficiency, maxEfficiency } =
            Artifact.getArtifactEfficiency(art, new Set(deferredrvFilter))
          const {
            currentEfficiency: currentEfficiency_,
            maxEfficiency: maxEfficiency_,
          } = Artifact.getArtifactEfficiency(art, new Set(allSubstatKeys))
          a.currentEfficiency = a.currentEfficiency + currentEfficiency
          a.maxEfficiency = a.maxEfficiency + maxEfficiency

          a.currentEfficiency_ = a.currentEfficiency_ + currentEfficiency_
          a.maxEfficiency_ = a.maxEfficiency_ + maxEfficiency_
        }
        return a
      },
      {
        currentEfficiency: 0,
        currentEfficiency_: 0,
        maxEfficiency: 0,
        maxEfficiency_: 0,
      }
    )
    const rvField: IFieldDisplay = {
      text: t`artifact:editor.curSubEff`,
      value: !(currentEfficiency - currentEfficiency_) ? (
        <PercentBadge value={currentEfficiency} max={4500} valid />
      ) : (
        <span>
          <PercentBadge value={currentEfficiency} max={4500} valid /> /{' '}
          <PercentBadge value={currentEfficiency_} max={4500} valid />
        </span>
      ),
    }
    const rvmField: IFieldDisplay = {
      text: t`artifact:editor.maxSubEff`,
      canShow: () => !!(currentEfficiency_ - maxEfficiency_),
      value: !(maxEfficiency - maxEfficiency_) ? (
        <PercentBadge value={maxEfficiency} max={4500} valid />
      ) : (
        <span>
          <PercentBadge value={maxEfficiency} max={4500} valid /> /{' '}
          <PercentBadge value={maxEfficiency_} max={4500} valid />
        </span>
      ),
    }
    return { rvField, rvmField }
  }, [t, deferredrvFilter, equippedArtifacts, database])

  return (
    <CardLight>
      {hasEquipped && (
        <Button
          color="error"
          onClick={unequipArts}
          fullWidth
          sx={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}
        >{t`tabEquip.unequipArts`}</Button>
      )}
      <Box p={1}>
        <Stack spacing={1}>
          <CardDark>
            <Button
              fullWidth
              color="info"
              startIcon={<Settings />}
              sx={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
              onClick={onShow}
            >
              RV Filter
            </Button>
            <ModalWrapper open={show} onClose={onHide}>
              <CardDark>
                <CardContent>
                  <Typography
                    textAlign="center"
                    gutterBottom
                    variant="h6"
                  >{t`artifact:efficiencyFilter.title`}</Typography>
                  <SubstatToggle
                    selectedKeys={rvFilter}
                    onChange={setRVFilter}
                  />
                </CardContent>
              </CardDark>
            </ModalWrapper>
            <FieldDisplayList>
              <BasicFieldDisplay field={rvField} component={ListItem} />
              {rvmField?.canShow?.(data) && (
                <BasicFieldDisplay field={rvmField} component={ListItem} />
              )}
            </FieldDisplayList>
          </CardDark>
          {setEffects &&
            Object.entries(setEffects).flatMap(([setKey, setNumKeyArr]) =>
              setNumKeyArr.map((setNumKey) => (
                <SetEffectDisplay
                  key={setKey + setNumKey}
                  setKey={setKey}
                  setNumKey={setNumKey}
                />
              ))
            )}
        </Stack>
      </Box>
    </CardLight>
  )
}
