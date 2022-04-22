import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Calculate, Checkroom, DeleteForever, FactCheck, Groups } from '@mui/icons-material';
import { Box, Button, CardContent, Divider, Grid, IconButton, Skeleton, Typography } from '@mui/material';
import i18next from 'i18next';
import React, { Suspense, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ReactGA from 'react-ga';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BootstrapTooltip from '../Components/BootstrapTooltip';
import CardDark from '../Components/Card/CardDark';
import { CharacterSelectionModal } from '../Components/Character/CharacterSelectionModal';
import SortByButton from '../Components/SortByButton';
import ElementToggle from '../Components/ToggleButton/ElementToggle';
import WeaponToggle from '../Components/ToggleButton/WeaponToggle';
import CharacterSheet from '../Data/Characters/CharacterSheet';
import { DatabaseContext } from '../Database/Database';
import useCharSelectionCallback from '../ReactHooks/useCharSelectionCallback';
import useDBState from '../ReactHooks/useDBState';
import useForceUpdate from '../ReactHooks/useForceUpdate';
import usePromise from '../ReactHooks/usePromise';
import { CharacterKey, ElementKey, WeaponTypeKey } from '../Types/consts';
import { characterFilterConfigs, characterSortConfigs, characterSortKeys } from '../Util/CharacterSort';
import { filterFunction, sortFunction } from '../Util/SortByFilters';
import CharacterCard from './CharacterCard';

function initialState() {
  return {
    sortType: characterSortKeys[0],
    ascending: false,
    weaponType: "" as WeaponTypeKey | "",
    element: "" as ElementKey | "",
  }
}

export default function CharacterInventory(props) {
  const { t } = useTranslation("page_character")
  const { database } = useContext(DatabaseContext)
  const [state, stateDisplatch] = useDBState("CharacterDisplay", initialState)

  const [newCharacter, setnewCharacter] = useState(false)
  const [dbDirty, forceUpdate] = useForceUpdate()
  //set follow, should run only once
  useEffect(() => {
    ReactGA.pageview('/character')
    return database.followAnyChar(forceUpdate)
  }, [forceUpdate, database])

  const characterSheets = usePromise(CharacterSheet.getAll, [])

  const deleteCharacter = useCallback(async (cKey: CharacterKey) => {
    const chararcterSheet = await CharacterSheet.get(cKey)
    let name = chararcterSheet?.name
    //use translated string
    if (typeof name === "object")
      name = i18next.t(`char_${cKey}_gen:name`)

    if (!window.confirm(t("removeCharacter", { value: name }))) return
    database.removeChar(cKey)
  }, [database, t])

  const editCharacter = useCharSelectionCallback()

  const navigate = useNavigate()

  const { element, weaponType } = state
  const sortConfigs = useMemo(() => characterSheets && characterSortConfigs(database, characterSheets), [database, characterSheets])
  const filterConfigs = useMemo(() => characterSheets && characterFilterConfigs(database, characterSheets), [database, characterSheets])
  const charKeyList = useMemo(() => sortConfigs && filterConfigs && dbDirty &&
    database._getCharKeys()
      .filter(filterFunction({ element, weaponType, favorite: "yes" }, filterConfigs))
      .sort(sortFunction(state.sortType, state.ascending, sortConfigs))
      .concat(
        database._getCharKeys()
          .filter(filterFunction({ element, weaponType, favorite: "no" }, filterConfigs))
          .sort(sortFunction(state.sortType, state.ascending, sortConfigs))),
    [dbDirty, database, sortConfigs, state.sortType, state.ascending, element, filterConfigs, weaponType])
  return <Box my={1} display="flex" flexDirection="column" gap={1}>
    <CardDark sx={{ p: 2 }}>
      <Grid container spacing={1}>
        <Grid item>
          <WeaponToggle sx={{ height: "100%" }} onChange={weaponType => stateDisplatch({ weaponType })} value={state.weaponType} size="small" />
        </Grid>
        <Grid item flexGrow={1}>
          <ElementToggle sx={{ height: "100%" }} onChange={element => stateDisplatch({ element })} value={state.element} size="small" />
        </Grid>
        <Grid item >
          <SortByButton sx={{ height: "100%" }}
            sortKeys={characterSortKeys} value={state.sortType} onChange={sortType => stateDisplatch({ sortType })}
            ascending={state.ascending} onChangeAsc={ascending => stateDisplatch({ ascending })} />
        </Grid>
      </Grid>
    </CardDark>
    <Grid container spacing={1}>
      <Suspense fallback={<Grid item xs={12}><Skeleton variant="rectangular" sx={{ width: "100%", height: "100%", minHeight: 5000 }} /></Grid>}>
        <Grid item xs={12} sm={6} md={4} lg={3} >
          <CardDark sx={{ height: "100%", minHeight: 400, width: "100%", display: "flex", flexDirection: "column" }}>
            <CardContent>
              <Typography sx={{ textAlign: "center" }}><Trans t={t} i18nKey="addNew" /></Typography>
            </CardContent>
            <CharacterSelectionModal newFirst show={newCharacter} onHide={() => setnewCharacter(false)} onSelect={editCharacter} />
            <Box sx={{
              flexGrow: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
            >
              <Button onClick={() => setnewCharacter(true)} sx={{
                borderRadius: "1em"
              }}>
                <Typography variant="h1"><FontAwesomeIcon icon={faPlus} className="fa-fw" /></Typography>
              </Button>
            </Box>
          </CardDark>
        </Grid>
        {!!charKeyList && charKeyList.map(charKey =>
          <Grid item key={charKey} xs={12} sm={6} md={4} lg={3} >
            <CharacterCard
              characterKey={charKey}
              onClick={() => navigate(`${charKey}`)}
              footer={<><Divider /><Box sx={{ py: 1, px: 2, display: "flex", gap: 1, justifyContent: "space-between" }}>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.talent")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/talent`)}>
                    <FactCheck />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.equip")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/equip`)} >
                    <Checkroom />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.buffs")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/teambuff`)} >
                    <Groups />
                  </IconButton>
                </BootstrapTooltip>
                <BootstrapTooltip placement="top" title={<Typography>{t("tabs.build")}</Typography>}>
                  <IconButton onClick={() => navigate(`${charKey}/build`)} >
                    <Calculate />
                  </IconButton>
                </BootstrapTooltip>
                <Divider orientation="vertical" />
                <BootstrapTooltip placement="top" title={<Typography>{t("delete")}</Typography>}>
                  <IconButton color="error" onClick={() => deleteCharacter(charKey)}>
                    <DeleteForever />
                  </IconButton>
                </BootstrapTooltip>
              </Box></>}
            />
          </Grid>)}
      </Suspense>
    </Grid>
  </Box>
}
