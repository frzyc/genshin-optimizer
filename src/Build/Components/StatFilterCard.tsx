import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, CardContent, Divider, Grid, MenuItem, Typography } from '@mui/material';
import React, { useCallback } from 'react';
import CardLight from '../../Components/Card/CardLight';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from '../../Components/CustomNumberInput';
import DropdownButton from '../../Components/DropdownMenu/DropdownButton';
import Stat from '../../Stat';
import { StatKey } from '../../Types/artifact';
export default function StatFilterCard({ statKeys = [], statFilters = {}, setStatFilters, disabled }: { statKeys: StatKey[], statFilters: Dict<StatKey, number>, setStatFilters: (object) => void, disabled?: boolean }) {
  const remainingKeys = statKeys.filter(key => !(Object.keys(statFilters) as any).some(k => k === key))
  const setFilter = (sKey, min) => setStatFilters({ ...statFilters, [sKey]: min })
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

function StatFilterItem({ statKey, statKeys = [], value, close, setFilter, disabled = false }: {
  statKey?: string, statKeys: string[], value?: number, close?: () => void, setFilter: (statKey: string, value?: number) => void, disabled?: boolean
}) {
  const isFloat = Stat.getStatUnit(statKey) === "%"
  const onChange = useCallback(s => statKey && setFilter(statKey, s), [setFilter, statKey])
  return <ButtonGroup sx={{ width: "100%" }}>
    <DropdownButton
      title={Stat.getStatNameWithPercent(statKey, "New Stat")}
      disabled={disabled}
    >
      {statKeys.map(sKey => <MenuItem key={sKey} onClick={() => { close?.(); setFilter(sKey, value) }}>{Stat.getStatNameWithPercent(sKey)}</MenuItem>)}
    </DropdownButton>
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
      <CustomNumberInput
        disabled={!statKey}
        float={isFloat}
        value={value}
        placeholder="Min Value"
        onChange={onChange}
        sx={{
          px: 2,
        }}
      />
    </CustomNumberInputButtonGroupWrapper>
    {!!close && <Button color="error" onClick={close} disabled={disabled}><FontAwesomeIcon icon={faTrashAlt} /></Button>}
  </ButtonGroup>
}