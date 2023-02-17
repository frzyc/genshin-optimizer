import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { Button, ButtonGroup, Popper, useMediaQuery, useTheme } from '@mui/material';
import { Key, useCallback, useMemo } from 'react';
import { Variant } from '../Formula/type';
import KeyMap from '../KeyMap';
import StatIcon from '../KeyMap/StatIcon';
import { allMainStatKeys, allSubstatKeys, MainStatKey, SubstatKey } from '../Types/artifact';
import { DisablableValue, StatSettings } from '../Types/character';
import CustomNumberInput, { CustomNumberInputButtonGroupWrapper } from './CustomNumberInput';
import { GeneralAutocomplete } from './GeneralAutocomplete';

type StatEditorListProps<T extends string> = {
  statKeys: T[]
  statSettings: StatSettings<T>
  setStatSettings: (statFilters: StatSettings<T>) => void
  disabled?: boolean
  wrapperFunc?: (ele: JSX.Element, key?: Key) => JSX.Element
}
export default function StatEditorList<T extends string>({ statKeys, statSettings, setStatSettings, disabled = false, wrapperFunc = (ele) => ele }: StatEditorListProps<T>) {
  const statOptions = useMemo(() => statKeys.map((statKey: T): StatOption<T> => ({
    key: statKey,
    label: ([...allMainStatKeys, ...allSubstatKeys] as string[]).includes(statKey)
      ? KeyMap.getArtStr(statKey as MainStatKey | SubstatKey)
      : (KeyMap.getStr(statKey) ?? "ERROR"),
    variant: KeyMap.getVariant(statKey)
  })), [statKeys])

  const setKey = useCallback((statKey: T, oldStatKey?: T, oldIndex?: number) => {
    const statSettings_: StatSettings<T> = { ...statSettings }
    const oldStatSetting = oldStatKey ? [...(statSettings_[oldStatKey] ?? [])] : undefined
    const newStatSetting = [...(statSettings_[statKey] ?? [])]
    // Copy/create new setting
    if (oldIndex !== undefined && oldStatSetting) newStatSetting.push(oldStatSetting[oldIndex])
    else newStatSetting.push({ value: 0, disabled: false })
    statSettings_[statKey] = newStatSetting
    // Remove old setting
    if (oldIndex !== undefined && oldStatSetting && oldStatKey) {
      oldStatSetting.splice(oldIndex, 1)
      if (oldStatSetting.length) statSettings_[oldStatKey] = oldStatSetting
      else delete statSettings_[oldStatKey]
    }
    setStatSettings({ ...statSettings_ })
  }, [setStatSettings, statSettings])

  const delKey = useCallback((statKey: T, index: number) => {
    const statSettings_ = { ...statSettings }
    const statSetting = [...(statSettings[statKey] ?? [])]
    statSetting.splice(index, 1)
    if (statSetting.length) statSettings_[statKey] = statSetting
    else delete statSettings_[statKey]
    setStatSettings({ ...statSettings_ })
  }, [statSettings, setStatSettings])

  const setValue = useCallback((statKey: T, index: number, value: number) => {
    const statSettings_ = { ...statSettings }
    const statSetting = [...(statSettings[statKey] ?? [])]
    statSetting[index] = { ...statSetting[index], value } as DisablableValue
    statSettings_[statKey] = statSetting
    setStatSettings({ ...statSettings_ })
  }, [statSettings, setStatSettings])

  const setDisabled = useCallback((statKey: T, index: number, disabled: boolean) => {
    const statSettings_ = { ...statSettings }
    const statSetting = [...(statSettings[statKey] ?? [])]
    statSetting[index] = { ...statSetting[index], disabled } as DisablableValue
    statSettings_[statKey] = statSetting
    setStatSettings({ ...statSettings_ })
  }, [statSettings, setStatSettings])

  const uniqueKey = useMemo(() => Object.entries(statSettings)
    .reduce((sum, [, settings]) => {
      return sum + settings.length
    },
      0
    ),
    [statSettings]
  )

  return <>
    {Object.entries(statSettings).flatMap(([statKey, settings]) =>
      settings.map((setting, index) =>
        wrapperFunc(<StatEditorItem<T>
          key={`${statKey}${index}`}
          statKey={statKey as T} // Technically unsafe, but we know it is safe here
          statKeyOptions={statOptions}
          disabled={disabled}
          setting={setting}
          index={index}
          setKey={setKey}
          delKey={delKey}
          setValue={setValue}
          setDisabled={setDisabled}
        />, `${statKey}${index}`)
      )
    )}
    {wrapperFunc(<StatEditorItem<T>
      key={uniqueKey}
      statKeyOptions={statOptions}
      disabled={disabled}
      setKey={setKey}
      delKey={delKey}
      setValue={setValue}
      setDisabled={setDisabled}
    />, uniqueKey)}
  </>
}

