import { Button, Card, CardContent, Divider, Grid, ToggleButton, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import ArtifactCard from '../../Artifact/ArtifactCard';
import { ArtifactSheet } from '../../Artifact/ArtifactSheet_WR';
import SetEffectDisplay from '../../Artifact/Component/SetEffectDisplay';
import { buildContext } from '../../Build/Build';
import CardLight from '../../Components/Card/CardLight';
import SolidToggleButtonGroup from '../../Components/SolidToggleButtonGroup';
import { database as localDatabase, DatabaseContext } from '../../Database/Database';
import { DataContext } from '../../DataContext';
import { input } from '../../Formula/index';
import useForceUpdate from '../../ReactHooks/useForceUpdate';
import usePromise from '../../ReactHooks/usePromise';
import { allSlotKeys, SlotKey } from '../../Types/consts';
import { objectFromKeyMap } from '../../Util/Util';
import StatDisplayComponent from './StatDisplayComponent';

function CharacterArtifactPane() {
  const { data, oldData, character } = useContext(DataContext)

  const { newBuild, equippedBuild, compareBuild, setCompareBuild } = useContext(buildContext)
  const database = useContext(DatabaseContext)
  const history = useHistory()
  //choose which one to display stats for
  const mainStatAssumptionLevel = 0// TODO: stats?.mainStatAssumptionLevel ?? 0
  const edit = useCallback(
    artid => history.push({
      pathname: "/artifact",
      artToEditId: artid
    } as any), [history])
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])

  // TODO: We can also listen only to equipped artifacts
  const [, updateArt] = useForceUpdate()
  useEffect(() => database.followAnyArt(updateArt))

  const equipArts = useCallback(() => {
    if (!window.confirm("Do you want to equip this artifact build to this character?")) return
    if (!data || !oldData || !character) return
    const newBuild = Object.fromEntries(allSlotKeys.map(s => [s, data.getStr(input.art[s].id).value])) as Record<SlotKey, string>
    database.equipArtifacts(character.key, newBuild)
  }, [character, data, oldData, database])

  const unequipArts = useCallback(() => {
    if (!character) return
    if (!window.confirm("Do you want to move all currently equipped artifacts to inventory?")) return
    database.equipArtifacts(character.key, objectFromKeyMap(allSlotKeys, () => ""))
  }, [character, database])
  if (!data) return null
  const artIds = allSlotKeys.map(slotKey => data.getStr(input.art[slotKey].id).value)
  return <>
    <CardLight sx={{ mb: 1 }}>
      <CardContent>
        <StatDisplayComponent />
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
              <ToggleButton value={false} disabled={!compareBuild}>
                <small>Show New artifact Stats</small>
              </ToggleButton>
              <ToggleButton value={true} disabled={compareBuild}>
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
          {/* {artifactSheets && Object.entries(ArtifactSheet.setEffects(artifactSheets, stats.setToSlots)).map(([setKey, setNumKeyArr]) =>
            <Grid item key={setKey} display="flex" flexDirection="column" gap={1}>
              <Typography variant="subtitle1">{artifactSheets?.[setKey].name ?? ""}</Typography>
              {setNumKeyArr.map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} {...{ setKey, setNumKey, equippedBuild, newBuild }} />)}
            </Grid>
          )} */}
        </Grid></CardContent></CardLight>
      </Grid>
      {artIds.map((id, i) =>
        !!id && <Grid item xs={6} md={4} key={i} >
          <ArtifactCard artifactId={id} mainStatAssumptionLevel={mainStatAssumptionLevel} onEdit={() => edit(id)} />
        </Grid>
      )}
    </Grid>
  </>
}
export default CharacterArtifactPane
