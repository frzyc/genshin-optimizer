import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Button, ButtonGroup, Popper, useMediaQuery, useTheme } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { Variant } from '../Formula/type';
import KeyMap, { StatKey } from '../KeyMap';
import StatIcon from '../KeyMap/StatIcon';
import { allMainStatKeys, allSubstatKeys, MainStatKey, SubstatKey } from '../Types/artifact';
import { objectKeyMap } from '../Util/Util';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from './CustomNumberInput';
import { GeneralAutocomplete } from './GeneralAutocomplete';

export default function StatEditorList({ statKeys, statFilters, setStatFilters, disabled = false, wrapperFunc = (ele) => ele }: {
  statKeys: StatKey[], statFilters: Dict<StatKey, number>, setStatFilters: (statFilters: Dict<StatKey, number>) => void, disabled?: boolean, wrapperFunc?: (ele: JSX.Element, key?: string) => JSX.Element
}) {
  const statOptionsMap = useMemo(() => objectKeyMap(statKeys, (statKey: StatKey): StatOption => ({
    key: statKey,
    label: ([...allMainStatKeys, ...allSubstatKeys] as string[]).includes(statKey) ? KeyMap.getArtStr(statKey as MainStatKey | SubstatKey) : (KeyMap.getStr(statKey) ?? "ERROR"),
    variant: KeyMap.getVariant(statKey)
  })), [statKeys])
  const remainingOptions = useMemo(() =>
    Object.values(statOptionsMap).filter(({ key }) =>
      !Object.keys(statFilters).some(k => k === key)
    ), [statOptionsMap, statFilters])

  const setKey = useCallback(
    (newk: StatKey, oldk: StatKey | null) => {
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
    // TODO: statKeyOptions order is kinda funky, but I don't want to recompute remainingOptions for each statKey...
      wrapperFunc(<StatFilterItem key={statKey} statKey={statKey} statKeyOptions={[statOptionsMap[statKey], ...remainingOptions]} disabled={disabled} value={min} setValue={setFilter} setKey={setKey} delKey={delKey} />, statKey)
    )}
    {wrapperFunc(<StatFilterItem key={Object.entries(statFilters).length} statKey={null} statKeyOptions={remainingOptions} setValue={setFilter} setKey={setKey} delKey={delKey} disabled={disabled} />)}
  </>
}

type StatOption = {
  key: StatKey
  label: string
  variant?: Variant
}
function StatFilterItem({ statKey, statKeyOptions = [], value = 0, delKey, setKey, setValue, disabled = false }: {
  statKey: StatKey | null,
  statKeyOptions: StatOption[],
  value?: number,
  delKey: (delKey: StatKey) => void,
  setKey: (newKey: StatKey, oldKey: StatKey | null) => void,
  setValue: (statKey: StatKey, value: number) => void,
  disabled?: boolean
}) {
  const theme = useTheme()
  const isThreeCol = useMediaQuery(theme.breakpoints.up('lg'))
  const isOneCol = useMediaQuery(theme.breakpoints.down('md'))
  const isFloat = statKey ? KeyMap.unit(statKeyOptions[statKey]?.key) === "%" : false
  const onValueChange = useCallback((value?: number) => statKey && setValue(statKey, value ?? 0), [setValue, statKey])
  const onKeyChange = useCallback((newKey: StatKey | null) => {
    if (newKey) {
      setKey(newKey, statKey)
    } else if (statKey) {
      delKey(statKey)
    }
  },
    [statKey, setKey, delKey])
  const onDeleteKey = useCallback(() => statKey && delKey(statKey), [delKey, statKey])
  const buttonStyle = { p: 1, flexBasis: 30, flexGrow: 0, flexShrink: 0 }
  return <ButtonGroup sx={{ width: "100%" }}>
    <GeneralAutocomplete
      size="small"
      options={statKeyOptions}
      onChange={onKeyChange}
      valueKey={statKey}
      toImg={(sKey: StatKey) => <StatIcon statKey={sKey} iconProps={{ color: KeyMap.getVariant(sKey) }} />}
      ListboxProps={{ style: { display: "grid", gridTemplateColumns: isOneCol ? "100%" : (isThreeCol ? "33% 33% 33%" : "50% 50%") } }}
      // This needs to be done with `style` prop, not `sx` prop, or it doesn't work
      PopperComponent={(props) => <Popper {...props} style={{ width: "60%" }} />}
      sx={{ flexGrow: 1, flexBasis: 150 }}
      textFieldProps={{ sx: { "& .MuiInputBase-root": { borderRadius: "4px 0 0 4px" } } }}
    />
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1, borderRadius: "0 4px 4px 0" }}>
      <CustomNumberInput
        disabled={!statKey || disabled}
        float={isFloat}
        value={value}
        placeholder="Stat Value"
        onChange={onValueChange}
        sx={{ px: 1, }}
        inputProps={{ sx: { textAlign: "right" } }}
        endAdornment={statKey ? KeyMap.unit(statKey) : undefined}
      />
    </CustomNumberInputButtonGroupWrapper>
    {!!statKey && <Button sx={buttonStyle}color="error" onClick={onDeleteKey} disabled={disabled}><DeleteForeverIcon fontSize="small" /></Button>}
  </ButtonGroup>
}
