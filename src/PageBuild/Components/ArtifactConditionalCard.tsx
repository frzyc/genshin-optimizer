import { Replay } from '@mui/icons-material';
import { Box, Button, CardContent, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import SetEffectDisplay from '../../Components/Artifact/SetEffectDisplay';
import CardDark from '../../Components/Card/CardDark';
import CardLight from '../../Components/Card/CardLight';
import CloseButton from '../../Components/CloseButton';
import ModalWrapper from '../../Components/ModalWrapper';
import SqBadge from '../../Components/SqBadge';
import { Stars } from '../../Components/StarDisplay';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import { DataContext } from '../../DataContext';
import usePromise from '../../ReactHooks/usePromise';
import { allArtifactSets, SetNum } from '../../Types/consts';

export default function ArtifactConditionalCard({ disabled }: { disabled?: boolean }) {
  const { character } = useContext(DataContext)
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => setOpen(true), [setOpen])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  console.log(character.conditional)
  const artifactCondCount = useMemo(() =>
    (Object.keys(character.conditional) as any).filter(k =>
      allArtifactSets.includes(k) && Object.keys(character.conditional[k]).length !== 0).length
    , [character])
  return <CardLight><CardContent>
    <Button fullWidth onClick={onOpen} disabled={disabled}>
      <span>Default Artifact Set Effects Conditionals {!!artifactCondCount && <SqBadge color="success">{artifactCondCount} Selected</SqBadge>}</span>
    </Button>
    <ArtConditionalModal open={open} onClose={onClose} artifactCondCount={artifactCondCount} />
  </CardContent></CardLight>
}

function ArtConditionalModal({ open, onClose, artifactCondCount }: {
  open: boolean, onClose: () => void, artifactCondCount: number
}) {
  const { character, characterDispatch } = useContext(DataContext)
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
          <Button onClick={resetArtConds} startIcon={<Replay />}>Reset All</Button>
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
          const sheet = artifactSheets[setKey]
          // Don't display if no conditional in artifact
          if (!Object.values(sheet.setEffects).some(entry => entry.document && entry.document.some(d => d.conditional))) return null
          return <Grid item key={setKey} xs={6} lg={4}>
            <CardLight sx={{ height: "100%" }}>
              <Box className={`grad-${sheet.rarity[0]}star`} width="100%" sx={{ display: "flex" }} >
                <Box component="img" src={sheet.defIconSrc} sx={{ height: 100, width: "auto" }} />
                <Box sx={{ flexGrow: 1, px: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="h6">{artifactSheets?.[setKey].name ?? ""}</Typography>
                  <Typography variant="subtitle1">{sheet.rarity.map((ns, i) => <span key={ns}>{ns}<Stars stars={1} /> {i < (sheet.rarity.length - 1) ? "/ " : null}</span>)}</Typography>
                </Box>
              </Box>
              <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {Object.keys(sheet.setEffects).map(setNumKey => <SetEffectDisplay key={setNumKey} setKey={setKey} setNumKey={parseInt(setNumKey) as SetNum} />)}
              </CardContent>
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
