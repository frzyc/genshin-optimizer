import { Button, Card, CardContent, Divider, Grid, ToggleButton, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import ArtifactCard from '../../Artifact/ArtifactCard';
import { ArtifactSheet } from '../../Artifact/ArtifactSheet';
import SetEffectDisplay from '../../Artifact/Component/SetEffectDisplay';
import { buildContext } from '../../Build/Build';
import CardLight from '../../Components/Card/CardLight';
import SolidToggleButtonGroup from '../../Components/SolidToggleButtonGroup';
import { database as localDatabase, DatabaseContext } from '../../Database/Database';
import useForceUpdate from '../../ReactHooks/useForceUpdate';
import usePromise from '../../ReactHooks/usePromise';
import { Sheets } from '../../ReactHooks/useSheets';
import { ICachedCharacter } from '../../Types/character';
import { allSlotKeys } from '../../Types/consts';
import { objectFromKeyMap } from '../../Util/Util';
import Character from "../Character";
import StatDisplayComponent from './StatDisplayComponent';

type CharacterArtifactPaneProps = {
  sheets: Sheets
  character: ICachedCharacter,
}
function CharacterArtifactPane({ sheets, character, character: { key: characterKey } }: CharacterArtifactPaneProps) {
  const { newBuild, equippedBuild, compareBuild, setCompareBuild } = useContext(buildContext)
  const database = useContext(DatabaseContext)
  const history = useHistory()
  //choose which one to display stats for
  const stats = (newBuild ? newBuild : equippedBuild)
  const mainStatAssumptionLevel = stats?.mainStatAssumptionLevel ?? 0
  const statKeys = useMemo(() => stats && sheets && Character.getDisplayStatKeys(stats, sheets), [stats, sheets])
  const edit = useCallback(
    artid => history.push({
      pathname: "/artifact",
      artToEditId: artid
    } as any), [history])
  const artifactSheets = usePromise(ArtifactSheet.getAll(), [])

  // TODO: We can also listen only to equipped artifacts
  const [, updateArt] = useForceUpdate()
  useEffect(() => database.followAnyArt(updateArt))

  const equipArts = useCallback(() => {
    if (!window.confirm("Do you want to equip this artifact build to this character?")) return
    if (!newBuild) return
    newBuild.equippedArtifacts && database.equipArtifacts(characterKey, newBuild.equippedArtifacts)
  }, [characterKey, newBuild, database])

  const unequipArts = useCallback(() => {
    if (!window.confirm("Do you want to move all the artifacts equipped to inventory?")) return
    database.equipArtifacts(characterKey, objectFromKeyMap(allSlotKeys, () => ""))
  }, [characterKey, database])
  if (!stats) return null
  return <>
    <CardLight sx={{ mb: 1 }}>
      <CardContent>
        <StatDisplayComponent {...{ sheets, character, equippedBuild: (newBuild && !compareBuild) ? undefined : equippedBuild, newBuild, statsDisplayKeys: statKeys }} />
      </CardContent>
      <Divider />
      <CardContent sx={{ py: 1 }}>
        <Grid container spacing={1}>
          <Grid item>
            {newBuild ? <Button onClick={equipArts} className="mr-2">Equip artifacts</Button> : (database === localDatabase && <Button color="error" onClick={unequipArts}>Unequip all artifacts</Button>)}
          </Grid>
          <Grid item>
            {/* Compare against new build toggle */}
            {!!newBuild && <SolidToggleButtonGroup exclusive value={compareBuild} onChange={(e, v) => setCompareBuild?.(v)} size="small">
              <ToggleButton value={false} >
                <small>Show New artifact Stats</small>
              </ToggleButton>
              <ToggleButton value={true} >
                <small>Compare against equipped artifacts</small>
              </ToggleButton>
            </SolidToggleButtonGroup>}
          </Grid>
          <Grid item flexGrow={1}></Grid>
          <Grid item>{!!mainStatAssumptionLevel && <Card sx={{ p: 1, bgcolor: t => t.palette.warning.dark }}><Typography><strong>Assume Main Stats are Level {mainStatAssumptionLevel}</strong></Typography></Card>}</Grid>
        </Grid>
      </CardContent>
    </CardLight>
    <Grid container spacing={1}>
      <Grid item xs={12} sm={6} md={4} >
        <CardLight sx={{ height: "100%" }} ><CardContent sx={{ height: "100%" }}><Grid container spacing={1} flexDirection="column" height="100%" >
          {artifactSheets && Object.entries(ArtifactSheet.setEffects(artifactSheets, stats.setToSlots)).map(([setKey, setNumKeyArr]) =>
            <Grid item key={setKey} display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">{artifactSheets?.[setKey].name ?? ""}</Typography>
              {setNumKeyArr.map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild, newBuild }} />)}
            </Grid>
          )}
        </Grid></CardContent></CardLight>
      </Grid>
      {allSlotKeys.map(slotKey =>
        !!stats?.equippedArtifacts?.[slotKey] && <Grid item xs={6} md={4} key={stats?.equippedArtifacts?.[slotKey]} >
          <ArtifactCard artifactId={stats?.equippedArtifacts?.[slotKey]} mainStatAssumptionLevel={mainStatAssumptionLevel} onEdit={() => edit(stats?.equippedArtifacts?.[slotKey])} />
        </Grid>
      )}
    </Grid>
  </>
}
export default CharacterArtifactPane
