import { Replay } from '@mui/icons-material';
import { Box, Button, CardContent, Divider, Grid, Typography } from '@mui/material';
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
import { allArtifactSets, SetNum } from '../../../../../Types/consts';
import { objectKeyMap } from '../../../../../Util/Util';

export default function ArtifactSetConditional({ disabled }: { disabled?: boolean }) {
  const { character } = useContext(DataContext)
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => setOpen(true), [setOpen])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  const artifactCondCount = useMemo(() =>
    (Object.keys(character.conditional) as any).filter(k =>
      allArtifactSets.includes(k) && Object.keys(character.conditional[k]).length !== 0).length
    , [character])
  return <>
    <Button fullWidth onClick={onOpen} disabled={disabled} color="info">
      <span>Default Artifact Set Effects Conditionals {!!artifactCondCount && <SqBadge color="success">{artifactCondCount} Selected</SqBadge>}</span>
    </Button>
    <ArtConditionalModal open={open} onClose={onClose} artifactCondCount={artifactCondCount} />
  </>
}

function ArtConditionalModal({ open, onClose, artifactCondCount }: {
  open: boolean, onClose: () => void, artifactCondCount: number
}) {
  const dataContext = useContext(DataContext)
  const { character, characterDispatch } = dataContext
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const resetArtConds = useCallback(() => {
    const conditional = Object.fromEntries(Object.entries(character.conditional).filter(([k, v]) => !allArtifactSets.includes(k as any)))
    characterDispatch({ conditional })
  }, [character, characterDispatch]);

  if (!artifactSheets) return null
  const artSetKeyList = Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets)).reverse().flatMap(([, sets]) => sets)
  return <ModalWrapper open={open} onClose={onClose} ><CardDark>
    <CardContent>
      <Grid container spacing={1}>
        <Grid item flexGrow={1}>
          <Typography variant="h6">Default Artifact Set Effects {!!artifactCondCount && <SqBadge color="success">{artifactCondCount} Selected</SqBadge>}</Typography>
        </Grid>
        <Grid item>
          <Button onClick={resetArtConds} color="error" startIcon={<Replay />}>Reset All</Button>
        </Grid>
        <Grid item>
          <CloseButton onClick={onClose} />
        </Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardContent>
      <CardLight sx={{ mb: 1 }}>
        <CardContent>
          <Typography>Some artifacts provide conditional stats. This windows allows you to select those stats, so they can take effect during build calculation, when artifact sets are not specified.</Typography>
        </CardContent>
      </CardLight>
      <Grid container spacing={1}>
        {artSetKeyList.map(setKey => {
          const sheet: ArtifactSheet = artifactSheets[setKey]
          // Don't display if no conditional in artifact
          if (!Object.values(sheet.setEffects).some(entry => entry.document && entry.document.some(d => "states" in d))) return null
          return <Grid item key={setKey} xs={6} lg={4}>
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
              <DataContext.Provider value={fakeData(dataContext) /* TODO: Do we need to Memo this? */}>
                <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {Object.keys(sheet.setEffects)
                    .filter(setNumKey => sheet.setEffects[setNumKey]?.document
                      .some(doc => "states" in doc)
                    )
                    .map(setNumKey =>
                      <SetEffectDisplay key={setNumKey} setKey={setKey} setNumKey={parseInt(setNumKey) as SetNum} hideHeader conditionalsOnly />
                    )
                  }
                </CardContent>
              </DataContext.Provider>
            </CardLight>
          </Grid>
        })}
      </Grid>
    </CardContent>
    <Divider />
    <CardContent sx={{ py: 1 }}>
      <CloseButton large onClick={onClose} />
    </CardContent>
  </CardDark></ModalWrapper>
}

function fakeData(currentContext: dataContextObj): dataContextObj {
  return {
    ...currentContext,
    data: new UIData({ ...currentContext.data.data[0], artSet: objectKeyMap(allArtifactSets, _ => constant(4)) }, undefined)
  }
}
