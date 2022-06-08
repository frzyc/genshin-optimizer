import { faBan, faChartLine } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Replay, Settings } from '@mui/icons-material';
import { Box, Button, ButtonGroup, CardContent, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import SetEffectDisplay from '../../../../../Components/Artifact/SetEffectDisplay';
import CardDark from '../../../../../Components/Card/CardDark';
import CardLight from '../../../../../Components/Card/CardLight';
import CloseButton from '../../../../../Components/CloseButton';
import InfoTooltip from '../../../../../Components/InfoTooltip';
import ModalWrapper from '../../../../../Components/ModalWrapper';
import SqBadge from '../../../../../Components/SqBadge';
import { Stars } from '../../../../../Components/StarDisplay';
import { Translate } from '../../../../../Components/Translate';
import { ArtifactSheet } from '../../../../../Data/Artifacts/ArtifactSheet';
import { DataContext, dataContextObj } from '../../../../../DataContext';
import { UIData } from '../../../../../Formula/uiData';
import { constant } from '../../../../../Formula/utils';
import usePromise from '../../../../../ReactHooks/usePromise';
import { allArtifactSets, ArtifactSetKey, SetNum } from '../../../../../Types/consts';
import { objectKeyMap } from '../../../../../Util/Util';
import useBuildSetting from '../BuildSetting';

export default function ArtifactSetConfig({ disabled }: { disabled?: boolean, }) {
  const dataContext = useContext(DataContext)
  const { character: { key: characterKey, conditional }, characterDispatch } = dataContext
  const { buildSetting: { artSetExclusion }, buildSettingDispatch } = useBuildSetting(characterKey)
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => setOpen(true), [setOpen])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const artSetKeyList = useMemo(() => artifactSheets ? Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets)).reverse().flatMap(([, sets]) => sets).filter(key => !key.includes("Prayers")) : [], [artifactSheets])

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
  const fakeDataContextObj = useMemo(() => fakeData(dataContext), [dataContext])
  const resetArtConds = useCallback(() => {
    const tconditional = Object.fromEntries(Object.entries(conditional).filter(([k, v]) => !allArtifactSets.includes(k as any)))
    characterDispatch({ conditional: tconditional })
  }, [conditional, characterDispatch]);
  const resetSetFilter = useCallback(() => buildSettingDispatch({ artSetExclusion: {} }), [buildSettingDispatch],)
  const setAllExclusion = useCallback(
    (setnum, exclude = true) => {
      const artSetExclusion_ = { ...artSetExclusion }
      artSetKeyList.forEach(k => {
        if (exclude) {
          if (!artSetExclusion_[k]) artSetExclusion_[k] = [setnum]
          else artSetExclusion_[k].push(setnum)
        } else {
          if (artSetExclusion_[k]) artSetExclusion_[k] = artSetExclusion_[k].filter(n => n !== setnum)
        }
      })
      buildSettingDispatch({ artSetExclusion: artSetExclusion_ })
    },
    [artSetKeyList, artSetExclusion, buildSettingDispatch],
  )

  return <>
    <CardLight sx={{ display: "flex" }}>
      <CardContent sx={{ flexGrow: 1 }} >
        <Typography><strong>Artifact Set Config</strong></Typography>
        <Typography>Set Effects Conditionals {!!artifactCondCount && <SqBadge color="success">{artifactCondCount} Enabled</SqBadge>}</Typography>
        <Typography>2-set <SqBadge color="success">{allow2} <FontAwesomeIcon icon={faChartLine} className="fa-fw" /> Allowed</SqBadge>{!!exclude2 && " / "}{!!exclude2 && <SqBadge color="error">{exclude2} <FontAwesomeIcon icon={faBan} className="fa-fw" /> Excluded</SqBadge>}</Typography>
        <Typography>4-set <SqBadge color="success">{allow4} <FontAwesomeIcon icon={faChartLine} className="fa-fw" /> Allowed</SqBadge>{!!exclude4 && " / "}{!!exclude4 && <SqBadge color="error">{exclude4} <FontAwesomeIcon icon={faBan} className="fa-fw" /> Excluded</SqBadge>}</Typography>
      </CardContent>
      <Button onClick={onOpen} disabled={disabled} color="info" sx={{ borderRadius: 0 }}>
        <Settings />
      </Button>
    </CardLight>
    {artifactSheets && <ModalWrapper open={open} onClose={onClose} ><CardDark>
      <CardContent sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
        <Typography variant="h6" >Artifact Set Config</Typography>
        <CloseButton onClick={onClose} />
      </CardContent>
      <Divider />
      <CardContent >
        <CardLight sx={{ mb: 1 }}><CardContent>
          <Box display="flex" gap={1}>
            <Typography ><strong>Default Artifact Set Conditional Effects</strong></Typography>
            <Typography sx={{ flexGrow: 1 }}>{!!artifactCondCount && <SqBadge color="success">{artifactCondCount} Selected</SqBadge>}</Typography>
            <Button size='small' onClick={resetArtConds} color="error" startIcon={<Replay />}>Reset Conditionals</Button>
          </Box>
          <Typography>Some artifacts provide conditional stats. This windows allows you to select those stats, so they can take effect during build calculation, when artifact sets are not specified.</Typography>
        </CardContent></CardLight>
        <CardLight sx={{ mb: 1 }}><CardContent>
          <Box display="flex" gap={1}>
            <Typography sx={{ flexGrow: 1 }}><strong>Artifact Set Allowed/Excluded</strong></Typography>
            <Button size='small' onClick={resetSetFilter} color="error" startIcon={<Replay />}>Reset Set Filter</Button>
          </Box>
          <Typography>There are a lot of flexibility for how you can define the set constraints of your final builds. You can allow/exclude specific 2/4 sets for generated builds.</Typography>

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
                <Typography gutterBottom><strong>Allow/Exclude Rainbow Builds</strong></Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button fullWidth onClick={() => buildSettingDispatch({ type: "artSetExclusion", setKey: "rainbow", num: 2 })} color={allowRainbow2 ? "success" : "error"} startIcon={<FontAwesomeIcon icon={allowRainbow2 ? faChartLine : faBan} className="fa-fw" />}>2/3-Rainbow</Button>
                  <Button fullWidth onClick={() => buildSettingDispatch({ type: "artSetExclusion", setKey: "rainbow", num: 4 })} color={allowRainbow4 ? "success" : "error"} startIcon={<FontAwesomeIcon icon={allowRainbow4 ? faChartLine : faBan} className="fa-fw" />}>5-Rainbow</Button>
                </Box>
              </CardContent>
            </CardLight>
          </Grid>
        </Grid>

        <Grid container spacing={1} columns={{ xs: 2, lg: 3 }}>
          {artSetKeyList.map(setKey => {
            return <ArtifactSetCard key={setKey} setKey={setKey} sheet={artifactSheets[setKey]} fakeDataContextObj={fakeDataContextObj} />
          })}
        </Grid>
      </CardContent>
      <Divider />
      <CardContent sx={{ py: 1 }}>
        <CloseButton large onClick={onClose} />
      </CardContent>
    </CardDark></ModalWrapper>}
  </>
}
function AllSetAllowExcludeCard({ numAllow, numExclude, setNum, setAllExclusion }) {
  return <CardLight>
    <CardContent>
      <Typography gutterBottom><strong>{setNum}-set</strong> <SqBadge color="success">{numAllow} <FontAwesomeIcon icon={faChartLine} className="fa-fw" /> Allowed</SqBadge>{!!numExclude && " / "}{!!numExclude && <SqBadge color="error">{numExclude} <FontAwesomeIcon icon={faBan} className="fa-fw" /> Excluded</SqBadge>}</Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button fullWidth disabled={!numExclude} onClick={() => setAllExclusion(setNum, false)} color='success' startIcon={<FontAwesomeIcon icon={faChartLine} className="fa-fw" />}>All {setNum}-set</Button>
        <Button fullWidth disabled={!numAllow} onClick={() => setAllExclusion(setNum, true)} color='error' startIcon={<FontAwesomeIcon icon={faBan} className="fa-fw" />}>All {setNum}-set</Button>
      </Box>
    </CardContent>
  </CardLight>
}
function ArtifactSetCard({ sheet, setKey, fakeDataContextObj }: { setKey: ArtifactSetKey, sheet: ArtifactSheet, fakeDataContextObj: dataContextObj }) {
  const { character: { key: characterKey } } = useContext(DataContext)
  const { buildSetting, buildSettingDispatch } = useBuildSetting(characterKey)
  const setExclusionSet = buildSetting?.artSetExclusion?.[setKey] ?? []
  const allow4 = !setExclusionSet.includes(4)

  /* Assumes that all conditionals are from 4-set. needs to change if there are 2-set conditionals */
  const set4CondNums = useMemo(() => {
    if (!allow4) return []
    return Object.keys(sheet.setEffects).filter(setNumKey => sheet.setEffects[setNumKey]?.document.some(doc => "states" in doc))
  }, [sheet.setEffects, allow4])

  return <Grid item key={setKey} xs={1}>
    <CardLight sx={{ height: "100%" }}>
      <Box className={`grad-${sheet.rarity[0]}star`} width="100%" sx={{ display: "flex" }} >
        <Box component="img" src={sheet.defIconSrc} sx={{ height: 100, width: "auto" }} />
        <Box sx={{ flexGrow: 1, px: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Typography variant="h6">{sheet.name ?? ""}</Typography>
          <Box display="flex" gap={1}>
            <Typography variant="subtitle1">{sheet.rarity.map((ns, i) => <span key={ns}>{ns} <Stars stars={1} /> {i < (sheet.rarity.length - 1) ? "/ " : null}</span>)}</Typography>
            {/* If there is ever a 2-set conditional, we will need to change this */}
            <InfoTooltip title={<Typography><Translate ns={`artifact_${setKey}_gen`} key18={"setEffects.4"} /></Typography>} />
          </Box>
        </Box>
      </Box>
      <ButtonGroup sx={{ ".MuiButton-root": { borderRadius: 0 } }} fullWidth>
        <SetButton setNum={2} excluded={setExclusionSet.includes(2)} onClick={() => buildSettingDispatch({ type: "artSetExclusion", setKey, num: 2 })} />
        <SetButton setNum={4} excluded={setExclusionSet.includes(4)} onClick={() => buildSettingDispatch({ type: "artSetExclusion", setKey, num: 4 })} />
      </ButtonGroup>

      {!!set4CondNums.length && <DataContext.Provider value={fakeDataContextObj}>
        <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {set4CondNums.map(setNumKey =>
            <SetEffectDisplay key={setNumKey} setKey={setKey} setNumKey={parseInt(setNumKey) as SetNum} hideHeader conditionalsOnly />
          )}
        </CardContent>
      </DataContext.Provider>}
    </CardLight>
  </Grid>
}
function SetButton({ setNum, excluded, onClick }: { setNum: number, excluded: boolean, onClick: () => void }) {
  return <Button onClick={onClick} color={excluded ? 'error' : 'success'} startIcon={<FontAwesomeIcon icon={excluded ? faBan : faChartLine} className="fa-fw" />}>{setNum}-set</Button>
}
function fakeData(currentContext: dataContextObj): dataContextObj {
  return {
    ...currentContext,
    data: new UIData({ ...currentContext.data.data[0], artSet: objectKeyMap(allArtifactSets, _ => constant(4)) }, undefined)
  }
}
