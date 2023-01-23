import { DeleteForever } from '@mui/icons-material';
import { Autocomplete, Button, ButtonGroup, ListItemIcon, ListItemText, MenuItem, Popper, Skeleton, TextField, useMediaQuery, useTheme } from '@mui/material';
import { Suspense, useCallback, useMemo } from 'react';
import { Variant } from '../Formula/type';
import KeyMap, { StatKey } from '../KeyMap';
import { allMainStatKeys, allSubstatKeys, MainStatKey, SubstatKey } from '../Types/artifact';
import { objectKeyMap } from '../Util/Util';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from './CustomNumberInput';
import StatIcon from './StatIcon';


export default function StatEditorList({ statKeys, statFilters, setStatFilters, disabled = false, wrapperFunc = (ele) => ele }: {
  statKeys: StatKey[], statFilters: Dict<StatKey, number>, setStatFilters: (statFilters: Dict<StatKey, number>) => void, disabled?: boolean, wrapperFunc?: (ele: JSX.Element, key?: string) => JSX.Element
}) {
  const statOptionsMap = useMemo(() => objectKeyMap(statKeys, (statKey: StatKey): StatOption => ({
    key: statKey,
    label: ([...allMainStatKeys, ...allSubstatKeys] as string[]).includes(statKey) ? KeyMap.getArtStr(statKey as MainStatKey | SubstatKey) : (KeyMap.getStr(statKey) ?? "ERROR"),
    icon: StatIcon[statKey],
    variant: KeyMap.getVariant(statKey)
  })), [statKeys])
  const remainingOptions = useMemo(() =>
    Object.values(statOptionsMap).filter(({ key }) =>
      !Object.keys(statFilters).some(k => k === key)
    ), [statOptionsMap, statFilters])

  const setKey = useCallback(
    (newk: StatKey, oldk?: StatKey) => {
      if (oldk)
        setStatFilters(Object.fromEntries(Object.entries(statFilters).map(([k, v]) => [k === oldk ? newk : k, v])))
      else {
        const statFilters_ = { ...statFilters }
        statFilters_[newk] = 0
        setStatFilters({ ...statFilters_ })
      }
    }, [statFilters, setStatFilters])

  const setFilter = useCallback((sKey: StatKey, min: number) => {
    const statFilters_ = { ...statFilters }
    statFilters_[sKey] = min
    setStatFilters({ ...statFilters_ })
  }, [statFilters, setStatFilters])

  const delKey = useCallback((statKey: StatKey) => {
    const statFilters_ = { ...statFilters }
    delete statFilters_[statKey]
    setStatFilters({ ...statFilters_ })
  }, [statFilters, setStatFilters])

  return <>
    {Object.entries(statFilters).map(([statKey, min]) =>
    // TODO: statKeyOptions order is kinda funky, but I don't want to recompute remainingOptions for each statKey...
      wrapperFunc(<StatFilterItem key={statKey} statKeyOption={statOptionsMap[statKey]} statKeyOptions={[statOptionsMap[statKey], ...remainingOptions]} disabled={disabled} value={min} setValue={setFilter} setKey={setKey} delKey={delKey} />, statKey)
    )}
    {wrapperFunc(<StatFilterItem key={Object.entries(statFilters).length} statKeyOptions={remainingOptions} setValue={setFilter} setKey={setKey} delKey={delKey} disabled={disabled} />)}
  </>
}

type StatOption = {
  key: StatKey
  label: string
  variant?: Variant
  icon?: Displayable
}
function StatFilterItem({ statKeyOption, statKeyOptions = [], value = 0, delKey, setKey, setValue, disabled = false }: {
  statKeyOption?: StatOption,
  statKeyOptions: StatOption[],
  value?: number,
  delKey: (delKey: StatKey) => void,
  setKey: (newKey: StatKey, oldKey?: StatKey) => void,
  setValue: (statKey: StatKey, value: number) => void,
  disabled?: boolean
}) {
  const theme = useTheme()
  const isThreeCol = useMediaQuery(theme.breakpoints.up('lg'))
  const isOneCol = useMediaQuery(theme.breakpoints.down('md'))
  const isFloat = KeyMap.unit(statKeyOption?.key) === "%"
  const onValueChange = useCallback((value?: number) => statKeyOption && setValue(statKeyOption.key, value ?? 0), [setValue, statKeyOption])
  const onKeyChange = useCallback((_event, newValue: StatOption | null, _reason) => {
    if (newValue) {
      setKey(newValue.key, statKeyOption?.key)
    } else if (statKeyOption) {
      delKey(statKeyOption.key)
    }
  },
    [statKeyOption, setKey, delKey])
  const onDeleteKey = useCallback(() => statKeyOption && delKey(statKeyOption.key), [delKey, statKeyOption])
  const buttonStyle = { p: 1, flexBasis: 30, flexGrow: 0, flexShrink: 0 }
  return <ButtonGroup sx={{ width: "100%" }}>
    {/* TODO: Add enable/disable for bonus stats */}
    {/* <Button
      sx={buttonStyle}
      // color={setting.disabled ? "secondary" : "success"}
      // onClick={() => setDisabled(path, index, !setting.disabled)}
      disabled={disabled}
    >
      {true ? <CheckBoxOutlineBlank /> : <CheckBox />}
    </Button> */}
    <Autocomplete
      autoHighlight
      options={statKeyOptions}
      onChange={onKeyChange}
      value={statKeyOption}
      isOptionEqualToValue={(option, value) => option.key === value.key}
      renderInput={(params) => <TextField
        {...params}
        placeholder={"TODO: TRANSLATE!! New Stat"}
        hasValue={!!statKeyOption}
        startAdornment={statKeyOption?.icon}
      />}
      renderOption={(props, option) => <MenuItem value={option.key} {...props}>
          <ListItemIcon sx={{ color: option.variant && theme.palette[option.variant].main }}>{option.icon}</ListItemIcon>
          <ListItemText sx={{ color: option.variant && theme.palette[option.variant].main }}>
            <Suspense fallback={<Skeleton variant="text" width={100} />}>
              {option.key === statKeyOption?.key ? <strong>{option.label}</strong> : option.label}
            </Suspense>
          </ListItemText>
        </MenuItem>
      }
      ListboxProps={{ style: { display: "grid", gridTemplateColumns: isOneCol ? "100%" : (isThreeCol ? "33% 33% 33%" : "50% 50%") } }}
      // This needs to be done with `style` prop, not `sx` prop, or it doesn't work
      PopperComponent={(props) => <Popper {...props} style={{ width: "60%" }} />}
      sx={{ flexGrow: 1, flexBasis: 150 }}
    />
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1 }}>
      <CustomNumberInput
        disabled={!statKeyOption || disabled}
        float={isFloat}
        value={value}
        onChange={onValueChange}
        sx={{ px: 1, }}
        inputProps={{ sx: { textAlign: "right" } }}
        endAdornment={KeyMap.unit(statKeyOption?.key)}
      />
    </CustomNumberInputButtonGroupWrapper>
    {!!statKeyOption && <Button sx={buttonStyle}color="error" onClick={onDeleteKey} disabled={disabled}><DeleteForever fontSize="small" /></Button>}
  </ButtonGroup>
}
