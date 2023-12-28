import { Favorite } from '@mui/icons-material'
import type {
  AutocompleteProps,
  ChipProps,
  ChipPropsColorOverrides,
  Palette,
  PaletteColor,
  TextFieldProps,
} from '@mui/material'
import {
  Autocomplete,
  Chip,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Skeleton,
  TextField,
  useTheme,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Suspense, useMemo } from 'react'
import { ColorText } from './ColorText'
/**
 * NOTE: the rationale behind toImg/toExlabel/toExItemLabel, is because `options` needs to be serializable, and having JSX in there will disrupt seralizability.
 */
export type GeneralAutocompleteOption<T extends string> = {
  key: T
  label: string
  grouper?: string | number
  color?: keyof Palette
  favorite?: boolean
  alternateNames?: string[]
}
type GeneralAutocompletePropsBase<T extends string> = {
  label?: string
  toImg: (v: T) => JSX.Element | undefined
  toExItemLabel?: (v: T) => ReactNode
  toExLabel?: (v: T) => ReactNode
  chipProps?: Partial<ChipProps>
  textFieldProps?: Partial<TextFieldProps>
}
export type GeneralAutocompleteProps<T extends string> =
  GeneralAutocompletePropsBase<T> & {
    valueKey: T | null
    onChange: (v: T | null) => void
  } & Omit<
      AutocompleteProps<GeneralAutocompleteOption<T>, false, false, false>,
      | 'renderInput'
      | 'isOptionEqualToValue'
      | 'renderOption'
      | 'onChange'
      | 'value'
    >
export function GeneralAutocomplete<T extends string>({
  options,
  valueKey,
  label,
  onChange,
  toImg,
  toExItemLabel,
  toExLabel,
  textFieldProps,
  ...acProps
}: GeneralAutocompleteProps<T>) {
  const value = options.find((o) => o.key === valueKey)
  const theme = useTheme()
  return (
    <Autocomplete
      autoHighlight
      options={options}
      value={value ?? null}
      onChange={(_event, newValue, _reason) => onChange(newValue?.key ?? null)}
      isOptionEqualToValue={(option, value) => option.key === value?.key}
      renderInput={(params) => {
        const variant = value?.color
        const color = variant
          ? (theme.palette[variant] as PaletteColor | undefined)?.main
          : undefined
        const { InputLabelProps, InputProps, inputProps, ...restParams } =
          params
        return (
          <TextField
            {...restParams}
            {...(textFieldProps as TextFieldProps)}
            label={label}
            InputProps={{
              ...InputProps,
              startAdornment:
                typeof valueKey === 'string' ? toImg(valueKey) : undefined,
            }}
            inputProps={{
              ...inputProps,
              autoComplete: 'new-password', // disable autocomplete and autofill
              style: { color },
            }}
            color={valueKey ? 'success' : 'primary'}
          />
        )
      }}
      renderOption={(props, option) => {
        // https://stackoverflow.com/a/75968316
        const { key, ...rest } =
          props as React.HTMLAttributes<HTMLLIElement> & { key: string }
        return (
          <MenuItem
            value={option.key}
            sx={{ whiteSpace: 'normal' }}
            key={key}
            {...rest}
          >
            <ListItemIcon>{toImg(option.key)}</ListItemIcon>
            <ListItemText color={option.color}>
              <Suspense fallback={<Skeleton variant="text" width={100} />}>
                <ColorText
                  color={option.color}
                  sx={{ display: 'flex', gap: 1 }}
                >
                  {option.key === value?.key ? (
                    <strong>{option.label}</strong>
                  ) : (
                    <span>{option.label}</span>
                  )}
                  {toExItemLabel?.(option.key)}
                </ColorText>
              </Suspense>
            </ListItemText>
            {!!option.favorite && <Favorite />}
          </MenuItem>
        )
      }}
      filterOptions={(options, { inputValue }) =>
        options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            opt.alternateNames?.some((name) =>
              name.toLowerCase().includes(inputValue.toLowerCase())
            )
        )
      }
      {...acProps}
    />
  )
}
export type GeneralAutocompleteMultiProps<T extends string> =
  GeneralAutocompletePropsBase<T> & {
    valueKeys: T[]
    onChange: (v: T[]) => void
  } & Omit<
      AutocompleteProps<GeneralAutocompleteOption<T>, true, true, false>,
      | 'renderInput'
      | 'isOptionEqualToValue'
      | 'renderOption'
      | 'onChange'
      | 'value'
    >
export function GeneralAutocompleteMulti<T extends string>({
  options,
  valueKeys: keys,
  label,
  onChange,
  toImg,
  toExItemLabel,
  toExLabel,
  chipProps,
  ...acProps
}: GeneralAutocompleteMultiProps<T>) {
  const value = useMemo(
    () =>
      keys
        .map((k) => options.find((o) => o.key === k))
        .filter((o) => o) as unknown as GeneralAutocompleteOption<T>[],
    [options, keys]
  )
  return (
    <Autocomplete
      autoHighlight
      options={options}
      multiple
      disableCloseOnSelect
      value={value}
      onChange={(event, newValue, reason) => {
        if (reason === 'clear') return onChange([])
        return newValue !== null && onChange(newValue.map((v) => v.key))
      }}
      isOptionEqualToValue={(option, value) => option.key === value.key}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password', // disable autocomplete and autofill
          }}
          color={keys.length ? 'success' : 'primary'}
        />
      )}
      renderOption={(props, option) => (
        <MenuItem value={option.key} {...props}>
          <ListItemIcon>{toImg(option.key)}</ListItemIcon>
          <ListItemText>
            <Suspense fallback={<Skeleton variant="text" width={100} />}>
              <ColorText color={option.color} sx={{ display: 'flex', gap: 1 }}>
                {keys.includes(option.key) ? (
                  <strong>{option.label}</strong>
                ) : (
                  <span>{option.label}</span>
                )}
                {toExItemLabel?.(option.key)}
              </ColorText>
            </Suspense>
          </ListItemText>
          {!!option.favorite && <Favorite />}
        </MenuItem>
      )}
      renderTags={(selected, getTagProps) =>
        selected.map(({ key, label, color: variant }, index) => (
          <Chip
            {...chipProps}
            {...getTagProps({ index })}
            key={`${index}${key}${label}`}
            icon={toImg(key)}
            label={
              toExLabel ? (
                <span>
                  {label} {toExLabel(key)}
                </span>
              ) : (
                label
              )
            }
            color={variant as keyof ChipPropsColorOverrides}
          />
        ))
      }
      filterOptions={(options, { inputValue }) =>
        options.filter(
          (opt) =>
            opt.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            opt.alternateNames?.some((name) =>
              name.toLowerCase().includes(inputValue.toLowerCase())
            )
        )
      }
      {...acProps}
    />
  )
}
