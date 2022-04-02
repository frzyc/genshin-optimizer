import { Button, Card, CardContent, CardHeader, Divider, Grid, Typography } from '@mui/material';
import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import ArtifactCard from '../../PageArtifact/ArtifactCard';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import SetEffectDisplay from '../../Components/Artifact/SetEffectDisplay';
import CardLight from '../../Components/Card/CardLight';
import ImgIcon from '../../Components/Image/ImgIcon';
import { DatabaseContext } from '../../Database/Database';
import { DataContext } from '../../DataContext';
import { uiInput as input } from '../../Formula';
import useForceUpdate from '../../ReactHooks/useForceUpdate';
import usePromise from '../../ReactHooks/usePromise';
import { allSlotKeys, SlotKey } from '../../Types/consts';
import { objectKeyMap } from '../../Util/Util';
import StatDisplayComponent from '../../Components/Character/StatDisplayComponent';
import { ArtifactDisplayLocationState } from '../../Types/LocationState';

function CharacterArtifactPane({ newBuild = false }: { newBuild?: boolean }) {
  const { data, character, mainStatAssumptionLevel } = useContext(DataContext)

  const { database } = useContext(DatabaseContext)
  const history = useHistory()
  const edit = useCallback(
    artid => history.push({
      pathname: "/artifact",
      state: {
        artToEditId: artid
      } as ArtifactDisplayLocationState
    } as any), [history])
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])

  // TODO: We can also listen only to equipped artifacts
  const [, updateArt] = useForceUpdate()
  useEffect(() => database.followAnyArt(updateArt))

  const equipArts = useCallback(() => {
    if (!window.confirm("Do you want to equip this artifact build to this character?")) return
    const newBuild = Object.fromEntries(allSlotKeys.map(s => [s, data.get(input.art[s].id).value])) as Record<SlotKey, string>
    database.equipArtifacts(character.key, newBuild)
  }, [character, data, database])

  const excludeArts = useCallback(() => {
    if (!window.confirm("Do you want to exclude these artifacts from future builds?")) return
    allSlotKeys.map(s => {
      let id = data.get(input.art[s].id).value
      typeof id === "string" && database.updateArt({ exclude: true }, id)
    })
  }, [data, database])

  const unequipArts = useCallback(() => {
    if (!character) return
    if (!window.confirm("Do you want to move all currently equipped artifacts to inventory?")) return
    database.equipArtifacts(character.key, objectKeyMap(allSlotKeys, _ => ""))
  }, [character, database])
  const artIds = allSlotKeys.map(slotKey => data.get(input.art[slotKey].id).value)
  const setEffects = useMemo(() => artifactSheets && ArtifactSheet.setEffects(artifactSheets, data), [artifactSheets, data])
  return <>
    <CardLight sx={{ mb: 1 }}>
      <CardContent>
        <StatDisplayComponent />
      </CardContent>
      <Divider />
      <CardContent sx={{ py: 1 }}>
        <Grid container spacing={1}>
          <Grid item>
            {newBuild ? <Button onClick={equipArts} className="mr-2">Equip artifacts</Button> : <Button color="error" onClick={unequipArts}>Unequip all artifacts</Button>}
            <Button onClick={excludeArts} sx={{ ml: 1 }}>Exclude all artifacts</Button>
          </Grid>
          <Grid item flexGrow={1}></Grid>
          <Grid item>{!!mainStatAssumptionLevel && <Card sx={{ p: 1, bgcolor: t => t.palette.warning.dark }}><Typography><strong>Assume Main Stats are Level {mainStatAssumptionLevel}</strong></Typography></Card>}</Grid>
        </Grid>
      </CardContent>
    </CardLight>
    <Grid container spacing={1}>
      <Grid item xs={12} sm={6} md={4} display="flex" flexDirection="column" gap={1}>
        {artifactSheets && setEffects && Object.entries(setEffects).map(([setKey, setNumKeyArr]) =>
          <CardLight key={setKey} sx={{ flexGrow: 1, }} >
            <CardHeader avatar={<ImgIcon size={2} sx={{ m: -1 }} src={artifactSheets[setKey].defIconSrc} />} title={artifactSheets[setKey].name} titleTypographyProps={{ variant: "subtitle1" }} />
            <Divider />
            <CardContent >
              <Grid container spacing={1} flexDirection="column" height="100%" >
                <Grid item display="flex" flexDirection="column" gap={2}>
                  {setNumKeyArr.map(setNumKey => <SetEffectDisplay key={setKey + setNumKey} setKey={setKey} setNumKey={setNumKey} />)}
                </Grid>
              </Grid>
            </CardContent>
          </CardLight>
        )}
      </Grid>
      {artIds.map(id => !!id && <Grid item xs={6} md={4} key={id} >
        <ArtifactCard artifactId={id} mainStatAssumptionLevel={mainStatAssumptionLevel} onEdit={edit} />
      </Grid>)}
    </Grid>
  </>
}
export default CharacterArtifactPane
