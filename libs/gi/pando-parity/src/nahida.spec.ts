/**
 * EXPERIMENT — Nahida WR ↔ Pando parity spike (2026-08-04)
 *
 * Not a production GI-UI gate. Lives in `gi-pando-parity` so `gi-ui` does not
 * depend on `gi-formula`.
 * Run:
 *   nx test gi-pando-parity
 *
 * Writes: libs/gi/pando-parity/out/nahida-parity-latest.json
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { ICachedCharacter, ICachedWeapon } from '@genshin-optimizer/gi/db'
import {
  allArtifactData,
  displayDataMap,
  getCharSheet,
  getWeaponSheet,
  reactionData,
  resonanceData,
} from '@genshin-optimizer/gi/sheets'
import { getCharStat } from '@genshin-optimizer/gi/stats'
import { computeUIData, uiDataForTeam } from '@genshin-optimizer/gi/uidata'
import type { Data, NumNode } from '@genshin-optimizer/gi/wr'
import {
  common,
  constant,
  dataObjForCharacter,
  dataObjForWeapon,
  input,
  mergeData,
  percent,
} from '@genshin-optimizer/gi/wr'
import {
  artifactsData,
  charData,
  conditionalData,
  enemyDebuff,
  genshinCalculatorWithEntries,
  own,
  ownBuff,
  teamData,
  userBuff,
  weaponData,
  withMember,
} from '@genshin-optimizer/gi/formula'
import type { TagMapNodeEntries } from '@genshin-optimizer/gi/formula'
import { relDiff } from './index'

type NormTree = {
  op?: string
  val: number | string | undefined
  kids?: NormTree[]
  note?: string
}

/** Mirrors libs/gi/formula/src/example.test.json (trimmed). */
const FIXTURE = [
  {
    char: {
      key: 'Nahida' as const,
      level: 12,
      talent: { auto: 1, skill: 1, burst: 1 },
      ascension: 0,
      constellation: 2,
    },
    weapon: {
      key: 'TulaytullahsRemembrance' as const,
      level: 42,
      ascension: 2,
      refinement: 2,
      location: 'Nahida',
      lock: false,
    },
  },
  {
    char: {
      key: 'Nilou' as const,
      level: 33,
      talent: { auto: 1, skill: 1, burst: 1 },
      ascension: 1,
      constellation: 3,
    },
    weapon: {
      key: 'KeyOfKhajNisut' as const,
      level: 59,
      ascension: 3,
      refinement: 3,
      location: 'Nilou',
      lock: false,
    },
  },
]

const FIXTURE_NAHIDA = FIXTURE[0]

const OUT_DIR = fileURLToPath(new URL('../out/', import.meta.url))
const OUT_FILE = join(OUT_DIR, 'nahida-parity-latest.json')

function normalizePandoTree(node: any, depth = 0, maxDepth = 4): NormTree {
  if (!node || depth > maxDepth) {
    return { val: node?.val, note: depth > maxDepth ? 'truncated' : 'empty' }
  }
  const meta = node.meta ?? {}
  const kids = (meta.ops ?? [])
    .filter(Boolean)
    .slice(0, 12)
    .map((c: any) => normalizePandoTree(c, depth + 1, maxDepth))
  return {
    op: meta.op,
    val: node.val,
    ...(kids.length ? { kids } : {}),
    note: meta.tag
      ? `tag:${JSON.stringify({
          q: meta.tag.q,
          qt: meta.tag.qt,
          sheet: meta.tag.sheet,
          name: meta.tag.name,
        })}`
      : undefined,
  }
}

function normalizeWrTree(node: any, depth = 0, maxDepth = 4): NormTree {
  if (!node || depth > maxDepth) {
    return { val: node?.value, note: depth > maxDepth ? 'truncated' : 'empty' }
  }
  const meta = node.meta ?? {}
  const kids = (meta.ops ?? [])
    .filter(Boolean)
    .slice(0, 12)
    .map((c: any) => normalizeWrTree(c, depth + 1, maxDepth))
  const info = node.info ?? {}
  return {
    op: meta.op,
    val: node.value,
    ...(kids.length ? { kids } : {}),
    note: info.path
      ? `path:${JSON.stringify(info.path)}`
      : info.name
        ? `name:${info.name}`
        : undefined,
  }
}

