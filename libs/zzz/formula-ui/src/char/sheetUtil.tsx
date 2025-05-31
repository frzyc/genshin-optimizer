import { ImgIcon } from '@genshin-optimizer/common/ui'
import { objKeyMap } from '@genshin-optimizer/common/util'
import type { IFormulaData } from '@genshin-optimizer/game-opt/engine'
import type {
  Document,
  UISheetElement,
} from '@genshin-optimizer/game-opt/sheet-ui'
import { commonDefIcon, mindscapeDefIcon } from '@genshin-optimizer/zzz/assets'
import type { CharacterKey, SkillKey } from '@genshin-optimizer/zzz/consts'
import { allSkillKeys } from '@genshin-optimizer/zzz/consts'
import type { Tag } from '@genshin-optimizer/zzz/formula'
import { formulas, own } from '@genshin-optimizer/zzz/formula'
import { mappedStats } from '@genshin-optimizer/zzz/stats'
import { TagDisplay } from '../components'
import { st, trans } from '../util'
import type { CharUISheet } from './consts'

type AddlDocumentsPerSkillAbility = Partial<
  Record<SkillKey, Partial<Record<string, Document[]>>>
>
type AddlDocuments = {
  perSkillAbility?: AddlDocumentsPerSkillAbility
  core?: Document[]
  ability?: Document[]
  m1?: Document[]
  m2?: Document[]
  m3?: Document[]
  m4?: Document[]
  m5?: Document[]
  m6?: Document[]
}

// Creates the base sheet for a character, including all skill dmg, daze and anom values
export function createBaseSheet(
  key: CharacterKey,
  addlDocuments: AddlDocuments = {}
): CharUISheet {
  return {
    ...createSkillsSheets(key, addlDocuments?.perSkillAbility),
    core: createCoreAndAbilitySheet(
      key,
      addlDocuments?.core,
      addlDocuments?.ability
    ),
    m1: createMindscapeSheet(key, 1, addlDocuments?.m1),
    m2: createMindscapeSheet(key, 2, addlDocuments?.m2),
    m3: createMindscapeSheet(key, 3, addlDocuments?.m3),
    m4: createMindscapeSheet(key, 4, addlDocuments?.m4),
    m5: createMindscapeSheet(key, 5, addlDocuments?.m5),
    m6: createMindscapeSheet(key, 6, addlDocuments?.m6),
  }
}

// Creates proper field with automatic title for a given buff
export function fieldForBuff(buff: IFormulaData<Tag>) {
  return {
    title: <TagDisplay tag={buff.tag} />,
    fieldRef: buff.tag,
  }
}

function createSkillsSheets(
  charKey: CharacterKey,
  addlDocumentsPerSkillAbility?: AddlDocumentsPerSkillAbility
) {
  const dm = mappedStats.char[charKey]
  const form = formulas[charKey]
  const [chg, _ch] = trans('char', charKey)
  return objKeyMap(
    allSkillKeys,
    (skill): UISheetElement => ({
      title: skill, // TODO: Translate. Though this doesn't seem to be shown anywhere
      img: commonDefIcon(`${skill}Flat`),
      documents: Object.keys(dm[skill]).flatMap((ability): Document[] => [
        {
          type: 'text',
          header: {
            icon: <ImgIcon src={commonDefIcon(`${skill}Flat`)} size={1.5} />,
            text: chg(`${skill}.${ability}.name`),
          },
          text: chg(`${skill}.${ability}.desc`),
        },
        {
          type: 'fields',
          fields: Object.values(form)
            .filter((f) => f.name.includes(ability))
            .map((f) => ({
              title: abilityFormulaNameToTranslated(charKey, skill, f.name), // TODO: Translate
              fieldRef: f.tag,
            })),
        },
        ...(addlDocumentsPerSkillAbility?.[skill]?.[ability] ?? []),
      ]),
    })
  )
}

function abilityFormulaNameToTranslated(
  charKey: CharacterKey,
  skill: SkillKey,
  abilityFormulaName: string
) {
  const [ability, hitNumber, type] = abilityFormulaName.split('_')
  return st(type, {
    val: `$t(char_${charKey}_gen:${skill}.${ability}.params.${hitNumber})`,
  })
}

function createCoreAndAbilitySheet(
  charKey: CharacterKey,
  addlCoreDocuments: Document[] = [],
  addlAbilityDocuments: Document[] = []
): UISheetElement {
  const [chg, _ch] = trans('char', charKey)
  return {
    title: 'core',
    documents: [
      {
        type: 'text',
        header: {
          icon: <ImgIcon src={commonDefIcon('coreFlat')} size={1.5} />,
          text: chg('core.name'),
        },
        text: (calc) => chg(`core.desc.${calc.compute(own.char.core).val}`),
      },
      ...addlCoreDocuments,
      {
        type: 'text',
        header: {
          icon: <ImgIcon src={commonDefIcon('coreFlat')} size={1.5} />,
          text: chg('ability.name'),
        },
        text: chg('ability.desc'),
      },
      ...addlAbilityDocuments,
    ],
  }
}

function createMindscapeSheet(
  charKey: CharacterKey,
  mindscape: 1 | 2 | 3 | 4 | 5 | 6,
  addlDocuments: Document[] = []
): UISheetElement {
  const [chg, _ch] = trans('char', charKey)
  return {
    title: `mindscape${mindscape}`,
    documents: [
      {
        type: 'text',
        header: {
          icon: <ImgIcon src={mindscapeDefIcon(mindscape)} size={1.5} />,
          text: chg(`mindscapes.${mindscape}.name`),
        },
        text: (
          <>
            {chg(`mindscapes.${mindscape}.desc`)}
            <br />
            <br />
            <i>{chg(`mindscapes.${mindscape}.flavor`)}</i>
          </>
        ),
      },
      ...addlDocuments,
    ],
  }
}
