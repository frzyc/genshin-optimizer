import { ColorText } from '@genshin-optimizer/common/ui'
import {
  allElementWithPhyKeys,
  type CharacterKey,
  type ElementWithPhyKey,
} from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { useTranslation } from 'react-i18next'
import { charCondI18nCandidates, humanizeCharCondName } from './charCondI18n'

function hasKey(
  i18n: { exists: (key: string, opts?: { ns?: string }) => boolean },
  ns: string,
  key: string
) {
  return i18n.exists(key, { ns }) || i18n.exists(`${ns}:${key}`)
}

function condPascal(val: string) {
  return `cond${val.charAt(0).toUpperCase()}${val.slice(1)}`
}

function isElementKey(val: string): val is ElementWithPhyKey {
  return (allElementWithPhyKeys as readonly string[]).includes(val)
}

/** Bool / slider / list title — WR `name:` / `ct.ch()` / `st()`. */
export function CharCondName({
  characterKey,
  name,
}: {
  characterKey: CharacterKey
  name: string
}) {
  const candidates = charCondI18nCandidates(characterKey, name)
  const nss = [...new Set(candidates.map((c) => c.ns))]
  const { i18n, ready } = useTranslation(nss)
  if (!ready) return humanizeCharCondName(name)
  for (const { ns, key, values } of candidates) {
    if (!hasKey(i18n, ns, key)) continue
    return <Translate ns={ns} key18={key} values={values} />
  }
  return humanizeCharCondName(name)
}

export function CharCondListValue({
  characterKey,
  val,
}: {
  characterKey: CharacterKey
  val: string
}) {
  const charNs = `char_${characterKey}`
  const optionCandidates = [
    { ns: charNs, key: val },
    { ns: charNs, key: condPascal(val) },
    ...(val === 'on' ? [{ ns: charNs, key: 'always' }] : []),
    ...charCondI18nCandidates(characterKey, val),
  ]
  const nss = [...new Set(['sheet_gen', ...optionCandidates.map((c) => c.ns)])]
  const { i18n, ready } = useTranslation(nss)
  if (!ready) return val

  for (const { ns, key, values } of optionCandidates) {
    if (!hasKey(i18n, ns, key)) continue
    return <Translate ns={ns} key18={key} values={values} />
  }
  if (isElementKey(val) && val !== 'physical')
    return (
      <ColorText color={val}>
        <Translate ns="sheet_gen" key18={`element.${val}`} />
      </ColorText>
    )
  if (hasKey(i18n, 'sheet_gen', `reaction.${val}`))
    return <Translate ns="sheet_gen" key18={`reaction.${val}`} />

  const num = Number(val)
  if (val !== '' && Number.isFinite(num)) {
    if (num > 0 && num <= 1) {
      const pct = Math.round(num * 1000) / 10
      return `${Number.isInteger(pct) ? pct.toFixed(0) : pct}%`
    }
    return val
  }
  return humanizeCharCondName(val)
}