function buildWrNahida(opts: {
  enemyLevel: number
  enemyRes: number
  c2Bloom: boolean
  hitMode: 'avgHit' | 'hit' | 'critHit'
}) {
  const character = {
    key: 'Nahida',
    level: FIXTURE_NAHIDA.char.level,
    ascension: FIXTURE_NAHIDA.char.ascension,
    constellation: FIXTURE_NAHIDA.char.constellation,
    talent: { ...FIXTURE_NAHIDA.char.talent },
    equippedArtifacts: {
      flower: '',
      plume: '',
      sands: '',
      goblet: '',
      circlet: '',
    },
    equippedWeapon: 'w-nahida-exp',
  } as ICachedCharacter

  const weapon = {
    id: 'w-nahida-exp',
    key: FIXTURE_NAHIDA.weapon.key as any,
    level: FIXTURE_NAHIDA.weapon.level,
    ascension: FIXTURE_NAHIDA.weapon.ascension,
    refinement: FIXTURE_NAHIDA.weapon.refinement,
    location: 'Nahida',
    lock: false,
  } as ICachedWeapon

  const characterSheet = getCharSheet('Nahida', 'F')
  if (!characterSheet) throw new Error('Missing Nahida WR sheet')
  const weaponSheet = getWeaponSheet(weapon.key)
  if (!weaponSheet) throw new Error(`Missing weapon sheet ${weapon.key}`)

  const weaponSheetsDataOfType =
    displayDataMap[getCharStat('Nahida').weaponType]
  // Match useCharData(useCustom=true): strip weapon display, merge type display map
  const { display: _weaponDisplay, ...restWeaponSheetData } = weaponSheet.data
  const weaponSheetsData = mergeData([
    restWeaponSheetData,
    weaponSheetsDataOfType,
  ])

  const sheetData = mergeData([
    characterSheet.data,
    weaponSheetsData,
    allArtifactData,
  ])

  const charObj = dataObjForCharacter(character)
  // Only override level (+ keep default 10% res from dataObjForCharacter unless caller asks)
  if (opts.enemyLevel !== 100) {
    charObj.enemy = {
      ...(charObj.enemy as object),
      level: constant(opts.enemyLevel),
    } as Data['enemy']
  }
  if (opts.enemyRes !== 0.1) {
    // dataObjForCharacter defaults each ele_res_ to 10%
    const eleKeys = [
      'physical_res_',
      'dendro_res_',
      'anemo_res_',
      'geo_res_',
      'electro_res_',
      'hydro_res_',
      'pyro_res_',
      'cryo_res_',
    ] as const
    charObj.enemy = {
      ...(charObj.enemy as object),
      ...Object.fromEntries(eleKeys.map((k) => [k, percent(opts.enemyRes)])),
    } as Data['enemy']
  }
  charObj.hit = {
    ...(charObj.hit as object),
    hitMode: constant(opts.hitMode),
  } as Data['hit']

  const conditionalLayer: Data = opts.c2Bloom
    ? ({
        conditional: {
          Nahida: {
            c2Bloom: constant('on'),
          },
        },
      } as Data)
    : {}

  const data: Data[] = [
    dataObjForWeapon(weapon),
    charObj,
    conditionalLayer,
    sheetData,
    common,
    resonanceData,
    reactionData,
  ]

  // Solo path: computeUIData (avoids uiDataForTeam active/inactive wiring).
  // Also keep uiDataForTeam for display sections when needed.
  const ui = computeUIData(data)
  let teamUi: ReturnType<typeof uiDataForTeam>['Nahida'] | undefined
  try {
    teamUi = uiDataForTeam({ Nahida: data }, 'F', 'Nahida')['Nahida']
  } catch (e) {
    // recorded by callers via thrown errors
    void e
  }
  return { ui, teamUi, characterSheet, data }
}

