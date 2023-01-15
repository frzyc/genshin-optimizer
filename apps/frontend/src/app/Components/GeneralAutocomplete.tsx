import { Favorite } from "@mui/icons-material"
import { Autocomplete, AutocompleteProps, Chip, ListItemIcon, ListItemText, MenuItem, Skeleton, TextField, useTheme } from "@mui/material"
import { Suspense } from "react"
import { Variant } from "../Formula/type"
import ColorText from "./ColoredText"

export type GeneralAutocompleteOption<T extends string> = { key: T, label: string, grouper?: string | number, favorite?: boolean }
type GeneralAutocompletePropsBase<T extends string> = {
  label?: string,
  defaultText?: string
  toImg: (v: T) => JSX.Element | undefined,
  toVariant?: (v: T) => Variant | undefined,
  clearKey?: T
}
export type GeneralAutocompleteProps<T extends string> = GeneralAutocompletePropsBase<T> & { valueKey: T, onChange: (v: T) => void, } &
  Omit<AutocompleteProps<GeneralAutocompleteOption<T>, false, true, false>, "renderInput" | "isOptionEqualToValue" | "renderOption" | "onChange" | "value">
export function GeneralAutocomplete<T extends string>({ options, valueKey: key, label, toVariant, onChange, clearKey, toImg, defaultText, ...acProps }: GeneralAutocompleteProps<T>) {
  const value = findOption(options, key, defaultText)
  const theme = useTheme()
  return <Autocomplete
    autoHighlight
    options={options}
    value={value}
    clearIcon={key !== clearKey ? undefined : null}
    onChange={(event, newValue, reason) => {
      if (reason === "clear" && clearKey !== undefined) return onChange(clearKey)
      return newValue !== null && onChange(newValue.key)
    }}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    renderInput={(params) => {
      const variant = toVariant?.(key)
      const color = variant ? theme.palette[variant]?.main : undefined
      return <TextField
        {...params}
        label={label}
        InputProps={{
          ...params.InputProps,
          startAdornment: value !== undefined ? toImg(value.key) : undefined,
        }}
        inputProps={{
          ...params.inputProps,
          autoComplete: 'new-password', // disable autocomplete and autofill
          style: { color }
        }}
        color={key ? "success" : "primary"}
      />
    }}
    renderOption={(props, option) => <MenuItem value={option.key} {...props}>
      <ListItemIcon>{toImg(option.key)}</ListItemIcon>
      <ListItemText color={toVariant?.(option.key)}>
        <Suspense fallback={<Skeleton variant="text" width={100} />}>
          <ColorText color={toVariant?.(option.key)}>
            {option.key === value?.key ? <strong>{option.label}</strong> : option.label}
          </ColorText>
        </Suspense>
      </ListItemText>
      {!!option.favorite && <Favorite />}
    </MenuItem>}
    {...acProps}
  />
}
export type GeneralAutocompleteMultiProps<T extends string> = GeneralAutocompletePropsBase<T> & { valueKeys: T[], onChange: (v: T[]) => void, } &
  Omit<AutocompleteProps<GeneralAutocompleteOption<T>, true, true, false>, "renderInput" | "isOptionEqualToValue" | "renderOption" | "onChange" | "value">
export function GeneralAutocompleteMulti<T extends string>({ options, valueKeys: keys, label, onChange, toImg, toVariant, defaultText, ...acProps }: GeneralAutocompleteMultiProps<T>) {
  const value = keys.map(k => findOption(options, k, defaultText))
  return <Autocomplete
    autoHighlight
    options={options}
    multiple
    disableCloseOnSelect
    value={value}
    onChange={(event, newValue, reason) => {
      if (reason === "clear") return onChange([])
      return newValue !== null && onChange(newValue.map(v => v.key))
    }}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    renderInput={params => <TextField
      {...params}
      label={label}
      inputProps={{
        ...params.inputProps,
        autoComplete: 'new-password', // disable autocomplete and autofill
      }}
      color={keys.length ? "success" : "primary"}
    />}
    renderOption={(props, option) => <MenuItem value={option.key} {...props}>
      <ListItemIcon>{toImg(option.key)}</ListItemIcon>
      <ListItemText >
        <Suspense fallback={<Skeleton variant="text" width={100} />}>
          <ColorText color={toVariant?.(option.key)}>
            {keys.includes(option.key) ? <strong>{option.label}</strong> : option.label}
          </ColorText>
        </Suspense>
      </ListItemText>
      {!!option.favorite && <Favorite />}
    </MenuItem>}
    renderTags={(selected, getTagProps) => selected.map(({ key, label }, index) => {
      return <Chip {...getTagProps({ index })} key={key} icon={toImg(key)} label={label} color={toVariant?.(key)} />
    })}
    {...acProps}
  />
}
function findOption<T extends string>(options: readonly GeneralAutocompleteOption<T>[], key: T, label = "ERROR") {
  return options.find(o => o.key === key) ?? { key: "" as T, label }
}
