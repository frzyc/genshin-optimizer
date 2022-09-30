import { Settings, SwapHoriz } from '@mui/icons-material';
import { Box, Button, CardContent, Divider, Grid, ListItem, Stack, Tooltip, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from "@mui/system";
import { lazy, Suspense, useCallback, useContext, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SetEffectDisplay from '../../../../Components/Artifact/SetEffectDisplay';
import SlotNameWithIcon from '../../../../Components/Artifact/SlotNameWIthIcon';
import SubstatToggle from '../../../../Components/Artifact/SubstatToggle';
import CardDark from '../../../../Components/Card/CardDark';
import CardLight from '../../../../Components/Card/CardLight';
import DocumentDisplay from "../../../../Components/DocumentDisplay";
import { BasicFieldDisplay, FieldDisplayList } from '../../../../Components/FieldDisplay';
import ModalWrapper from '../../../../Components/ModalWrapper';
import PercentBadge from '../../../../Components/PercentBadge';
import { CharacterContext } from '../../../../Context/CharacterContext';
import { DataContext } from '../../../../Context/DataContext';
import Artifact from '../../../../Data/Artifacts/Artifact';
import { ArtifactSheet } from '../../../../Data/Artifacts/ArtifactSheet';
import { DatabaseContext } from '../../../../Database/Database';
import { uiInput as input } from '../../../../Formula';
import ArtifactCard from '../../../../PageArtifact/ArtifactCard';
import WeaponCard from '../../../../PageWeapon/WeaponCard';
import useBoolState from '../../../../ReactHooks/useBoolState';
import useCharMeta from '../../../../ReactHooks/useCharMeta';
import usePromise from '../../../../ReactHooks/usePromise';
import { allSubstatKeys } from '../../../../Types/artifact';
import { allSlotKeys, charKeyToLocCharKey, SlotKey, WeaponTypeKey } from '../../../../Types/consts';
import { IFieldDisplay } from '../../../../Types/fieldDisplay';
import useBuildSetting from '../TabOptimize/useBuildSetting';
import ArtifactSwapModal from './ArtifactSwapModal';
import WeaponSwapModal from './WeaponSwapModal';

const WeaponEditor = lazy(() => import('../../../../PageWeapon/WeaponEditor'))

export default function EquipmentSection() {
  const { character: { equippedWeapon, key: characterKey }, characterSheet } = useContext(CharacterContext)
  const { buildSetting: { mainStatAssumptionLevel } } = useBuildSetting(characterKey)
  const { teamData, data } = useContext(DataContext)
  const weaponSheet = teamData[characterKey]?.weaponSheet
  const [weaponId, setweaponId] = useState("")
  const showWeapon = useCallback(() => setweaponId(equippedWeapon), [equippedWeapon],)
  const hideWeapon = useCallback(() => setweaponId(""), [])

  //triggers when character swap weapons
  useEffect(() => {
    if (weaponId && weaponId !== equippedWeapon)
      setweaponId(equippedWeapon)
  }, [weaponId, equippedWeapon])

  const theme = useTheme();
  const breakpoint = useMediaQuery(theme.breakpoints.up('lg'));

  const weaponDoc = useMemo(() => weaponSheet && weaponSheet.document.length > 0 && <CardLight><CardContent><DocumentDisplay sections={weaponSheet.document} /></CardContent></CardLight>, [weaponSheet])
  const { rvFilter } = useCharMeta(characterKey)
  const deferredRvFilter = useDeferredValue(rvFilter)
  const deferredRvSet = useMemo(() => new Set(deferredRvFilter), [deferredRvFilter])
  return <Box >
    <Suspense fallback={false}>
      <WeaponEditor
        weaponId={weaponId}
        footer
        onClose={hideWeapon}
        extraButtons={<LargeWeaponSwapButton weaponTypeKey={characterSheet.weaponTypeKey} />}
      />
    </Suspense>
    <Grid container spacing={1}>
      {breakpoint && <Grid item xs={12} md={12} lg={3} xl={3} sx={{ display: "flex", flexDirection: "column", gap: 1 }} >
        {weaponDoc && weaponDoc}
        <ArtifactSectionCard />
      </Grid>}
      <Grid item xs={12} md={12} lg={9} xl={9} container spacing={1}>
        <Grid item xs={12} sm={6} md={4} display="flex" flexDirection="column" gap={1}>
          <WeaponCard weaponId={equippedWeapon} onEdit={showWeapon} canEquip extraButtons={<WeaponSwapButton weaponTypeKey={characterSheet.weaponTypeKey} />} />
        </Grid>
        {allSlotKeys.map(slotKey => <Grid item xs={12} sm={6} md={4} key={slotKey} >
          {!!data.get(input.art[slotKey].id).value ?
            <ArtifactCard artifactId={data.get(input.art[slotKey].id).value} mainStatAssumptionLevel={mainStatAssumptionLevel} effFilter={deferredRvSet}
              extraButtons={<ArtifactSwapButton slotKey={slotKey} />} editor canExclude canEquip /> :
            <ArtSwapCard slotKey={slotKey} />}
        </Grid>)}
      </Grid>
      {!breakpoint && <Grid item xs={12} md={12} xl={3} container spacing={1} >
        {weaponDoc && <Grid item xs={12} md={6} lg={4}>{weaponDoc}</Grid>}
        <Grid item xs={12} md={6} lg={4} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <ArtifactSectionCard />
        </Grid>
      </Grid>}
    </Grid>
  </Box>
}
function ArtSwapCard({ slotKey }: { slotKey: SlotKey }) {
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState()
  return <CardLight sx={{ height: "100%", width: "100%", minHeight: 300, display: "flex", flexDirection: "column" }}>
    <CardContent>
      <Typography><SlotNameWithIcon slotKey={slotKey} /></Typography>
    </CardContent>
    <Divider />
    <Box sx={{
      flexGrow: 1,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}
    >
      <ArtifactSwapModal slotKey={slotKey} show={show} onClose={onClose} onChangeId={id => database.arts.set(id, { location: charKeyToLocCharKey(characterKey) })} />
      <Button onClick={onOpen} color="info" sx={{ borderRadius: "1em", }}>
        <SwapHoriz sx={{ height: 100, width: 100 }} />
      </Button>
    </Box>
  </CardLight>
}
function WeaponSwapButton({ weaponTypeKey }: { weaponTypeKey: WeaponTypeKey }) {
  const { t } = useTranslation("page_character")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState()
  return <>
    <Tooltip title={<Typography>{t`tabEquip.swapWeapon`}</Typography>} placement="top" arrow>
      <Button color="info" size="small" onClick={onOpen} ><SwapHoriz /></Button>
    </Tooltip>
    <WeaponSwapModal weaponTypeKey={weaponTypeKey} onChangeId={id => database.weapons.set(id, { location: charKeyToLocCharKey(characterKey) })} show={show} onClose={onClose} />
  </>
}
function LargeWeaponSwapButton({ weaponTypeKey }: { weaponTypeKey: WeaponTypeKey }) {
  const { t } = useTranslation("page_character")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState()
  return <>
    <Button color="info" onClick={onOpen} startIcon={<SwapHoriz />} >{t`tabEquip.swapWeapon`}</Button>
    <WeaponSwapModal weaponTypeKey={weaponTypeKey} onChangeId={id => database.weapons.set(id, { location: charKeyToLocCharKey(characterKey) })} show={show} onClose={onClose} />
  </>
}
function ArtifactSwapButton({ slotKey }: { slotKey: SlotKey }) {
  const { t } = useTranslation("page_character")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { database } = useContext(DatabaseContext)
  const [show, onOpen, onClose] = useBoolState()
  return <>
    <Tooltip title={<Typography>{t`tabEquip.swapArt`}</Typography>} placement="top" arrow>
      <Button color="info" size="small" onClick={onOpen} ><SwapHoriz /></Button>
    </Tooltip>
    <ArtifactSwapModal slotKey={slotKey} show={show} onClose={onClose} onChangeId={id => database.arts.set(id, { location: charKeyToLocCharKey(characterKey) })} />
  </>
}
function ArtifactSectionCard() {
  const { t } = useTranslation(["page_character", "artifact"])
  const { database } = useContext(DatabaseContext)
  const { character, character: { key: characterKey, equippedArtifacts } } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const hasEquipped = useMemo(() => !!Object.values(equippedArtifacts).filter(i => i).length, [equippedArtifacts])
  const unequipArts = useCallback(() => {
    if (!character) return
    if (!window.confirm("Do you want to move all currently equipped artifacts to inventory?")) return
    Object.values(equippedArtifacts).forEach(aid => database.arts.set(aid, { location: "" }))
  }, [character, database, equippedArtifacts])

  const setEffects = useMemo(() => artifactSheets && ArtifactSheet.setEffects(artifactSheets, data), [artifactSheets, data])
  const { rvFilter } = useCharMeta(characterKey)
  const setRVFilter = useCallback(rvFilter => database.charMeta.set(characterKey, { rvFilter }), [database, characterKey],)

  const [show, onShow, onHide] = useBoolState()
  const deferredrvFilter = useDeferredValue(rvFilter)
  const { rvField, rvmField } = useMemo(() => {
    const { currentEfficiency, currentEfficiency_, maxEfficiency, maxEfficiency_ } = Object.values(equippedArtifacts).reduce((a, artid) => {
      const art = database.arts.get(artid)
      if (art) {
        const { currentEfficiency, maxEfficiency } = Artifact.getArtifactEfficiency(art, new Set(deferredrvFilter))
        const { currentEfficiency: currentEfficiency_, maxEfficiency: maxEfficiency_ } = Artifact.getArtifactEfficiency(art, new Set(allSubstatKeys))
        a.currentEfficiency = a.currentEfficiency + currentEfficiency
        a.maxEfficiency = a.maxEfficiency + maxEfficiency

        a.currentEfficiency_ = a.currentEfficiency_ + currentEfficiency_
        a.maxEfficiency_ = a.maxEfficiency_ + maxEfficiency_
      }
      return a
    }, { currentEfficiency: 0, currentEfficiency_: 0, maxEfficiency: 0, maxEfficiency_: 0 })
    const rvField: IFieldDisplay = {
      text: t`artifact:editor.curSubEff`,
      value: !(currentEfficiency - currentEfficiency_) ? <PercentBadge value={currentEfficiency} max={4500} valid /> :
        <span><PercentBadge value={currentEfficiency} max={4500} valid /> / <PercentBadge value={currentEfficiency_} max={4500} valid /></span>
    }
    const rvmField: IFieldDisplay = {
      text: t`artifact:editor.maxSubEff`,
      canShow: () => !!(currentEfficiency_ - maxEfficiency_),
      value: !(maxEfficiency - maxEfficiency_) ? <PercentBadge value={maxEfficiency} max={4500} valid /> :
        <span><PercentBadge value={maxEfficiency} max={4500} valid /> / <PercentBadge value={maxEfficiency_} max={4500} valid /></span>
    }
    return { rvField, rvmField }
  }, [t, deferredrvFilter, equippedArtifacts, database])

  return <CardLight>
    {hasEquipped && <Button color="error" onClick={unequipArts} fullWidth sx={{ borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}>{t`tabEquip.unequipArts`}</Button>}
    <CardContent >
      <Stack spacing={1}>
        <CardDark >
          <Button fullWidth color="info" startIcon={<Settings />} sx={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} onClick={onShow}>RV Filter</Button>
          <ModalWrapper open={show} onClose={onHide}>
            <CardDark>
              <CardContent>
                <SubstatToggle selectedKeys={rvFilter} onChange={setRVFilter} />
              </CardContent>
            </CardDark>
          </ModalWrapper>
          <FieldDisplayList >
            <BasicFieldDisplay field={rvField} component={ListItem} />
            {rvmField?.canShow?.(data) && <BasicFieldDisplay field={rvmField} component={ListItem} />}
          </FieldDisplayList>
        </CardDark>
        {artifactSheets && setEffects && Object.entries(setEffects).flatMap(([setKey, setNumKeyArr]) =>
          setNumKeyArr.map(setNumKey => <CardDark key={setKey + setNumKey} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SetEffectDisplay key={setKey + setNumKey} setKey={setKey} setNumKey={setNumKey} />
          </CardDark>)
        )}
      </Stack>
    </CardContent>
  </CardLight>
}
