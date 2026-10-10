import { ColorText } from '@genshin-optimizer/common/ui'
import {
  allElementWithPhyKeys,
  type ElementWithPhyKey,
  type WeaponKey,
} from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { useTranslation } from 'react-i18next'
import {
  humanizeWeaponCondName,
  weaponCondI18nCandidates,
} from './weaponCondI18n'

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

/** Bool / slider / list title — same ch() then st() resolution as ZZZ `trans()`. */
export function WeaponCondName({
  weaponKey,
  name,
}: {
  weaponKey: WeaponKey
  name: string
}) {
  const candidates = weaponCondI18nCandidates(weaponKey, name)
  const nss = [...new Set(candidates.map((c) => c.ns))]
  const { i18n, ready } = useTranslation(nss)
  if (!ready) return humanizeWeaponCondName(name)
  for (const { ns, key, values } of candidates) {
    if (!hasKey(i18n, ns, key)) continue
    return <Translate ns={ns} key18={key} values={values} />
  }
  return humanizeWeaponCondName(name)
}

export function WeaponCondListValue({
  weaponKey,
  val,
}: {
  weaponKey: WeaponKey
  val: string
}) {
  const wepNs = `weapon_${weaponKey}`
  const optionCandidates = [
    { ns: wepNs, key: val },
    { ns: wepNs, key: condPascal(val) },
    ...(val === 'on' ? [{ ns: wepNs, key: 'always' }] : []),
    ...weaponCondI18nCandidates(weaponKey, val),
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
  return humanizeWeaponCondName(val)
}
