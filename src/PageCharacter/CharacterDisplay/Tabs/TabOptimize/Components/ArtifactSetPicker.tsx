import { ButtonGroup, CardContent, Divider, MenuItem } from '@mui/material';
import React, { useMemo } from 'react';
import { ArtifactSheet } from '../../../../../Data/Artifacts/ArtifactSheet';
import SetEffectDisplay from '../../../../../Components/Artifact/SetEffectDisplay';
import ArtifactSetDropdown from '../../../../../Components/Artifact/ArtifactSetDropdown';
import CardLight from '../../../../../Components/Card/CardLight';
import DropdownButton from '../../../../../Components/DropdownMenu/DropdownButton';
import usePromise from '../../../../../ReactHooks/usePromise';
import { ArtifactRarity, ArtifactSetKey, SetNum } from '../../../../../Types/consts';
import { BuildSetting } from '../BuildSetting';

type PickerProps = {
  index: number
  setFilters: BuildSetting["setFilters"],
  disabled?: boolean,
  onChange: (index: number, key: ArtifactSetKey | "", num: number) => void,
}

export default function ArtifactSetPicker({ index, setFilters, onChange, disabled = false }: PickerProps) {
  const { key: setKey, num: setNum } = setFilters[index]
  const artifactSheets = usePromise(ArtifactSheet.getAll, [])
  const artifactSetsByRarity = useMemo(() => {
    if (!artifactSheets) return undefined
    const artifactSetsByRarity = Object.fromEntries(Object.entries(ArtifactSheet.setKeysByRarities(artifactSheets)).map(([rarity, sets]) => [rarity, sets.filter(setKey => {
      if (setFilters.some(filter => filter.key === setKey)) return false;
      const setsNumArr = Object.keys(artifactSheets?.[setKey]?.setEffects ?? {})
      const artsAccountedOther = setFilters.reduce((accu, cur, ind) => (cur.key && ind !== index) ? accu + cur.num : accu, 0)
      if (setsNumArr.every((num: any) => parseInt(num) + artsAccountedOther > 5)) return false;
      return true
    })])) as Dict<ArtifactRarity, ArtifactSetKey[]>
    return artifactSetsByRarity
  }, [artifactSheets, setFilters, index])

  const artsAccounted = setFilters.reduce((accu, cur) => cur.key ? accu + cur.num : accu, 0)

  return <CardLight>
    <ButtonGroup>
      {/* Artifact set */}
      {artifactSheets && <ArtifactSetDropdown hasUnselect selectedSetKey={setKey} artifactSetsByRarity={artifactSetsByRarity as any} disabled={disabled}
        onChange={setKey => onChange(index, setKey as ArtifactSetKey, parseInt(Object.keys(artifactSheets[setKey]?.setEffects ?? {})[0] as string) ?? 0)}
        titleTransKey="page_character:forceSet"
      />}
      {/* set number */}
      <DropdownButton title={`${setNum}-set`}
        disabled={disabled || !setKey || artsAccounted >= 5}
      >
        {Object.keys(artifactSheets?.[setKey]?.setEffects ?? {}).map((num: any) => {
          let artsAccountedOther = setFilters.reduce((accu, cur) => (cur.key && cur.key !== setKey) ? accu + cur.num : accu, 0)
          return (parseInt(num) + artsAccountedOther <= 5) &&
            (<MenuItem key={num} onClick={() => onChange(index, setFilters[index].key, parseInt(num) ?? 0)} >
              {`${num}-set`}
            </MenuItem>)
        })}
      </DropdownButton>
    </ButtonGroup>
    {!!setKey && <Divider />}
    {!!setKey && <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Object.keys(artifactSheets?.[setKey].setEffects ?? {}).map(setNKey => parseInt(setNKey as string) as SetNum).filter(setNkey => setNkey <= setNum).map(setNumKey =>
        <SetEffectDisplay key={setKey + setNumKey} setKey={setKey} setNumKey={setNumKey} />)}
    </CardContent>}
  </CardLight>
}
