import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, CardContent, Divider, Grid, MenuItem, Typography } from '@mui/material';
import React, { useCallback, useContext } from 'react';
import CardLight from './Card/CardLight';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from './CustomNumberInput';
import DropdownButton from './DropdownMenu/DropdownButton';
import { DataContext } from '../DataContext';
import { uiInput as input } from '../Formula';
import KeyMap, { StatKey } from '../KeyMap';
import { ElementKey } from '../Types/consts';
export default function StatFilterCard({ statFilters = {}, setStatFilters, disabled = false }:
  { statFilters: Dict<StatKey, number>, setStatFilters: (object: Dict<StatKey, number>) => void, disabled?: boolean }) {
  const { data } = useContext(DataContext)
  const statKeys: StatKey[] = ["atk", "hp", "def", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_"]
  if (data.get(input.weaponType).value !== "catalyst") statKeys.push("physical_dmg_")
  const charEle = data.get(input.charEle).value as ElementKey
  statKeys.push(`${charEle}_dmg_`)

  const remainingKeys = statKeys.filter(key => !(Object.keys(statFilters) as any).some(k => k === key))
  const setFilter = useCallback((sKey, min) => setStatFilters({ ...statFilters, [sKey]: min }), [statFilters, setStatFilters],)
  return <CardLight>
    <CardContent sx={{ py: 1 }}>
      <Typography>Minimum Final Stat Filter</Typography>
    </CardContent>
    <Divider />
    <CardContent>
      <Grid container spacing={1}>
        {Object.entries(statFilters).map(([statKey, min]) => {
          return <Grid item xs={12} key={statKey} ><StatFilterItem statKey={statKey} statKeys={remainingKeys} setFilter={setFilter} disabled={disabled} value={min} close={() => {
            delete statFilters[statKey]
            setStatFilters({ ...statFilters })
          }} /></Grid>
        })}
        <Grid item xs={12}>
          <StatFilterItem value={undefined} close={undefined} statKeys={remainingKeys} setFilter={setFilter} disabled={disabled} />
        </Grid>
      </Grid>
    </CardContent>
  </CardLight>
}

export function StatFilterItem({ statKey, statKeys = [], value = 0, close, setFilter, disabled = false }: {
  statKey?: string, statKeys: string[], value?: number, close?: () => void, setFilter: (statKey: string, value?: number) => void, disabled?: boolean
}) {
  const isFloat = KeyMap.unit(statKey) === "%"
  const onChange = useCallback(s => statKey && setFilter(statKey, s), [setFilter, statKey])
  return <ButtonGroup sx={{ width: "100%" }}>
    <DropdownButton
      title={statKey ? KeyMap.get(statKey) : "New Stat"}
      disabled={disabled}
    >
      {statKeys.map(sKey => <MenuItem key={sKey} onClick={() => { close?.(); setFilter(sKey, value) }}>{KeyMap.get(sKey)}</MenuItem>)}
    </DropdownButton>
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
      <CustomNumberInput
        disabled={!statKey}
        float={isFloat}
        value={value}
        placeholder="Min Value"
        onChange={onChange}
        sx={{ px: 2 }}
      />
    </CustomNumberInputButtonGroupWrapper>
    {!!close && <Button color="error" onClick={close} disabled={disabled}><FontAwesomeIcon icon={faTrashAlt} /></Button>}
  </ButtonGroup>
}