type StatOption<T extends string> = {
  key: T
  label: string
  variant?: Variant
}
type StatEditorItemProps<T extends string> = {
  statKeyOptions: StatOption<T>[]
  statKey?: T
  setting?: DisablableValue
  index?: number
  setKey: (statKey: T, oldStatKey?: T, oldIndex?: number) => void
  delKey: (statKey: T, index: number) => void
  setValue: (statKey: T, index: number, value: number) => void
  setDisabled: (statKey: T, index: number, disabled: boolean) => void
  disabled: boolean
}
function StatEditorItem<T extends string>({ statKeyOptions, statKey, setting, index, setKey, delKey, setValue, setDisabled, disabled = false }: StatEditorItemProps<T>) {
  const theme = useTheme()
  const isThreeCol = useMediaQuery(theme.breakpoints.up('lg'))
  const isOneCol = useMediaQuery(theme.breakpoints.down('md'))
  const isFloat = statKey ? KeyMap.unit(statKey) === "%" : false
  const onValueChange = useCallback((value?: number) =>
    statKey && index !== undefined && setValue(statKey, index, value ?? 0),
    [setValue, statKey, index]
  )
  const onKeyChange = useCallback((newKey: T | null) => {
    if (newKey) {
      setKey(newKey, statKey, index)
    } else if (statKey && index) {
      delKey(statKey, index)
    }
  },
    [statKey, setKey, delKey, index])
  const onDeleteKey = useCallback(() =>
    statKey && index !== undefined && delKey(statKey, index),
    [delKey, statKey, index]
  )
  const buttonStyle = { p: 1, flexBasis: 30, flexGrow: 0, flexShrink: 0 }

  return <ButtonGroup sx={{ width: "100%" }}>
    <Button sx={buttonStyle} color={setting?.disabled ? "secondary" : "success"} onClick={() => index !== undefined && statKey && setDisabled(statKey, index, !setting?.disabled)} disabled={disabled || !setting}>
      {setting?.disabled ? <CheckBoxOutlineBlankIcon /> : <CheckBoxIcon />}
    </Button>
    <GeneralAutocomplete<T>
      flattenCorners
      size="small"
      options={statKeyOptions}
      onChange={onKeyChange}
      valueKey={statKey ?? null}
      toImg={(sKey: T) => <StatIcon statKey={sKey} iconProps={{ color: KeyMap.getVariant(sKey) }} />}
      ListboxProps={{ style: { display: "grid", gridTemplateColumns: isOneCol ? "100%" : (isThreeCol ? "33% 33% 33%" : "50% 50%") } }}
      // This needs to be done with `style` prop, not `sx` prop, or it doesn't work
      PopperComponent={(props) => <Popper {...props} style={{ width: "60%" }} />}
      sx={{ flexGrow: 1, flexBasis: 150 }}
    />
    <CustomNumberInputButtonGroupWrapper sx={{ flexBasis: 30, flexGrow: 1, borderRadius: 0 }}>
      <CustomNumberInput
        disabled={!statKey || disabled}
        float={isFloat}
        value={setting?.value}
        placeholder="Stat Value"
        onChange={onValueChange}
        sx={{ px: 1, }}
        inputProps={{ sx: { textAlign: "right" } }}
        endAdornment={statKey ? KeyMap.unit(statKey) : undefined}
      />
    </CustomNumberInputButtonGroupWrapper>
    {!!statKey && <Button sx={buttonStyle} color="error" onClick={onDeleteKey} disabled={disabled}><DeleteForeverIcon fontSize="small" /></Button>}
  </ButtonGroup>
}
