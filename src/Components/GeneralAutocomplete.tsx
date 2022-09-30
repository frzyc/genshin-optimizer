import { Favorite } from "@mui/icons-material"
import { Autocomplete, AutocompleteProps, ListItemIcon, ListItemText, MenuItem, Skeleton } from "@mui/material"
import { Suspense } from "react"
import SolidColoredTextField from "./SolidColoredTextfield"

export type GeneralAutocompleteOption<T extends string> = { key: T, label: string, favorite?: boolean }
export default function GeneralAutocomplete<T extends string>({ options, valueKey: key, label, onChange, disable = () => false, clearKey, toImg, ...acProps }:
  { valueKey: T, label?: string, onChange: (v: T) => void, toImg: (v: T) => JSX.Element, disable?: (v: T) => boolean, clearKey?: T } & Omit<AutocompleteProps<GeneralAutocompleteOption<T>, false, true, false>, "renderInput" | "onChange">) {
  const value = options.find(o => o.key === key)
  return <Autocomplete
    options={options}
    value={value}
    clearIcon={key !== clearKey ? undefined : null}
    onChange={(event, newValue, reason) => {
      if (reason === "clear" && clearKey !== undefined) return onChange(clearKey)
      return newValue !== null && onChange(newValue.key)
    }}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    renderInput={props => <SolidColoredTextField
      {...props}
      label={label}
      startAdornment={value !== undefined ? toImg(value.key) : undefined}
      hasValue={!!value?.key}
    />}
    renderOption={(props, option) => <MenuItem value={option.key} {...props}>
      <ListItemIcon>{toImg(option.key)}</ListItemIcon>
      <ListItemText>
        <Suspense fallback={<Skeleton variant="text" width={100} />}>
          {option.key === value?.key ? <strong>{option.label}</strong> : option.label}
        </Suspense>
      </ListItemText>
      {!!option.favorite && <Favorite />}
    </MenuItem>
    }
    {...acProps}
  />
}
