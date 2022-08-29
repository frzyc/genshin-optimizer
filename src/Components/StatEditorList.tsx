import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, ButtonGroup, MenuItem } from '@mui/material';
import { useCallback, useMemo } from 'react';
import KeyMap, { StatKey } from '../KeyMap';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from './CustomNumberInput';
import DropdownButton from './DropdownMenu/DropdownButton';
import { StatColoredWithUnit, StatWithUnit } from './StatDisplay';


export default function StatEditorList({ statKeys, statFilters, setStatFilters, disabled = false, wrapperFunc = (ele) => ele }: {
  statKeys: StatKey[], statFilters: Dict<StatKey, number>, setStatFilters: (statFilters: Dict<StatKey, number>) => void, disabled?: boolean, wrapperFunc?: (ele: JSX.Element) => JSX.Element
}) {
  const remainingKeys = useMemo(() => statKeys.filter(key => !(Object.keys(statFilters) as any).some(k => k === key)), [statKeys, statFilters])
  const setKey = useCallback(
    (newk, oldk) => {
      if (oldk)
        setStatFilters(Object.fromEntries(Object.entries(statFilters).map(([k, v]) => [k === oldk ? newk : k, v])))
      else {
        const statFilters_ = { ...statFilters }
        statFilters_[newk] = 0
        setStatFilters({ ...statFilters_ })
      }
    }, [statFilters, setStatFilters])

  const setFilter = useCallback((sKey, min) => {
    const statFilters_ = { ...statFilters }
    statFilters_[sKey] = min
    setStatFilters({ ...statFilters_ })
  }, [statFilters, setStatFilters])

  const delKey = useCallback(statKey => {
    const statFilters_ = { ...statFilters }
    delete statFilters_[statKey]
    setStatFilters({ ...statFilters_ })
  }, [statFilters, setStatFilters])

  return <>
    {Object.entries(statFilters).map(([statKey, min]) =>
      wrapperFunc(<StatFilterItem key={statKey} statKey={statKey} statKeys={remainingKeys} disabled={disabled} value={min} setValue={setFilter} setKey={setKey} delKey={delKey} />)
    )}
    {wrapperFunc(<StatFilterItem statKeys={remainingKeys} setValue={setFilter} setKey={setKey} delKey={delKey} disabled={disabled} />)}
  </>
}

function StatFilterItem({ statKey, statKeys = [], value = 0, delKey, setKey, setValue, disabled = false }: {
  statKey?: StatKey,
  statKeys: StatKey[],
  value?: number,
  delKey: (delKey: StatKey) => void,
  setKey: (newKey: StatKey, oldKey?: StatKey) => void,
  setValue: (statKey: string, value: number) => void,
  disabled?: boolean
}) {
  const isFloat = KeyMap.unit(statKey) === "%"
  const onChange = useCallback(s => statKey && setValue(statKey, s), [setValue, statKey])
  return <ButtonGroup sx={{ width: "100%" }}>
    <DropdownButton
      title={statKey ? <StatWithUnit statKey={statKey} /> : "New Stat"}
      disabled={disabled}
      color={statKey ? (KeyMap.getVariant(statKey) ?? "success") : "secondary"}
    >
      {statKeys.map(sKey => <MenuItem key={sKey} onClick={() => setKey(sKey, statKey)}><StatColoredWithUnit statKey={sKey} /></MenuItem>)}
    </DropdownButton>
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
      <CustomNumberInput
        disabled={!statKey || disabled}
        float={isFloat}
        value={value}
        placeholder="Stat Value"
        onChange={onChange}
        sx={{ px: 1, }}
        inputProps={{ sx: { textAlign: "right" } }}
        endAdornment={KeyMap.unit(statKey)}
      />
    </CustomNumberInputButtonGroupWrapper>
    {!!statKey && <Button color="error" onClick={() => delKey(statKey)} disabled={disabled}><FontAwesomeIcon icon={faTrashAlt} /></Button>}
  </ButtonGroup>
}
