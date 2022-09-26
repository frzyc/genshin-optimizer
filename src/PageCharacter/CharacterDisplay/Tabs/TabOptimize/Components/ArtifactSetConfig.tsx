import { faBan, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckBoxOutlineBlank, CheckBox, Replay, Settings } from '@mui/icons-material';
import { Box, Button, ButtonGroup, CardContent, Divider, Grid, Stack, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { CharacterContext } from '../../../../../Context/CharacterContext';
import SetEffectDisplay from '../../../../../Components/Artifact/SetEffectDisplay';
import { artifactSlotIcon } from '../../../../../Components/Artifact/SlotNameWIthIcon';
import CardDark from '../../../../../Components/Card/CardDark';
import CardLight from '../../../../../Components/Card/CardLight';
import CloseButton from '../../../../../Components/CloseButton';
import ColorText from '../../../../../Components/ColoredText';
import InfoTooltip from '../../../../../Components/InfoTooltip';
import ModalWrapper from '../../../../../Components/ModalWrapper';
import SqBadge from '../../../../../Components/SqBadge';
import { StarsDisplay } from '../../../../../Components/StarDisplay';
import { Translate } from '../../../../../Components/Translate';
import { ArtifactSheet } from '../../../../../Data/Artifacts/ArtifactSheet';
import { DatabaseContext } from '../../../../../Database/Database';
import { DataContext, dataContextObj } from '../../../../../Context/DataContext';
import { UIData } from '../../../../../Formula/uiData';
import { constant } from '../../../../../Formula/utils';
import useForceUpdate from '../../../../../ReactHooks/useForceUpdate';
import usePromise from '../../../../../ReactHooks/usePromise';
import { allArtifactSets, allSlotKeys, ArtifactSetKey, SetNum, SlotKey } from '../../../../../Types/consts';
import { deepClone, objectKeyMap } from '../../../../../Util/Util';
import useBuildSetting from '../useBuildSetting';

export default function ArtifactSetConfig({ disabled }: { disabled?: boolean, }) {
  const { t } = useTranslation(["page_character_optimize", "sheet"])
  const dataContext = useContext(DataContext)
  const { database } = useContext(DatabaseContext)
  const { character: { key: characterKey, conditional }, characterDispatch } = useContext(CharacterContext)
  const { buildSetting: { artSetExclusion }, buildSettingDispatch } = useBuildSetting(characterKey)
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => setOpen(true), [setOpen])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const artSetKeyList = useMemo(() => artifactSheets ? Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets)).reverse().flatMap(([, sets]) => sets).filter(key => !key.includes("Prayers")) : [], [artifactSheets])

  const [dbDirty, forceUpdate] = useForceUpdate()
  useEffect(() => database.arts.followAny(forceUpdate), [database, forceUpdate])

  const artSlotCount = useMemo(() => {
    const artSlotCount: Dict<ArtifactSetKey, Record<SlotKey, number>> = Object.fromEntries(artSetKeyList.map(k => [k, Object.fromEntries(allSlotKeys.map(sk => [sk, 0]))]))
    database.arts.values.map(art => artSlotCount[art.setKey] && artSlotCount[art.setKey]![art.slotKey]++)
    return dbDirty && artSlotCount
  }, [dbDirty, database, artSetKeyList])
  const allowRainbow2 = !artSetExclusion.rainbow?.includes(2)
  const allowRainbow4 = !artSetExclusion.rainbow?.includes(4)

  const { allow2, allow4, exclude2, exclude4 } = useMemo(() => ({
    allow2: artSetKeyList.filter(k => !artSetExclusion[k]?.includes(2)).length,
    allow4: artSetKeyList.filter(k => !artSetExclusion[k]?.includes(4)).length,
    exclude2: artSetKeyList.filter(k => artSetExclusion[k]?.includes(2)).length,
    exclude4: artSetKeyList.filter(k => artSetExclusion[k]?.includes(4)).length,
  }), [artSetKeyList, artSetExclusion])
  const artifactCondCount = useMemo(() =>
    (Object.keys(conditional)).filter(k =>
      allArtifactSets.includes(k as ArtifactSetKey) && Object.keys(conditional[k]).length !== 0).length
    , [conditional])
  const fakeDataContextObj = useMemo(() => ({
    ...dataContext,
    data: new UIData({ ...dataContext.data.data[0], artSet: objectKeyMap(allArtifactSets, _ => constant(4)) }, undefined)
  }), [dataContext])
  const resetArtConds = useCallback(() => {
    const tconditional = Object.fromEntries(Object.entries(conditional).filter(([k, v]) => !allArtifactSets.includes(k as any)))
    characterDispatch({ conditional: tconditional })
  }, [conditional, characterDispatch]);
  const setAllExclusion = useCallback(
    (setnum: number, exclude = true) => {
      const artSetExclusion_ = deepClone(artSetExclusion)
      artSetKeyList.forEach(k => {
        if (exclude) artSetExclusion_[k] = [...(artSetExclusion_[k] ?? []), setnum];
        else if (artSetExclusion_[k]) artSetExclusion_[k] = artSetExclusion_[k].filter(n => n !== setnum);
      })
      buildSettingDispatch({ artSetExclusion: artSetExclusion_ })
    },
    [artSetKeyList, artSetExclusion, buildSettingDispatch],
  )

  return <>
    <CardLight sx={{ display: "flex" }}>
      <CardContent sx={{ flexGrow: 1 }} >
        <Typography>
          <strong>{t`artSetConfig.title`}</strong>
        </Typography>
        <Stack spacing={1}>
          <Typography>{t`artSetConfig.setEffCond`} <SqBadge color={artifactCondCount ? "success" : "secondary"}>{artifactCondCount} {t<string>("artSetConfig.enabled")}</SqBadge></Typography>
          <Typography>{t`sheet:2set`} <SqBadge color="success">{allow2} <FontAwesomeIcon icon={faChartLine} className="fa-fw" /> {t<string>("artSetConfig.allowed")}</SqBadge>{!!exclude2 && " / "}{!!exclude2 && <SqBadge color="secondary">{exclude2} <FontAwesomeIcon icon={faBan} className="fa-fw" /> {t<string>("artSetConfig.excluded")}</SqBadge>}</Typography>
          <Typography>{t`sheet:4set`} <SqBadge color="success">{allow4} <FontAwesomeIcon icon={faChartLine} className="fa-fw" /> {t<string>("artSetConfig.allowed")}</SqBadge>{!!exclude4 && " / "}{!!exclude4 && <SqBadge color="secondary">{exclude4} <FontAwesomeIcon icon={faBan} className="fa-fw" /> {t<string>("artSetConfig.excluded")}</SqBadge>}</Typography>
          <Typography>{t`artSetConfig.2rainbow`} <SqBadge color={allowRainbow2 ? "success" : "secondary"}><FontAwesomeIcon icon={allowRainbow2 ? faChartLine : faBan} className="fa-fw" /> {allowRainbow2 ? t<string>("artSetConfig.allowed") : "Excluded"}</SqBadge></Typography>
          <Typography>{t`artSetConfig.4rainbow`} <SqBadge color={allowRainbow4 ? "success" : "secondary"}><FontAwesomeIcon icon={allowRainbow4 ? faChartLine : faBan} className="fa-fw" /> {allowRainbow4 ? t<string>("artSetConfig.allowed") : "Excluded"}</SqBadge></Typography>
        </Stack>

      </CardContent>
      <Button onClick={onOpen} disabled={disabled} color="info" sx={{ borderRadius: 0 }}>
        <Settings />
      </Button>
    </CardLight>
    {artifactSheets && <ModalWrapper open={open} onClose={onClose} ><CardDark>
      <CardContent sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
        <Typography variant="h6" >{t`artSetConfig.title`}</Typography>
        <CloseButton onClick={onClose} />
      </CardContent>
      <Divider />
      <CardContent >
        <CardLight sx={{ mb: 1 }}><CardContent>
          <Box display="flex" gap={1}>
            <Typography><strong>{t`artSetConfig.modal.setCond.title`}</strong></Typography>
            <Typography sx={{ flexGrow: 1 }}><SqBadge color={artifactCondCount ? "success" : "secondary"}>{artifactCondCount} {t<string>("artSetConfig.selected")}</SqBadge></Typography>
            <Button size='small' onClick={resetArtConds} color="error" startIcon={<Replay />}>{t`artSetConfig.modal.setCond.reset`}</Button>
          </Box>
          <Typography>{t`artSetConfig.modal.setCond.text`}</Typography>
        </CardContent></CardLight>
        <CardLight sx={{ mb: 1 }}><CardContent>
          <Typography sx={{ flexGrow: 1 }}><strong>
            <Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.title" >Artifact Sets <ColorText color='success'>Allowed<FontAwesomeIcon icon={faChartLine} className="fa-fw" /></ColorText> / <ColorText color='secondary' variant='light'>Excluded<FontAwesomeIcon icon={faBan} className="fa-fw" /></ColorText></Trans>
          </strong></Typography>
          <Typography><Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.intro">You can allow/exclude which sets you want the builder to consider. In the following examples, <strong>A</strong> is on-set, and <strong>R</strong> is rainbow(off-set)</Trans></Typography>
          <Typography><Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.2set"><strong><ColorText color='secondary' variant='light'>Excluding<FontAwesomeIcon icon={faBan} className="fa-fw" /> 2-Set</ColorText></strong> would exclude 2-Set builds: <strong><ColorText color='secondary' variant='light'>AA</ColorText>RRR</strong> and <strong><ColorText color='secondary' variant='light'>AAA</ColorText>RR</strong>.</Trans></Typography>
          <Typography><Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.4set"><strong><ColorText color='secondary' variant='light'>Excluding<FontAwesomeIcon icon={faBan} className="fa-fw" /> 4-Set</ColorText></strong> would exclude 4-Set builds: <strong><ColorText color='secondary' variant='light'>AAAA</ColorText>R</strong> and <strong><ColorText color='secondary' variant='light'>AAAAA</ColorText></strong>.</Trans></Typography>
          <Typography><Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.2rain"><strong><ColorText color='secondary' variant='light'>Excluding<FontAwesomeIcon icon={faBan} className="fa-fw" /> 3-Rainbow</ColorText></strong> would exclude 2-Set + 3-Rainbow builds: <strong>AA<ColorText color='secondary' variant='light'>RRR</ColorText></strong> and <strong>AAA<ColorText color='secondary' variant='light'>RR</ColorText></strong>.</Trans></Typography>
          <Typography><Trans t={t} i18nKey="artSetConfig.modal.ArtSetFilter.4rain"><strong><ColorText color='secondary' variant='light'>Excluding<FontAwesomeIcon icon={faBan} className="fa-fw" /> 5-Rainbow</ColorText></strong> would exclude full 5-Rainbow builds: <strong><ColorText color='secondary' variant='light'>RRRRR</ColorText></strong>.</Trans></Typography>
        </CardContent></CardLight>
        <Grid container columns={{ xs: 2, lg: 3 }} sx={{ mb: 1 }} spacing={1}>
          <Grid item xs={1}>
            <AllSetAllowExcludeCard setNum={2} numAllow={allow2} numExclude={exclude2} setAllExclusion={setAllExclusion} />
          </Grid>
          <Grid item xs={1}>
            <AllSetAllowExcludeCard setNum={4} numAllow={allow4} numExclude={exclude4} setAllExclusion={setAllExclusion} />
          </Grid>
          <Grid item xs={1}>
            <CardLight>
              <CardContent>
                <Typography gutterBottom><strong><Trans t={t} i18nKey="artSetConfig.alExRainbow"><ColorText color='success'>Allow <FontAwesomeIcon icon={faChartLine} className="fa-fw" /></ColorText> / <ColorText color='secondary' variant='light'>Exclude <FontAwesomeIcon icon={faBan} className="fa-fw" /></ColorText> Rainbow Builds</Trans></strong></Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Button fullWidth onClick={() => buildSettingDispatch({ type: "artSetExclusion", setKey: "rainbow", num: 2 })} color={allowRainbow2 ? "success" : "secondary"} startIcon={!allowRainbow2 ? <CheckBoxOutlineBlank /> : <CheckBox />} endIcon={<FontAwesomeIcon icon={allowRainbow2 ? faChartLine : faBan} className="fa-fw" />}>{t`artSetConfig.2rainbow`}</Button>
                  <Button fullWidth onClick={() => buildSettingDispatch({ type: "artSetExclusion", setKey: "rainbow", num: 4 })} color={allowRainbow4 ? "success" : "secondary"} startIcon={!allowRainbow4 ? <CheckBoxOutlineBlank /> : <CheckBox />} endIcon={<FontAwesomeIcon icon={allowRainbow4 ? faChartLine : faBan} className="fa-fw" />}>{t`artSetConfig.4rainbow`}</Button>
                </Box>
              </CardContent>
            </CardLight>
          </Grid>
        </Grid>
        <Grid container spacing={1} columns={{ xs: 2, lg: 3 }}>
          {artSetKeyList.map(setKey => {
            return <ArtifactSetCard key={setKey} setKey={setKey} sheet={artifactSheets(setKey)} fakeDataContextObj={fakeDataContextObj} slotCount={artSlotCount[setKey]!} />
          })}
        </Grid>
      </CardContent>
      <Divider />
      <CardContent sx={{ py: 1 }}>
        <CloseButton large onClick={onClose} />
      </CardContent>
    </CardDark></ModalWrapper >}
  </>
}
function AllSetAllowExcludeCard({ numAllow, numExclude, setNum, setAllExclusion }: { numAllow: number, numExclude: number, setNum: 2 | 4, setAllExclusion: (setNum: 2 | 4, exclude?: boolean) => void }) {
  const { t } = useTranslation(["page_character_optimize", "sheet"])
  return <CardLight>
    <CardContent>
      <Typography gutterBottom><strong>{t(`sheet:${setNum}set`)}</strong> <SqBadge color="success">{numAllow} <FontAwesomeIcon icon={faChartLine} className="fa-fw" /> {t<string>("artSetConfig.allowed")}</SqBadge>{!!numExclude && " / "}{!!numExclude && <SqBadge color="secondary">{numExclude} <FontAwesomeIcon icon={faBan} className="fa-fw" /> {t<string>("artSetConfig.excluded")}</SqBadge>}</Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button fullWidth disabled={!numExclude} onClick={() => setAllExclusion(setNum, false)} color='success' startIcon={<FontAwesomeIcon icon={faChartLine} className="fa-fw" />}>{t(`artSetConfig.allowAll${setNum}set`)}</Button>
        <Button fullWidth disabled={!numAllow} onClick={() => setAllExclusion(setNum, true)} color='secondary' startIcon={<FontAwesomeIcon icon={faBan} className="fa-fw" />}>{t(`artSetConfig.excludeAll${setNum}set`)}</Button>
      </Box>
    </CardContent>
  </CardLight>
}
function ArtifactSetCard({ sheet, setKey, fakeDataContextObj, slotCount }: { setKey: ArtifactSetKey, sheet: ArtifactSheet, fakeDataContextObj: dataContextObj, slotCount: Record<SlotKey, number> }) {
  const { t } = useTranslation("sheet")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { buildSetting, buildSettingDispatch } = useBuildSetting(characterKey)
  const setExclusionSet = buildSetting?.artSetExclusion?.[setKey] ?? []
  const allow4 = !setExclusionSet.includes(4)
  const slots = useMemo(() => Object.values(slotCount).reduce((tot, v) => tot + (v ? 1 : 0), 0), [slotCount])

  /* Assumes that all conditionals are from 4-Set. needs to change if there are 2-Set conditionals */
  const set4CondNums = useMemo(() => {
    if (!allow4 || slots < 4) return []
    return Object.keys(sheet.setEffects).filter(setNumKey => sheet.setEffects[setNumKey]?.document.some(doc => "states" in doc))
  }, [sheet.setEffects, allow4, slots])
  const exclude2 = setExclusionSet.includes(2)
  const exclude4 = setExclusionSet.includes(4)
  if (slots < 2) return null
  return <Grid item key={setKey} xs={1}>
    <CardLight sx={{ height: "100%" }}>
      <Box className={`grad-${sheet.rarity[0]}star`} width="100%" sx={{ display: "flex" }} >
        <Box component="img" src={sheet.defIconSrc} sx={{ height: 100, width: "auto", mx: -1 }} />
        <Box sx={{ flexGrow: 1, px: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="h6">{sheet.name ?? ""}</Typography>
          <Box display="flex" gap={1}>
            <Typography variant="subtitle1">{sheet.rarity.map((ns, i) => <span key={ns}>{ns} <StarsDisplay stars={1} /> {i < (sheet.rarity.length - 1) ? "/ " : null}</span>)}</Typography>
            {/* If there is ever a 2-Set conditional, we will need to change this */}
            <InfoTooltip title={<Box>
              <Typography><SqBadge color="success">{t`2set`}</SqBadge></Typography>
              <Typography><Translate ns={`artifact_${setKey}_gen`} key18={"setEffects.2"} /></Typography>
              <Box paddingTop={2} sx={{ opacity: setExclusionSet.includes(4) ? 0.6 : 1 }} >
                <Typography><SqBadge color="success">{t`4set`}</SqBadge></Typography>
                <Typography><Translate ns={`artifact_${setKey}_gen`} key18={"setEffects.4"} /></Typography>
              </Box>
            </Box>} />
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>{Object.entries(slotCount).map(([slotKey, count]) => <Typography key={slotKey} sx={{ flexGrow: 1 }} variant="subtitle2" ><SqBadge sx={{ width: "100%" }} color={count ? "primary" : "secondary"}>{artifactSlotIcon(slotKey)}{count}</SqBadge></Typography>)}</Box>
        </Box>
      </Box>
      <ButtonGroup sx={{ ".MuiButton-root": { borderRadius: 0 } }} fullWidth>
        {slots >= 2 && <Button startIcon={exclude2 ? <CheckBoxOutlineBlank /> : <CheckBox />} onClick={() => buildSettingDispatch({ type: "artSetExclusion", setKey, num: 2 })} color={exclude2 ? 'secondary' : 'success'} endIcon={<FontAwesomeIcon icon={exclude2 ? faBan : faChartLine} className="fa-fw" />}>{t`2set`}</Button>}
        {slots >= 4 && <Button startIcon={exclude4 ? <CheckBoxOutlineBlank /> : <CheckBox />} onClick={() => buildSettingDispatch({ type: "artSetExclusion", setKey, num: 4 })} color={exclude4 ? 'secondary' : 'success'} endIcon={<FontAwesomeIcon icon={exclude4 ? faBan : faChartLine} className="fa-fw" />}>{t`4set`}</Button>}
      </ButtonGroup>

      {!!set4CondNums.length && <DataContext.Provider value={fakeDataContextObj}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {set4CondNums.map(setNumKey =>
            <SetEffectDisplay key={setNumKey} setKey={setKey} setNumKey={parseInt(setNumKey) as SetNum} hideHeader conditionalsOnly />
          )}
        </CardContent>
      </DataContext.Provider>}
    </CardLight>
  </Grid >
}
