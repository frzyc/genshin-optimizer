import { Autocomplete, AutocompleteProps, Chip, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import KeyMap from '../../KeyMap';
import usePromise from '../../ReactHooks/usePromise';
import { allMainStatKeys, allSubstatKeys, MainStatKey, SubstatKey } from '../../Types/artifact';
import { allArtifactSets, allElementsWithPhy, ArtifactSetKey } from '../../Types/consts';
import MenuItemWithImage from '../MenuItemWithImage';
import SolidColoredTextField from '../SolidColoredTextfield';
import StatIcon from '../StatIcon';

type ArtifactMultiAutocompleteKey = ArtifactSetKey | MainStatKey | SubstatKey
type ArtifactMultiAutocompleteOption<T extends ArtifactMultiAutocompleteKey> = {
  key: T
  label: string
}
type ArtifactMultiAutocompleteProps<T extends ArtifactMultiAutocompleteKey> = Omit<AutocompleteProps<ArtifactMultiAutocompleteOption<T>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  allArtifactKeys: readonly T[]
  selectedArtifactKeys: T[]
  setArtifactKeys: (keys: T[]) => void
  getName: (key: T) => string
  getImage: (key: T) => JSX.Element
  label: string
}
function ArtifactMultiAutocomplete<T extends ArtifactMultiAutocompleteKey>({ allArtifactKeys, selectedArtifactKeys, setArtifactKeys, getName, getImage, label, ...props }:
  ArtifactMultiAutocompleteProps<T>) {
  const theme = useTheme();

  const handleChange = (_, value: ArtifactMultiAutocompleteOption<T>[]) => {
    setArtifactKeys(value.map(v => v.key))
  };
  const options = useMemo(() => allArtifactKeys.map(key => ({ key: key, label: getName(key) })), [allArtifactKeys, getName])
  return <Autocomplete
    autoHighlight
    multiple
    options={options}
    value={selectedArtifactKeys.map(key => ({ key: key, label: getName(key) }))}
    onChange={handleChange}
    getOptionLabel={(option) => option.label}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    renderInput={(params) => <TextField
      {...params}
      label={label}
      variant="filled"
      InputLabelProps={{ style: { color: theme.palette.text.primary } }}
      color={selectedArtifactKeys.length ? "success" : "primary"}
      type="search"
    />}
    renderOption={(props, option) => (
      <MenuItemWithImage
        key={option.key}
        value={option.key}
        image={getImage(option.key)}
        text={option.label}
        theme={theme}
        isSelected={selectedArtifactKeys.includes(option.key)}
        props={props}
      />
    )}
    renderTags={(selected, getTagProps) => selected.map((value, index) => {
      const element = allElementsWithPhy.find(ele => value.key === `${ele}_dmg_`)
      const color = element ? element : undefined
      return <Chip {...getTagProps({ index })} key={value.key} icon={getImage(value.key)} label={value.label} color={color} />
    })}
    {...props}
  />
}

type ArtifactSetMultiAutoCompleteProps = Omit<AutocompleteProps<ArtifactMultiAutocompleteOption<ArtifactSetKey>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  artSetKeys: ArtifactSetKey[]
  setArtSetKeys: (keys: ArtifactSetKey[]) => void
}
export function ArtifactSetMultiAutoComplete({ artSetKeys, setArtSetKeys, ...props }: ArtifactSetMultiAutoCompleteProps) {
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const { t } = useTranslation("artifact")
  if (!artifactSheets) return null
  return <ArtifactMultiAutocomplete<ArtifactSetKey>
    allArtifactKeys={allArtifactSets}
    selectedArtifactKeys={artSetKeys}
    setArtifactKeys={setArtSetKeys}
    getName={(key: ArtifactSetKey) => artifactSheets[key].nameRaw}
    getImage={(key: ArtifactSetKey) => artifactSheets[key].defIcon}
    label={t("autocompleteLabels.set")}
    {...props}
  />
}

type ArtifactMainStatMultiAutoCompleteProps = Omit<AutocompleteProps<ArtifactMultiAutocompleteOption<MainStatKey>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  mainStatKeys: MainStatKey[]
  setMainStatKeys: (keys: MainStatKey[]) => void
}
export function ArtifactMainStatMultiAutoComplete({ mainStatKeys, setMainStatKeys, ...props }: ArtifactMainStatMultiAutoCompleteProps) {
  const { t } = useTranslation("artifact")
  return <ArtifactMultiAutocomplete<MainStatKey>
    allArtifactKeys={allMainStatKeys}
    selectedArtifactKeys={mainStatKeys}
    setArtifactKeys={setMainStatKeys}
    getName={(key: MainStatKey) => KeyMap.getArtStr(key)}
    getImage={(key: MainStatKey) => StatIcon[key]}
    label={t("autocompleteLabels.mainStat")}
    {...props}
  />
}