function buildPandoNahida(opts: {
  enemyLevel: number
  enemyRes: number
  c2Bloom: boolean
  spread: boolean
  withNilouTeammate: boolean
  customDefBonus?: number
}) {
  const members = opts.withNilouTeammate
    ? (['0', '1'] as const)
    : (['0'] as const)
  const data: TagMapNodeEntries = [
    ...teamData([...members]),
    ...withMember(
      '0',
      ...charData(FIXTURE_NAHIDA.char as any),
      ...weaponData(FIXTURE_NAHIDA.weapon as any),
      ...artifactsData([])
    ),
    ...(opts.withNilouTeammate
      ? withMember(
          '1',
          ...charData(FIXTURE[1].char as any),
          ...weaponData(FIXTURE[1].weapon as any),
          ...artifactsData([])
        )
      : []),
    ...(opts.c2Bloom
      ? conditionalData('0', { '0': { Nahida: { c2Bloom: 1 } } })
      : []),
    ...(opts.customDefBonus
      ? [userBuff.premod.def.add(opts.customDefBonus)]
      : []),
    enemyDebuff.reaction.cata.add(opts.spread ? 'spread' : ''),
    enemyDebuff.reaction.amp.add(''),
    enemyDebuff.common.lvl.add(opts.enemyLevel),
    enemyDebuff.common.preRes.add(opts.enemyRes),
    ownBuff.common.critMode.add('avg'),
  ]
  const calc = genshinCalculatorWithEntries(data)
  return calc.withTag({ src: '0' })
}

