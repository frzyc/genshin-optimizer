import { getUnitStr } from '@genshin-optimizer/common/util'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { allArtifactSetKeys } from '@genshin-optimizer/gi/consts'
import { Translate } from '@genshin-optimizer/gi/i18n'
import { KeyMap } from '@genshin-optimizer/gi/keymap'
import { StatIcon } from '@genshin-optimizer/gi/svgicons'
import type { Info, InfoExtra } from '@genshin-optimizer/gi/wr'
import { infoManager } from '@genshin-optimizer/gi/wr'

export function resolveInfo(info: Info): Info & InfoExtra {
  // Make sure not to override any `Info` (those should be calculated
  // in `UIData`) so we only write to `extra` and combine later
  let extra: InfoExtra = {}
  const { path, variant } = info
  if (path) {
    if (allArtifactSetKeys.includes(path as ArtifactSetKey))
      extra.name = <Translate ns="artifactNames_gen" key18={path} />

    if (KeyMap.getStr(path)) {
      extra.name = KeyMap.get(path)
      extra.icon = (
        <StatIcon
          statKey={path}
          iconProps={{ fontSize: 'inherit', color: variant as any }}
        />
      )
      if (!info.variant || !info.unit)
        info = {
          variant: KeyMap.getVariant(path),
          unit: getUnitStr(path),
          ...info,
        }
    }

    extra = { ...extra, ...infoManager[path] }
  }

  return Object.keys(extra).length ? { ...info, ...extra } : info
}
