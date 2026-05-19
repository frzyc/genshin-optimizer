import { ColorText } from '@genshin-optimizer/common/ui'
import type { Read } from '@genshin-optimizer/game-opt/engine'
import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type { Field, MultiTagField, TagField } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import type { Sheet, Tag } from '@genshin-optimizer/zzz/formula'
import { abilityFormulaNameToTranslated } from './char/sheetUtil'
import { getVariant } from './char/util'
import { tagToTagField } from './util'

export const ABILITY_QS = ['standardDmg', 'dazeBuildup', 'anomBuildup'] as const
export const Q_LABELS: Record<(typeof ABILITY_QS)[number], string> = {
  standardDmg: 'DMG',
  dazeBuildup: 'Daze',
  anomBuildup: 'Anom',
}

function isAbilityQ(q: string | null | undefined): q is (typeof ABILITY_QS)[number] {
  return !!q && (ABILITY_QS as readonly string[]).includes(q)
}

function groupKey(tag: Tag) {
  return `${tag.sheet ?? ''}:${tag.name ?? ''}`
}

function skillFromTag(tag: Tag): SkillKey | undefined {
  const skillType = tag.skillType
  if (!skillType?.endsWith('Skill')) return undefined
  return skillType.slice(0, -'Skill'.length) as SkillKey
}

function singleFormulaField(
  tag: Tag,
  charKey: CharacterKey | undefined,
  skill: SkillKey | undefined
): TagField {
  if (charKey && skill) {
    return {
      title: (
        <ColorText color={getVariant(tag)}>
          {abilityFormulaNameToTranslated(charKey, skill, tag)}
        </ColorText>
      ),
      fieldRef: tag,
    }
  }
  return tagToTagField(tag, { preventRecursion: true }) as TagField
}

type GroupFieldsOpts = {
  sheet?: Sheet
  charKey?: CharacterKey
  skill?: SkillKey
}

/**
 * Groups tags that share `name` with dmg/daze/anom `q` into one {@link MultiTagField}.
 */
export function groupFieldsByTag(tags: Tag[], opts: GroupFieldsOpts = {}): Field[] {
  const { sheet, charKey, skill } = opts
  const withSheet = (tag: Tag): Tag =>
    sheet && !tag.sheet ? { ...tag, sheet } : tag

  const bundledTitle = (tag: Tag) => {
    const merged = withSheet(tag)
    const resolvedSkill = skill ?? skillFromTag(merged)
    if (charKey && resolvedSkill) {
      return (
        <ColorText color={getVariant(merged)}>
          {abilityFormulaNameToTranslated(charKey, resolvedSkill, merged)}
        </ColorText>
      )
    }
    return tagToTagField(merged, { preventRecursion: true }).title
  }

  const seenGroups = new Set<string>()
  const fields: Field[] = []

  for (const rawTag of tags) {
    const tag = withSheet(rawTag)
    const { name, q } = tag
    if (!name || !isAbilityQ(q)) {
      fields.push(singleFormulaField(tag, charKey, skill))
      continue
    }

    const key = groupKey(tag)
    if (seenGroups.has(key)) continue
    seenGroups.add(key)

    const group = tags
      .map(withSheet)
      .filter(
        (t) => t.name === name && t.sheet === tag.sheet && isAbilityQ(t.q)
      )
    const byQ = new Map<string, Tag>()
    for (const t of group) {
      const rq = t.q
      if (isAbilityQ(rq)) byQ.set(rq, t)
    }

    if (ABILITY_QS.every((aq) => byQ.has(aq))) {
      const dmgTag = byQ.get('standardDmg')!
      const titleField = tagToTagField(dmgTag, { preventRecursion: true })
      const multiField: MultiTagField = {
        title: bundledTitle(dmgTag),
        icon: titleField.icon,
        subtitle: titleField.subtitle,
        fieldRefs: ABILITY_QS.map((aq) => ({
          label: Q_LABELS[aq],
          ref: byQ.get(aq)!,
        })),
      }
      fields.push(multiField)
    } else {
      for (const t of group) fields.push(singleFormulaField(t, charKey, skill))
    }
  }

  return fields
}

export function groupFormulas(
  reads: Read<Tag>[],
  sheet?: Sheet,
  charKey?: CharacterKey
): Field[] {
  return groupFieldsByTag(
    reads.map((r) => r.tag),
    { sheet, charKey }
  )
}

export function formulaMatchesAbility(
  formula: IFormulaData<Tag>,
  ability: string
): boolean {
  const base = (formula.tag.name ?? formula.name.split(':')[0]).split('_')[0]
  return base === ability
}

/** Skill sheet / mechanics fields from formula meta (e.g. bundled Miyabi). */
export function groupFormulaMetaToFields(
  formulas: IFormulaData<Tag>[],
  charKey: CharacterKey,
  skill: SkillKey
): Field[] {
  const tags = formulas.map((f) => ({
    ...f.tag,
    sheet: (f.tag.sheet ?? f.sheet ?? charKey) as Sheet,
  }))
  return groupFieldsByTag(tags, { sheet: charKey, charKey, skill })
}