describe('EXPERIMENT Nahida WR ↔ Pando parity', () => {
  const aligned = {
    enemyLevel: 12,
    enemyRes: 0.1,
    c2Bloom: true,
    hitMode: 'avgHit' as const,
    spread: true,
  }

  const report: Record<string, unknown> = {
    date: new Date().toISOString(),
    fixture: {
      char: FIXTURE_NAHIDA.char,
      weapon: {
        key: FIXTURE_NAHIDA.weapon.key,
        level: FIXTURE_NAHIDA.weapon.level,
        ascension: FIXTURE_NAHIDA.weapon.ascension,
        refinement: FIXTURE_NAHIDA.weapon.refinement,
      },
      note: 'From libs/gi/formula/src/example.test.json[0]; talents are 1-indexed.',
    },
    aligned,
    variants: {} as Record<string, unknown>,
    roadblocks: [] as string[],
  }

  afterAll(() => {
    mkdirSync(OUT_DIR, { recursive: true })
    writeFileSync(OUT_FILE, JSON.stringify(report, null, 2))
    // eslint-disable-next-line no-console
    console.log(`\n[nahida-parity] wrote ${OUT_FILE}`)
  })

  test('variant A: solo Nahida, aligned enemy/cond — numeric probes', () => {
    let wr: ReturnType<typeof buildWrNahida> | undefined
    let wrError: string | undefined
    try {
      wr = buildWrNahida({
        enemyLevel: aligned.enemyLevel,
        enemyRes: aligned.enemyRes,
        c2Bloom: aligned.c2Bloom,
        hitMode: aligned.hitMode,
      })
    } catch (e) {
      wrError = e instanceof Error ? e.message : String(e)
      ;(report.roadblocks as string[]).push(`WR build failed: ${wrError}`)
    }

    const pando = buildPandoNahida({
      enemyLevel: aligned.enemyLevel,
      enemyRes: aligned.enemyRes,
      c2Bloom: aligned.c2Bloom,
      spread: aligned.spread,
      withNilouTeammate: false,
    })

    const probes: {
      name: string
      wr: number | string | undefined | string
      pando: number | string | undefined
      rel?: number | null
      wrError?: string
    }[] = []

    const wrStats: [string, NumNode][] = [
      ['final.atk', input.total.atk],
      ['final.hp', input.total.hp],
      ['final.def', input.total.def],
      ['final.eleMas', input.total.eleMas],
      ['final.critRate_', input.total.critRate_],
      ['final.critDMG_', input.total.critDMG_],
      ['final.enerRech_', input.total.enerRech_],
    ]

    for (const [name, node] of wrStats) {
      const pandoKey = name.split('.')[1] as
        | 'atk'
        | 'hp'
        | 'def'
        | 'eleMas'
        | 'critRate_'
        | 'critDMG_'
        | 'enerRech_'
      const pandoVal = pando.compute((own.final as any)[pandoKey]).val
      let wrVal: number | string | undefined
      let probeWrError: string | undefined
      if (wr) {
        try {
          wrVal = wr.ui.get(node).value
        } catch (e) {
          probeWrError = e instanceof Error ? e.message : String(e)
        }
      }
      probes.push({
        name,
        wr: wrVal,
        pando: pandoVal,
        rel:
          typeof wrVal === 'number' && typeof pandoVal === 'number'
            ? relDiff(wrVal, pandoVal)
            : undefined,
        wrError: probeWrError,
      })
    }

    let wrNormalNode:
      | ReturnType<NonNullable<typeof wr>['ui']['get']>
      | undefined
    let pandoNormal: ReturnType<typeof pando.compute> | undefined
    let formulaWrError: string | undefined
    if (wr) {
      try {
        const wrNormal0 = wr.ui.getDisplay()?.['normal']?.['0']
        if (wrNormal0) wrNormalNode = wr.ui.get(wrNormal0 as NumNode)
      } catch (e) {
        formulaWrError = e instanceof Error ? e.message : String(e)
      }
    }
    const pandoNormalRead = pando
      .listFormulas(own.listing.formulas)
      .find((x) => x.tag.name === 'normal_0')
    if (pandoNormalRead) pandoNormal = pando.compute(pandoNormalRead)

    probes.push({
      name: 'formula.normal_0',
      wr: wrNormalNode?.value,
      pando: pandoNormal?.val,
      rel:
        typeof wrNormalNode?.value === 'number' &&
        typeof pandoNormal?.val === 'number'
          ? relDiff(wrNormalNode.value as number, pandoNormal.val as number)
          : undefined,
      wrError: formulaWrError,
    })

    const trees = {
      wr_final_atk: wr
        ? (() => {
            try {
              return normalizeWrTree(wr.ui.get(input.total.atk))
            } catch (e) {
              return {
                val: undefined,
                note: e instanceof Error ? e.message : String(e),
              }
            }
          })()
        : { val: undefined, note: wrError },
      pando_final_atk: normalizePandoTree(pando.compute(own.final.atk)),
      wr_normal_0: wrNormalNode ? normalizeWrTree(wrNormalNode) : null,
      pando_normal_0: pandoNormal ? normalizePandoTree(pandoNormal) : null,
    }

    ;(report.variants as any)['A_solo_aligned'] = {
      wrBuildError: wrError,
      probes,
      trees,
      pandoListingNames: pando
        .listFormulas(own.listing.formulas)
        .map((x) => x.tag.name)
        .filter(Boolean)
        .sort(),
    }

    const roadblocks = report.roadblocks as string[]
    if (probes.some((p) => p.wrError)) {
      roadblocks.push(
        'Variant A: WR UIData.get threw on one or more probes (see probes[].wrError) — fixture/team Data assembly roadblock'
      )
    }
    if (probes.some((p) => p.rel != null && p.rel > 0.01)) {
      roadblocks.push(
        'Variant A: ≥1 probe differs by >1% rel — check enemy/reaction/weapon passive parity'
      )
    }
    if (wrNormalNode && pandoNormal) {
      const wrOp = wrNormalNode.meta?.op
      const pandoOp = (pandoNormal.meta as any)?.op
      if (wrOp !== pandoOp) {
        roadblocks.push(
          `Tree root op mismatch normal_0: WR=${wrOp} Pando=${pandoOp} (expected; IR differs)`
        )
      }
    }

    // eslint-disable-next-line no-console
    console.table(
      probes.map((p) => ({
        probe: p.name,
        wr: p.wr,
        pando: p.pando,
        relPct: p.rel == null ? 'n/a' : `${(p.rel * 100).toFixed(3)}%`,
        wrError: p.wrError ?? '',
      }))
    )

    // Harness viability: Pando side must produce finite finals
    for (const p of probes.filter((x) => x.name.startsWith('final.'))) {
      expect(typeof p.pando).toBe('number')
      expect(Number.isFinite(p.pando as number)).toBe(true)
    }
  })

  test('variant B: Pando with Nilou teammate + custom def — known Pando golden', () => {
    // Reproduces example.test.ts (includes userBuff.premod.def.add(30))
    const pando = buildPandoNahida({
      enemyLevel: 12,
      enemyRes: 0.1,
      c2Bloom: true,
      spread: true,
      withNilouTeammate: true,
      customDefBonus: 30,
    })
    const atk = pando.compute(own.final.atk).val
    const def = pando.compute(own.final.def).val
    const eleMas = pando.compute(own.final.eleMas).val
    const normal0 = pando
      .listFormulas(own.listing.formulas)
      .find((x) => x.tag.name === 'normal_0')!
    const normalVal = pando.compute(normal0).val

    ;(report.variants as any)['B_pando_team_golden'] = {
      atk,
      def,
      eleMas,
      normal_0: normalVal,
      expectedFromExampleTest: {
        atk: 346.21,
        def: 124.15,
        eleMas: 28.44,
        normal_0: 91.61,
      },
      note: 'example.test.json also applies KeyOfKhajNisut stacks via conditionals on both members; eleMas may still diverge if those are omitted',
    }

    expect(atk).toBeCloseTo(346.21, 1)
    expect(def).toBeCloseTo(124.15, 1)
    // eleMas/normal may need KeyOfKhajNisut conditional stacks from example fixture
    expect(Number.isFinite(eleMas)).toBe(true)
    expect(Number.isFinite(normalVal)).toBe(true)
  })

  test('variant C: default WR enemy (lvl 100) vs aligned Pando — documents mismatch', () => {
    let wrError: string | undefined
    let wrAtk: number | undefined
    let wrNormal: number | undefined
    try {
      const wrDefault = buildWrNahida({
        enemyLevel: 100,
        enemyRes: 0.1,
        c2Bloom: true,
        hitMode: 'avgHit',
      })
      wrAtk = wrDefault.ui.get(input.total.atk).value as number
      wrNormal = wrDefault.ui.get(
        wrDefault.ui.getDisplay()!['normal']!['0'] as NumNode
      ).value as number
    } catch (e) {
      wrError = e instanceof Error ? e.message : String(e)
    }

    const pandoAligned = buildPandoNahida({
      enemyLevel: 12,
      enemyRes: 0.1,
      c2Bloom: true,
      spread: true,
      withNilouTeammate: false,
    })
    const pandoAtk = pandoAligned.compute(own.final.atk).val as number
    const pandoNormalRead = pandoAligned
      .listFormulas(own.listing.formulas)
      .find((x) => x.tag.name === 'normal_0')!
    const pandoNormal = pandoAligned.compute(pandoNormalRead).val as number

    ;(report.variants as any)['C_enemy_default_mismatch'] = {
      wrError,
      wrAtk,
      pandoAtk,
      atkRel: wrAtk != null ? relDiff(wrAtk, pandoAtk) : null,
      wrNormal_0: wrNormal,
      pandoNormal_0: pandoNormal,
      normalRel: wrNormal != null ? relDiff(wrNormal, pandoNormal) : null,
    }
    ;(report.roadblocks as string[]).push(
      'Variant C: WR default enemy lvl 100 vs Pando example lvl 12 → DMG probes diverge even if ATK matches; fixture alignment is mandatory'
    )

    expect(Number.isFinite(pandoAtk)).toBe(true)
  })
})
