import { Chip } from '@mui/material';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import KeyMap from '../../KeyMap';
import StatIcon from '../../KeyMap/StatIcon';
import { allMainStatKeys, MainStatKey } from '../../Types/artifact';
import { GeneralAutocompleteMulti } from '../GeneralAutocomplete';

export default function ArtifactMainStatMultiAutocomplete({ mainStatKeys, setMainStatKeys, totals }: {
  mainStatKeys: MainStatKey[]
  setMainStatKeys: (keys: MainStatKey[]) => void
  totals: Record<MainStatKey, string>
}) {
  const { t } = useTranslation("artifact")
  const options = useMemo(() => allMainStatKeys.map(key => ({ key, label: KeyMap.getArtStr(key), variant: KeyMap.getVariant(key) })), [])
  const toImg = useCallback((key: MainStatKey) => <StatIcon statKey={key} iconProps={{ sx: { ml: 1 } }} />, [])
  const toExLabel = useCallback((key: MainStatKey) => <strong>{totals[key]}</strong>, [totals],)
  const toExItemLabel = useCallback((key: MainStatKey) => <Chip size="small" label={totals[key]} />, [totals],)
  return <GeneralAutocompleteMulti
    options={options}
    valueKeys={mainStatKeys}
    onChange={setMainStatKeys}
    toImg={toImg}
    toExLabel={toExLabel}
    toExItemLabel={toExItemLabel}
    label={t("autocompleteLabels.mainStats")}
  />
}
