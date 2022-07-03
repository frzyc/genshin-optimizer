import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, CardContent, MenuItem, Typography } from '@mui/material';
import { Box } from '@mui/system';
import React, { useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CharacterContext } from '../CharacterContext';
import { DataContext } from '../DataContext';
import { uiInput as input } from '../Formula';
import KeyMap, { StatColoredWithUnit, StatKey } from '../KeyMap';
import useBuildSetting from '../PageCharacter/CharacterDisplay/Tabs/TabOptimize/useBuildSetting';
import { ElementKey } from '../Types/consts';
import CardLight from './Card/CardLight';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from './CustomNumberInput';
import DropdownButton from './DropdownMenu/DropdownButton';
import InfoTooltip from './InfoTooltip';
export default function StatFilterCard({ disabled = false }: { disabled?: boolean }) {
  const { t } = useTranslation("page_character")
  const { character: { key: characterKey } } = useContext(CharacterContext)
  const { data } = useContext(DataContext)
  const { buildSetting: { statFilters }, buildSettingDispatch } = useBuildSetting(characterKey)
  const setStatFilters = useCallback((statFilters: Dict<StatKey, number>) => buildSettingDispatch({ statFilters }), [buildSettingDispatch],)

  const statKeys = useMemo(() => {
    const statKeys: StatKey[] = ["atk", "hp", "def", "eleMas", "critRate_", "critDMG_", "heal_", "enerRech_"]
    if (data.get(input.weaponType).value !== "catalyst") statKeys.push("physical_dmg_")
    const charEle = data.get(input.charEle).value as ElementKey
    statKeys.push(`${charEle}_dmg_`)
    return statKeys
  }, [data])

  const remainingKeys = useMemo(() => statKeys.filter(key => !(Object.keys(statFilters) as any).some(k => k === key)), [statKeys, statFilters])
  const setFilter = useCallback((sKey, min) => setStatFilters({ ...statFilters, [sKey]: min }), [statFilters, setStatFilters],)
  return <Box>
    <CardLight>
      <CardContent sx={{ display: "flex", gap: 1, justifyContent: "space-between" }}>
        <Typography>{t`tabOptimize.constraintFilter.title`}</Typography>
        <InfoTooltip title={<Typography>{t`tabOptimize.constraintFilter.tooltip`}</Typography>} />
      </CardContent>
    </CardLight>
    <Box display="flex" flexDirection="column" gap={0.5}>
      {Object.entries(statFilters).map(([statKey, min]) => {
        return <StatFilterItem key={statKey} statKey={statKey} statKeys={remainingKeys} setFilter={setFilter} disabled={disabled} value={min} close={() => {
          delete statFilters[statKey]
          setStatFilters({ ...statFilters })
        }} />
      })}
      <StatFilterItem statKeys={remainingKeys} setFilter={setFilter} disabled={disabled} />
    </Box>
  </Box>
}

export function StatFilterItem({ statKey, statKeys = [], value = 0, close, setFilter, disabled = false }: {
  statKey?: StatKey, statKeys: StatKey[], value?: number, close?: () => void, setFilter: (statKey: string, value?: number) => void, disabled?: boolean
}) {
  const isFloat = KeyMap.unit(statKey) === "%"
  const onChange = useCallback(s => statKey && setFilter(statKey, s), [setFilter, statKey])
  return <ButtonGroup sx={{ width: "100%" }}>
    <DropdownButton
      title={statKey ? <StatColoredWithUnit statKey={statKey} /> : "New Stat"}
      disabled={disabled}
      color={statKey ? "success" : "secondary"}
    >
      {statKeys.map(sKey => <MenuItem key={sKey} onClick={() => { close?.(); setFilter(sKey, value) }}><StatColoredWithUnit statKey={sKey} /></MenuItem>)}
    </DropdownButton>
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
      <CustomNumberInput
        disabled={!statKey || disabled}
        float={isFloat}
        value={value}
        placeholder="Stat Value"
        onChange={onChange}
        sx={{ px: 2, }}
        inputProps={{ sx: { textAlign: "right" } }}
        endAdornment={KeyMap.unit(statKey)}
      />
    </CustomNumberInputButtonGroupWrapper>
    {!!close && <Button color="error" onClick={close} disabled={disabled}><FontAwesomeIcon icon={faTrashAlt} /></Button>}
  </ButtonGroup>
}
