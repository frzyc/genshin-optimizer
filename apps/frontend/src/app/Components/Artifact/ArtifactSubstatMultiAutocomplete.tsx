import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import KeyMap from '../../KeyMap';
import { allSubstatKeys, SubstatKey } from '../../Types/artifact';
import { GeneralAutocompleteMulti } from '../GeneralAutocomplete';
import StatIcon from '../StatIcon';

export default function ArtifactSubstatMultiAutocomplete({ substatKeys, setSubstatKeys }: {
  substatKeys: SubstatKey[]
  setSubstatKeys: (keys: SubstatKey[]) => void
}) {
  const { t } = useTranslation("artifact")
  const options = useMemo(() => allSubstatKeys.map(key => ({ key, label: KeyMap.getArtStr(key) })), [])
  const toImg = useCallback((key: SubstatKey) => StatIcon[key], [])

  return <GeneralAutocompleteMulti
    options={options}
    toImg={toImg}
    valueKeys={substatKeys}
    onChange={setSubstatKeys}
    label={t("autocompleteLabels.substats")}
  />
}
