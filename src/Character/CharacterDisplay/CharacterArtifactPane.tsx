import { Button, Card, CardContent, CardHeader, Divider, Grid, ToggleButton, Typography } from '@mui/material';
import { useCallback, useContext, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import ArtifactCard from '../../Artifact/ArtifactCard';
import { ArtifactSheet } from '../../Artifact/ArtifactSheet_WR';
import SetEffectDisplay from '../../Artifact/Component/SetEffectDisplay';
import CardLight from '../../Components/Card/CardLight';
import ImgIcon from '../../Components/Image/ImgIcon';
import SolidToggleButtonGroup from '../../Components/SolidToggleButtonGroup';
import { database as localDatabase, DatabaseContext } from '../../Database/Database';
import { DataContext } from '../../DataContext';
import { input } from '../../Formula';
import useForceUpdate from '../../ReactHooks/useForceUpdate';
import usePromise from '../../ReactHooks/usePromise';
import { allSlotKeys, ArtifactSetKey, SlotKey } from '../../Types/consts';
import { objectFromKeyMap } from '../../Util/Util';
import StatDisplayComponent from './StatDisplayComponent';

function CharacterArtifactPane() {
  const { data, oldData, character, mainStatAssumptionLevel, characterDispatch } = useContext(DataContext)
  const compareData = !!oldData

  const database = useContext(DatabaseContext)
  const history = useHistory()
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
    if (!oldData) return
    const newBuild = Object.fromEntries(allSlotKeys.map(s => [s, data.get(input.art[s].id).value])) as Record<SlotKey, string>
    database.equipArtifacts(character.key, newBuild)
  }, [character, data, oldData, database])

  const unequipArts = useCallback(() => {
    if (!character) return
    if (!window.confirm("Do you want to move all currently equipped artifacts to inventory?")) return
    database.equipArtifacts(character.key, objectFromKeyMap(allSlotKeys, () => ""))
  }, [character, database])
  const artIds = allSlotKeys.map(slotKey => data.get(input.art[slotKey].id).value)
  const artSetNums = Object.entries(input.artSet).map(([key, value]) => [key, data.get(value).value]) as [ArtifactSetKey, number][]
  return <>
    <CardLight sx={{ mb: 1 }}>
      <CardContent>
        <StatDisplayComponent />
      </CardContent>
      <Divider />
      <CardContent sx={{ py: 1 }}>
        <Grid container spacing={1}>
          <Grid item>
            {!!oldData ? <Button onClick={equipArts} className="mr-2">Equip artifacts</Button> : (database === localDatabase && <Button color="error" onClick={unequipArts}>Unequip all artifacts</Button>)}
          </Grid>
          <Grid item>
            {/* Compare against new build toggle */}
            {!!oldData && <SolidToggleButtonGroup exclusive value={compareData} onChange={(e, v) => characterDispatch({ compareData: v })} size="small">
              <ToggleButton value={false} disabled={!compareData}>
                <small>Show New artifact Stats</small>
              </ToggleButton>
              <ToggleButton value={true} disabled={compareData}>
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
      <Grid item xs={12} sm={6} md={4} display="flex" flexDirection="column" gap={1}>
        {artifactSheets && ArtifactSheet.setEffects(artifactSheets, artSetNums).map(([setKey, setNumKeyArr]) =>
          <CardLight key={setKey} sx={{ flexGrow: 1, }} >
            <CardHeader avatar={<ImgIcon size={2} sx={{ m: -1 }} src={artifactSheets[setKey].defIconSrc} />} title={artifactSheets[setKey].name} titleTypographyProps={{ variant: "subtitle1" }} />
            <Divider />
            <CardContent >
              <Grid container spacing={1} flexDirection="column" height="100%" >
                <Grid item display="flex" flexDirection="column" gap={1}>
                  {setNumKeyArr.map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} setKey={setKey} setNumKey={setNumKey} />)}
                </Grid>
              </Grid>
            </CardContent>
          </CardLight>
        )}
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