type ArtifactSubstatMultiAutoCompleteProps = Omit<AutocompleteProps<ArtifactMultiAutocompleteOption<SubstatKey>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  substatKeys: SubstatKey[]
  setSubstatKeys: (keys: SubstatKey[]) => void
}
export function ArtifactSubstatMultiAutoComplete({ substatKeys, setSubstatKeys, ...props }: ArtifactSubstatMultiAutoCompleteProps) {
  const { t } = useTranslation("artifact")
  return <ArtifactMultiAutocomplete<SubstatKey>
    allArtifactKeys={allSubstatKeys}
    selectedArtifactKeys={substatKeys}
    setArtifactKeys={setSubstatKeys}
    getName={(key: SubstatKey) => KeyMap.getArtStr(key)}
    getImage={(key: SubstatKey) => StatIcon[key]}
    label={t("autocompleteLabels.substat")}
    {...props}
  />
}

type ArtifactSingleAutocompleteKey = ArtifactSetKey | MainStatKey | SubstatKey | ""
type ArtifactSingleAutocompleteOption<T extends ArtifactSingleAutocompleteKey> = {
  key: T
  label: string
}
type ArtifactSingleAutocompleteProps<T extends ArtifactSingleAutocompleteKey> = Omit<AutocompleteProps<ArtifactSingleAutocompleteOption<T>, false, true, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  allArtifactKeys: readonly T[]
  selectedArtifactKey: T
  setArtifactKey: (key: T | "") => void
  getName: (key: T) => string
  getImage: (key: T) => JSX.Element
  label: string
  disable?: (v: any) => boolean
}
function ArtifactSingleAutocomplete<T extends ArtifactSingleAutocompleteKey>({ allArtifactKeys, selectedArtifactKey, setArtifactKey, getName, getImage, label, disable= () => false, ...props }:
  ArtifactSingleAutocompleteProps<T>) {
  const theme = useTheme();

  const options = useMemo(() => allArtifactKeys.map(key => ({ key: key, label: getName(key) })), [allArtifactKeys, getName])
  return <Autocomplete
    autoHighlight
    options={options}
    value={{ key: selectedArtifactKey, label: getName(selectedArtifactKey) }}
    onChange={(_, newValue) => setArtifactKey(newValue ? newValue.key : "")}
    getOptionLabel={(option) => option.label}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    getOptionDisabled={option => option.key ? disable(option.key) : false}
    renderInput={(props) => <SolidColoredTextField
      {...props}
      label={label}
      startAdornment={getImage(selectedArtifactKey)}
      hasValue={selectedArtifactKey ? true : false}
    />}
    renderOption={(props, option) => (
      <MenuItemWithImage
        key={option.key}
        value={option.key}
        image={getImage(option.key)}
        text={option.label}
        theme={theme}
        isSelected={selectedArtifactKey === option.key}
        props={props}
      />
    )}
    {...props}
  />
}

type ArtifactSetSingleAutoCompleteProps = Omit<AutocompleteProps<ArtifactSingleAutocompleteOption<ArtifactSetKey | "">, false, true, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  allArtSetKeys?: readonly ArtifactSetKey[]
  artSetKey: ArtifactSetKey | ""
  setArtSetKey: (key: ArtifactSetKey | "") => void
  label?: string
  disable?: (v: any) => boolean
}
export function ArtifactSetSingleAutoComplete({ allArtSetKeys = allArtifactSets, artSetKey, setArtSetKey, label = "", ...props }: ArtifactSetSingleAutoCompleteProps) {
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const { t } = useTranslation("artifact")
  label = label ? label : t("autocompleteLabels.set")
  if (!artifactSheets) return null
  return <ArtifactSingleAutocomplete<ArtifactSetKey | "">
    allArtifactKeys={allArtSetKeys}
    selectedArtifactKey={artSetKey}
    setArtifactKey={setArtSetKey}
    getName={(key: ArtifactSetKey | "") => key && artifactSheets[key].nameRaw}
    getImage={(key: ArtifactSetKey | "") => key ? artifactSheets[key].defIcon : <></>}
    label={label}
    {...props}
  />
}
