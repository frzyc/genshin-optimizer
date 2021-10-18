import { Replay } from '@mui/icons-material';
import { Box, Button, CardContent, Divider, Grid, Typography } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';
import { ArtifactSheet } from '../../Artifact/ArtifactSheet';
import SetEffectDisplay from '../../Artifact/Component/SetEffectDisplay';
import CardDark from '../../Components/Card/CardDark';
import CardLight from '../../Components/Card/CardLight';
import CloseButton from '../../Components/CloseButton';
import ModalWrapper from '../../Components/ModalWrapper';
import SqBadge from '../../Components/SqBadge';
import { Stars } from '../../Components/StarDisplay';
import useCharacterReducer from '../../ReactHooks/useCharacterReducer';
import usePromise from '../../ReactHooks/usePromise';
import { SetNum } from '../../Types/consts';
import { ICalculatedStats } from '../../Types/stats';
import { crawlObject } from '../../Util/Util';

export default function ArtifactConditionalCard({ disabled, initialStats }: { disabled?: boolean, initialStats: ICalculatedStats }) {
  const [open, setOpen] = useState(false)
  const onOpen = useCallback(() => setOpen(true), [setOpen])
  const onClose = useCallback(() => setOpen(false), [setOpen])
  const artifactCondCount = useMemo(() => {
    let count = 0;
    crawlObject(initialStats?.conditionalValues?.artifact, [], v => Array.isArray(v), () => count++)
    return count
  }, [initialStats])
  return <CardLight><CardContent>
    <Button fullWidth onClick={onOpen} disabled={disabled}>
      <span>Default Artifact Set Effects {!!artifactCondCount && <SqBadge color="success">{artifactCondCount} Selected</SqBadge>}</span>
    </Button>
    {!!initialStats && <ArtConditionalModal open={open} onClose={onClose} initialStats={initialStats} artifactCondCount={artifactCondCount} />}
  </CardContent></CardLight>
}

function ArtConditionalModal({ open, onClose, initialStats, artifactCondCount }: {
  open: boolean, onClose: () => void, initialStats: ICalculatedStats, artifactCondCount: number
}) {
  const { characterKey } = initialStats
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])
  const characterDispatch = useCharacterReducer(characterKey)
  if (!artifactSheets) return null
  const artSetKeyList = Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets)).reverse().flatMap(([, sets]) => sets)
  return <ModalWrapper open={open} onClose={onClose} ><CardDark>
    <CardContent>
      <Grid container spacing={1}>
        <Grid item flexGrow={1}>
          <Typography variant="h6">Default Artifact Set Effects {!!artifactCondCount && <SqBadge color="success">{artifactCondCount} Selected</SqBadge>}</Typography>
        </Grid>
        <Grid item>
          <Button onClick={() => {
            if (initialStats.conditionalValues.artifact) initialStats.conditionalValues.artifact = {}
            characterDispatch({ conditionalValues: initialStats.conditionalValues })
          }} startIcon={<Replay />}>Reset All</Button>
        </Grid>
        <Grid item>
          <CloseButton onClick={onClose} />
        </Grid>
      </Grid>
    </CardContent>
    <Divider />
    <CardContent>
      <Grid container spacing={1}>
        {artSetKeyList.map(setKey => {
          const sheet = artifactSheets[setKey]
          let icon = Object.values(sheet.slotIcons)[0]
          const rarities = sheet.rarity
          const rarity = rarities[0]
          return <Grid item key={setKey} xs={6} lg={4}>
            <CardLight sx={{ height: "100%" }}>
              <Box className={`grad-${rarity}star`} width="100%" sx={{ display: "flex" }} >
                <Box component="img" src={icon} sx={{ height: 100, width: "auto" }} />
                <Box sx={{ flexGrow: 1, px: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="h6">{artifactSheets?.[setKey].name ?? ""}</Typography>
                  <Typography variant="subtitle1">{rarities.map((ns, i) => <span key={ns}>{ns}<Stars stars={1} /> {i < (rarities.length - 1) ? "/ " : null}</span>)}</Typography>
                </Box>
              </Box>
              <CardContent>
                {!!setKey && Object.keys(sheet.setEffects).map(key => parseInt(key) as SetNum).map(setNumKey =>
                  <SetEffectDisplay newBuild={undefined} key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild: initialStats, editable: true, characterKey }} />)}
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
