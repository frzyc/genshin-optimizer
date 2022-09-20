import { Autocomplete, AutocompleteProps, AutocompleteRenderGroupParams, Box, Chip, List, ListSubheader, TextField, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArtifactSheet } from '../../Data/Artifacts/ArtifactSheet';
import i18n from '../../i18n';
import KeyMap from '../../KeyMap';
import usePromise from '../../ReactHooks/usePromise';
import { allMainStatKeys, allSubstatKeys, MainStatKey, SubstatKey } from '../../Types/artifact';
import { allElementsWithPhy, ArtifactRarity, ArtifactSetKey } from '../../Types/consts';
import MenuItemWithImage from '../MenuItemWithImage';
import SolidColoredTextField from '../SolidColoredTextfield';
import { StarsDisplay } from '../StarDisplay';
import StatIcon from '../StatIcon';

type Grouper = string | number | undefined

type ArtifactMultiAutocompleteKey = ArtifactSetKey | MainStatKey | SubstatKey
type ArtifactMultiAutocompleteOption<T extends ArtifactMultiAutocompleteKey, G extends Grouper> = {
  key: T
  label: string
  grouper?: G
}
type ArtifactMultiAutocompleteProps<T extends ArtifactMultiAutocompleteKey, G extends Grouper> = Omit<AutocompleteProps<ArtifactMultiAutocompleteOption<T, G>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  allArtifactKeysWithGrouper: readonly { key: T, grouper?: G }[]
  selectedArtifactKeys: T[]
  setArtifactKeys: (keys: T[]) => void
  getName: (key: T) => string
  getImage: (key: T) => JSX.Element
  label: string
}
function ArtifactMultiAutocomplete<T extends ArtifactMultiAutocompleteKey, G extends Grouper>({ allArtifactKeysWithGrouper, selectedArtifactKeys, setArtifactKeys, getName, getImage, label, ...props }:
  ArtifactMultiAutocompleteProps<T, G>) {
  const theme = useTheme()

  const handleChange = (_, value: ArtifactMultiAutocompleteOption<T, G>[]) => {
    setArtifactKeys(value.map(v => v.key))
  }
  const options = useMemo(() => allArtifactKeysWithGrouper.map(({ key, grouper }) => ({ key, label: getName(key), grouper })), [allArtifactKeysWithGrouper, getName])
  return <Autocomplete
    autoHighlight
    multiple
    disableCloseOnSelect
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

type ArtifactSetMultiAutocompleteProps = Omit<AutocompleteProps<ArtifactMultiAutocompleteOption<ArtifactSetKey, ArtifactRarity>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  artSetKeys: ArtifactSetKey[]
  setArtSetKeys: (keys: ArtifactSetKey[]) => void
}
export function ArtifactSetMultiAutocomplete({ artSetKeys, setArtSetKeys, ...props }: ArtifactSetMultiAutocompleteProps) {
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const { t } = useTranslation(["artifact", "artifactNames_gen"])
  if (!artifactSheets) return null

  const allArtifactSetsAndRarities = Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets))
    .flatMap(([rarity, sets]) => sets.map(set => ({ key: set, grouper: +rarity as ArtifactRarity })))
    .sort(sortByRarityAndName)

  return <ArtifactMultiAutocomplete<ArtifactSetKey, ArtifactRarity>
    allArtifactKeysWithGrouper={allArtifactSetsAndRarities}
    selectedArtifactKeys={artSetKeys}
    setArtifactKeys={setArtSetKeys}
    getName={(key: ArtifactSetKey) => artifactSheets(key).nameRaw}
    getImage={(key: ArtifactSetKey) => artifactSheets(key).defIcon}
    label={t("artifact:autocompleteLabels.sets")}
    groupBy={(option) => option.grouper?.toString() ?? ""}
    renderGroup={(params: AutocompleteRenderGroupParams) => params.group && <List key={params.group} component={Box}>
      <ListSubheader key={`${params.group}Header`} sx={{ top: "-1em" }}>
        {params.group} <StarsDisplay stars={+params.group as ArtifactRarity} />
      </ListSubheader>
      {params.children}
    </List>}
    {...props}
  />
}

type ArtifactMainStatMultiAutocompleteProps = Omit<AutocompleteProps<ArtifactMultiAutocompleteOption<MainStatKey, undefined>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  mainStatKeys: MainStatKey[]
  setMainStatKeys: (keys: MainStatKey[]) => void
}
export function ArtifactMainStatMultiAutocomplete({ mainStatKeys, setMainStatKeys, ...props }: ArtifactMainStatMultiAutocompleteProps) {
  const { t } = useTranslation("artifact")
  return <ArtifactMultiAutocomplete<MainStatKey, undefined>
    allArtifactKeysWithGrouper={allMainStatKeys.map(key => ({ key }))}
    selectedArtifactKeys={mainStatKeys}
    setArtifactKeys={setMainStatKeys}
    getName={(key: MainStatKey) => KeyMap.getArtStr(key)}
    getImage={(key: MainStatKey) => StatIcon[key]}
    label={t("autocompleteLabels.mainStats")}
    {...props}
  />
}

