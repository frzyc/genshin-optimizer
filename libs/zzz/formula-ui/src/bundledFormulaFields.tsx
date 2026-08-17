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
import { TagDisplay } from './components/TagDisplay'
import { ABILITY_DIM_LABEL } from './formulaDimensionUi'

function bundleFieldRefs(byQ: Map<string, Tag>) {
  const dmgQ = resolveBundleDmgQ(byQ)!
  return [
    { label: ABILITY_DIM_LABEL[dmgQ], ref: byQ.get(dmgQ)! },
    { label: ABILITY_DIM_LABEL.dazeBuildup, ref: byQ.get('dazeBuildup')! },
    { label: ABILITY_DIM_LABEL.anomBuildup, ref: byQ.get('anomBuildup')! },
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
  return <TagDisplay tag={tag} />
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

    const dmgTag = part.byQ.get(part.dmgQ)!
    const multiField: MultiTagField = {
      title: formulaFieldTitle(dmgTag),
      fieldRefs: bundleFieldRefs(part.byQ),
    }
    fields.push(multiField)
  }

  return fields
}
