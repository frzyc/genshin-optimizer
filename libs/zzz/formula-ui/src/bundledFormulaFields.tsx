import { ColorText } from '@genshin-optimizer/common/ui'
import type { Field, MultiTagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'
import {
  partitionAbilityHits,
  resolveBundleDmgQ,
} from '@genshin-optimizer/zzz/formula'
import { isAbilityFormulaTag } from './abilityTag'
import { AbilityRowTitle } from './char/abilityFormulaLabels'
import { getVariant } from './char/util'
import { TagFallbackLabel } from './components/TagFallbackLabel'
import { ABILITY_DIM_LABEL } from './formulaDimensionUi'

function bundleFieldRefs(byQ: Map<string, Tag>) {
  const dmgQ = resolveBundleDmgQ(byQ)
  const dmgTag = dmgQ ? byQ.get(dmgQ) : undefined
  const dazeTag = byQ.get('dazeBuildup')
  const anomTag = byQ.get('anomBuildup')
  if (!dmgQ || !dmgTag || !dazeTag || !anomTag) {
    console.error(
      '[zzz-formula-ui] bundleFieldRefs: incomplete ability bundle',
      { byQ: [...byQ.entries()] }
    )
    return undefined
  }
  return [
    { label: ABILITY_DIM_LABEL[dmgQ], ref: dmgTag },
    { label: ABILITY_DIM_LABEL.dazeBuildup, ref: dazeTag },
    { label: ABILITY_DIM_LABEL.anomBuildup, ref: anomTag },
  ]
}

/** Row title for bundled opt-target / stats fields. */
export function formulaFieldTitle(tag: Tag) {
  const charKey = tag.sheet as CharacterKey | undefined
  if (charKey && isAbilityFormulaTag(tag)) {
    return (
      <ColorText color={getVariant(tag)}>
        <AbilityRowTitle charKey={charKey} tag={tag} />
      </ColorText>
    )
  }
  return (
    <ColorText color={getVariant(tag)}>
      <TagFallbackLabel tag={tag} />
    </ColorText>
  )
}

/**
 * Groups tags that share `name` with dmg/daze/anom `q` into one {@link MultiTagField}.
 */
export function groupFieldsByTag(tags: Tag[], sheet?: Sheet): Field[] {
  const fields: Field[] = []

  for (const part of partitionAbilityHits(tags, sheet)) {
    if (part.kind === 'single') {
      const { tag } = part
      fields.push({
        title: formulaFieldTitle(tag),
        fieldRef: tag,
      })
      continue
    }

    const fieldRefs = bundleFieldRefs(part.byQ)
    if (!fieldRefs) continue

    const dmgTag = part.byQ.get(part.dmgQ)
    if (!dmgTag) continue

    const multiField: MultiTagField = {
      title: formulaFieldTitle(dmgTag),
      fieldRefs,
    }
    fields.push(multiField)
  }

  return fields
}