type ArtifactSubstatMultiAutocompleteProps = Omit<AutocompleteProps<ArtifactMultiAutocompleteOption<SubstatKey, undefined>, true, false, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  substatKeys: SubstatKey[]
  setSubstatKeys: (keys: SubstatKey[]) => void
}
export function ArtifactSubstatMultiAutocomplete({ substatKeys, setSubstatKeys, ...props }: ArtifactSubstatMultiAutocompleteProps) {
  const { t } = useTranslation("artifact")
  return <ArtifactMultiAutocomplete<SubstatKey, undefined>
    allArtifactKeysWithGrouper={allSubstatKeys.map(key => ({ key }))}
    selectedArtifactKeys={substatKeys}
    setArtifactKeys={setSubstatKeys}
    getName={(key: SubstatKey) => KeyMap.getArtStr(key)}
    getImage={(key: SubstatKey) => StatIcon[key]}
    label={t("autocompleteLabels.substats")}
    {...props}
  />
}

type ArtifactSingleAutocompleteKey = ArtifactSetKey | MainStatKey | SubstatKey | ""
type ArtifactSingleAutocompleteOption<T extends ArtifactSingleAutocompleteKey, G extends Grouper> = {
  key: T
  label: string
  grouper?: G
}
type ArtifactSingleAutocompleteProps<T extends ArtifactSingleAutocompleteKey, G extends Grouper> = Omit<AutocompleteProps<ArtifactSingleAutocompleteOption<T, G>, false, true, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  allArtifactKeysWithGrouper: readonly { key: T, grouper?: G }[]
  selectedArtifactKey: T
  setArtifactKey: (key: T | "") => void
  getName: (key: T) => string
  getImage: (key: T) => JSX.Element
  label: string
  disable?: (v: any) => boolean
  showDefault?: boolean
  defaultText?: string
  defaultIcon?: Displayable
}
function ArtifactSingleAutocomplete<T extends ArtifactSingleAutocompleteKey, G extends Grouper>({ allArtifactKeysWithGrouper, selectedArtifactKey, setArtifactKey, getName, getImage, label, disable = () => false, showDefault = false, defaultText = "", defaultIcon = "", ...props }:
  ArtifactSingleAutocompleteProps<T, G>) {
  const theme = useTheme();

  const options = useMemo(() =>
    (showDefault
      ? [{ key: "" as T, label: defaultText }]
      : []
    ).concat(allArtifactKeysWithGrouper.map(({ key, grouper }) => (
      { key, label: getName(key), grouper }
    ))), [allArtifactKeysWithGrouper, getName, defaultText, showDefault])

  return <Autocomplete
    autoHighlight
    options={options}
    clearIcon={selectedArtifactKey ? undefined : ""} // Hide the clear icon if the value is already default
    value={{ key: selectedArtifactKey, label: getName(selectedArtifactKey) }}
    onChange={(event, newValue, reason) => (event.type !== "change" || reason !== "clear") && setArtifactKey(newValue ? newValue.key : "")}
    getOptionLabel={(option) => option.label ? option.label : defaultText}
    isOptionEqualToValue={(option, value) => option.key === value.key}
    getOptionDisabled={option => disable(option.key)}
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

type ArtifactSetSingleAutocompleteProps = Omit<AutocompleteProps<ArtifactSingleAutocompleteOption<ArtifactSetKey | "", ArtifactRarity>, false, true, false>, "title" | "children" | "onChange" | "options" | "renderInput" | "value"> & {
  artSetKey: ArtifactSetKey | ""
  setArtSetKey: (key: ArtifactSetKey | "") => void
  label?: string
  disable?: (v: any) => boolean
  showDefault?: boolean
  defaultText?: string
  defaultIcon?: Displayable
}
export function ArtifactSetSingleAutocomplete({ artSetKey, setArtSetKey, label = "", ...props }: ArtifactSetSingleAutocompleteProps) {
  const artifactSheets = usePromise(() => ArtifactSheet.getAll, [])
  const { t } = useTranslation(["artifact", "artifactNames_gen"])
  label = label ? label : t("artifact:autocompleteLabels.set")
  if (!artifactSheets) return null

  const allArtifactSetsAndRarities = Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets))
    .flatMap(([rarity, sets]) => sets.map(set => ({ key: set, grouper: +rarity as ArtifactRarity })))
    .sort(sortByRarityAndName)

  return <ArtifactSingleAutocomplete<ArtifactSetKey | "", ArtifactRarity>
    allArtifactKeysWithGrouper={allArtifactSetsAndRarities}
    selectedArtifactKey={artSetKey}
    setArtifactKey={setArtSetKey}
    getName={(key: ArtifactSetKey | "") => key && artifactSheets(key).nameRaw}
    getImage={(key: ArtifactSetKey | "") => key ? artifactSheets(key).defIcon : <></>}
    label={label}
    groupBy={(option) => option.grouper?.toString() ?? ""}
    renderGroup={(params: AutocompleteRenderGroupParams) => params.group && <List key={params.group} component={Box}>
      <ListSubheader key={`${params.group}Header`} sx={{ top: "-1em" }}>
        {params.group} <StarsDisplay stars={+params.group as ArtifactRarity} />
      </ListSubheader>
      {params.children}
    </List>}
    {...props}
  />
}

function sortByRarityAndName(a: { key: ArtifactSetKey, grouper: ArtifactRarity }, b: { key: ArtifactSetKey, grouper: ArtifactRarity }) {
  if (a.grouper > b.grouper) {
    return -1
  }
  if (a.grouper < b.grouper) {
    return 1
  }

  const aName = i18n.t(`artifactNames_gen:${a.key}`)
  const bName = i18n.t(`artifactNames_gen:${b.key}`)
  if (aName < bName) {
    return -1
  }
  if (aName > bName) {
    return 1
  }

  return 0
}
