import {
  allElementKeys,
  type CharacterKey,
  type ElementKey,
} from '@genshin-optimizer/gi/consts'

export type CondI18nRef = {
  ns: string
  key: string
  values?: Record<string, string | number>
}

type CondSrc =
  | { ch: string; values?: Record<string, string | number> }
  | { chg: string; values?: Record<string, string | number> }
  | { sheet: string; values?: Record<string, string | number> }

/** Formula cond name → locale, matching WR `name:` / `ct.ch()` / `st()`. */
const byChar: Partial<Record<CharacterKey, Record<string, CondSrc>>> = {
  Albedo: {
    a1LockSilver: { ch: 'a1LockCond' },
    burstUsed: { sheet: 'afterUse.burst' },
    c1LockAfterSkill: { sheet: 'afterUse.skill' },
    c2Stacks: { ch: 'c2Stacks' },
    c4LockAfterJump: { ch: 'c4JumpCond' },
    c6Crystallize: { sheet: 'protectedByShieldCrystalOrLunar' },
    c6LockAfterDestroy: { ch: 'c6Cond' },
    lockCreateSilver: { ch: 'createSilver' },
    lockCreateSolar: { ch: 'createSolar' },
    lockHomework: { sheet: 'hexerei.homeworkDone' },
    p1EnemyHp: { sheet: 'enemyLessPercentHP', values: { percent: 50 } },
    skillInField: { sheet: 'activeCharField' },
  },
  Amber: {
    A4: { sheet: 'hitOp.weakSpot' },
    C6: { ch: 'c6CondName' },
  },
  AratakiItto: {
    burst: { sheet: 'afterUse.burst' },
    constellation4: { ch: 'c4.name' },
    passive1: { ch: 'a1.name' },
  },
  Barbara: {
    skill: { ch: 'passive1.cond' },
    c2: { ch: 'constellation2.cond' },
  },
  Chongyun: {
    asc4: { ch: 'asc4Cond' },
    c6: { ch: 'constellation6' },
    skill: { sheet: 'activeCharField' },
  },
  Eula: {
    Grimheart: { chg: 'skill.description.6' },
    grimheartConsumed: { ch: 'c1C.name' },
    LightfallSword: { ch: 'burstC.name' },
    LightfallSwordC4: {
      sheet: 'enemyLessPercentHP',
      values: { percent: 50 },
    },
    stack1: { sheet: 'stack', values: { count: 1 } },
    stack2: { sheet: 'stack', values: { count: 2 } },
    TidalIllusion: { ch: 'c1C.name' },
  },
  Diluc: {
    Burst: { sheet: 'afterUse.burst' },
    DilucC1: { sheet: 'enemyGreaterPercentHP', values: { percent: 50 } },
    DilucC2: { sheet: 'hitOp.self' },
    DilucC6: { sheet: 'afterUse.skill' },
  },
  Diona: {
    Ascension1: { ch: 'a1shielded' },
    Constellation6: { sheet: 'activeCharField' },
    higher: { sheet: 'greaterPercentHP', values: { percent: 50 } },
    lockRevelation: { sheet: 'revelation.done' },
    lockStellarRadianceSc: { sheet: 'elementalReaction.stellar.radiance' },
    lower: { sheet: 'lessEqPercentHP', values: { percent: 50 } },
    on: { sheet: 'elementalReaction.polestar.inside' },
    ss: { sheet: 'elementalReaction.stellarswirl' },
  },
  Bennett: {
    activeInArea: { sheet: 'activeCharField' },
    underHP: { sheet: 'lessPercentHP', values: { percent: 70 } },
  },
  Beidou: {
    Ascension4: { ch: 'tidecallerMaxDmg' },
    burst: { ch: 'duringBurst' },
    lockRevelation: { sheet: 'revelation.done' },
    lockStellarRadianceSc: { sheet: 'elementalReaction.polestar.inside' },
  },
  Fischl: {
    lockC6Oz: { ch: 'c6Cond' },
    lockEcLc: { ch: 'lockEcLcCond' },
    lockHomework: { sheet: 'hexerei.homeworkDone' },
    lockOverload: { sheet: 'elementalReaction.team.overload' },
  },
  Jean: {
    c1: { ch: 'c1CondName' },
    c2: { sheet: 'getElementalOrbParticle' },
    c4: { sheet: 'opponentsField' },
    c6: { sheet: 'activeCharField' },
  },
  HuTao: {
    ButterflysEmbrace: { ch: 'constellation6.condName' },
    FlutterBy: { ch: 'paramita.end' },
    GardenOfEternalRest: { ch: 'constellation4.condName' },
    GuideToAfterlifeVoyage: { ch: 'paramita.enter' },
    SanguineRouge: { sheet: 'lessEqPercentHP', values: { percent: 60 } },
  },
  KaedeharaKazuha: {
    burstAbsorption: { sheet: 'eleAbsor' },
    c2: { ch: 'c2' },
    c2p: { sheet: 'activeCharField' },
    c6: { ch: 'c6.after' },
    skillAbsorption: { sheet: 'eleAbsor' },
    swirlcryo: { sheet: 'swirlReaction.cryo' },
    swirlelectro: { sheet: 'swirlReaction.electro' },
    swirlhydro: { sheet: 'swirlReaction.hydro' },
    swirlpyro: { sheet: 'swirlReaction.pyro' },
  },
  Kaeya: {
    CryoC1: { sheet: 'enemyAffected.cryo' },
  },
  KamisatoAyaka: {
    afterApplySprint: { ch: 'afterSprintCryo' },
    afterBurst: { ch: 'dmgBySnowflake' },
    afterSkillA1: { sheet: 'afterUse.skill' },
    afterSprint: { sheet: 'afterSprint' },
    C6: { ch: 'c6Active' },
  },
  Keqing: {
    afterBurst: { sheet: 'afterUse.burst' },
    afterReact: { sheet: 'elementalReaction.electro' },
    afterRecast: { ch: 'recast' },
    c6Stack: { sheet: 'hitOp.normalChargedSkillBurst' },
  },
  Klee: {
    BlazingDelight: { ch: 'c6CondName' },
    ExplosiveFrags: { ch: 'c2CondName' },
    lockBadge: { ch: 'lockedCond' },
    lockC1: { ch: 'c1Cond' },
    lockHomework: { sheet: 'hexerei.homeworkDone' },
  },
  KujouSara: {
    TenguJuuraiAmbush: { ch: 'skill.ambush' },
    c6: { ch: 'c6.electroCritDmg' },
  },
  KukiShinobu: {
    c6Trigger: { sheet: 'lessPercentHP', values: { percent: 25 } },
    underHP: { sheet: 'lessEqPercentHP', values: { percent: 50 } },
  },
  Lisa: {
    LisaA4: { ch: 'a4C' },
    LisaC2: { ch: 'c2C' },
  },
  Mona: {
    Omen: { ch: 'omen' },
    ProphecyOfSubmersion: { ch: 'hitOp.affectedByOmen' },
    RhetoricsOfCalamitas: { ch: 'uponSprint' },
    lockC2Charged: { sheet: 'hitOp.charged' },
    lockHomework: { sheet: 'hexerei.homeworkDone' },
    lockStacks: { ch: 'lockStacksCond' },
  },
  Nahida: {
    partyInBurst: { ch: 'partyInBurst' },
    a1ActiveInBurst: { chg: 'passive1.name' },
    c2Bloom: { ch: 'c2.bloomCondName' },
    c2QSA: { ch: 'c2.qasCondName' },
    c4Count: { ch: 'c4CondName' },
  },
  Nilou: {
    a1AfterSkill: { ch: 'passive1.underChaliceEffect' },
    a1AfterHit: { ch: 'passive1.condName' },
    c2Hydro: { sheet: 'hitOp.hydro' },
    c2Dendro: { sheet: 'hitOp.dendro' },
    c4AfterPirHit: { ch: 'c4.condName' },
  },
  Ningguang: {
    Ascension4: { ch: 'a4toggle' },
    Constellation4: { ch: 'c4toggle' },
  },
  Noelle: {
    SweepingTime: { chg: 'burst.name' },
  },
  Qiqi: {
    lockRevelation: { sheet: 'revelation.done' },
    lockStellarRadianceSc: { sheet: 'elementalReaction.polestar.inside' },
  },
  RaidenShogun: {
    InBurst: { ch: 'burst.active' },
    burstResolve: { ch: 'burst.resolves' },
    c4: { ch: 'c4.expires' },
    skillEye: { ch: 'skill.eye' },
    skillEyeTeam: { ch: 'skill.partyCost' },
  },
  Venti: {
    burstAbsorption: { sheet: 'eleAbsor' },
    c2: { chg: 'constellation2.name' },
    c4: { sheet: 'getElementalOrbParticle' },
    c6: { ch: 'c6' },
    lockBurstSwirl: { ch: 'lockCond' },
    lockC4SkillBurst: { sheet: 'afterUse.skillOrBurst' },
    lockHomework: { sheet: 'hexerei.homeworkDone' },
  },
  Wriothesley: {
    a4EdictStacks: { ch: 'a4Cond' },
    lockRevelation: { sheet: 'revelation.done' },
    lockStellarRadianceSc: { sheet: 'elementalReaction.polestar.inside' },
  },
  Razor: {
    A4: { sheet: 'lessPercentEnergy', values: { percent: 50 } },
    C1: { sheet: 'getElementalOrbParticle' },
    C2: { sheet: 'enemyLessPercentHP', values: { percent: 30 } },
    C4: { ch: 'opHitWithClawAndThunder' },
    TheWolfWithin: { chg: 'burst.description.3' },
    lockC6Sigil: { ch: 'c6LockCond' },
    lockHomework: { sheet: 'hexerei.homeworkDone' },
  },
  Rosaria: {
    DilucC6: { sheet: 'hitOp.skill' },
    RosariaA1: { ch: 'a1' },
    RosariaA4: { sheet: 'afterUse.burst' },
    RosariaC1: { sheet: 'hitOp.crit' },
  },
  Shenhe: {
    asc1: { sheet: 'activeCharField' },
    asc4: { sheet: 'afterUse.skillPress' },
    asc4Hold: { sheet: 'afterUse.skillHold' },
    burst: { sheet: 'opponentsField' },
    c4: { ch: 'c4' },
    quill: { ch: 'quill' },
  },
  Tighnari: {
    after: { sheet: 'afterUse.burst' },
    c2EnemyField: { sheet: 'opponentsField' },
    p1AfterWreath: { ch: 'p1Cond' },
    react: { ch: 'c4ReactCond' },
  },
  Thoma: {
    c6AfterBarrier: { ch: 'refreshBarrier' },
    p1BarrierStacks: { ch: 'refreshBarrier' },
  },
  Xiangling: {
    afterPyronado: { ch: 'duringPyronado' },
  },
  Xingqiu: {
    skill: { ch: 'skillCond' },
    burst: { ch: 'burstCond' },
    c2: { ch: 'c2Cond' },
  },
  Yanfei: {
    afterBurst: { sheet: 'afterUse.burst' },
    c2EnemyHp: { sheet: 'enemyLessPercentHP', values: { percent: 50 } },
    p1Seals: { ch: 'passive1.sealsConsumed' },
  },
  Xinyan: {
    c1Crit: { sheet: 'hitOp.crit' },
    c4Burst: { ch: 'c4.swingHit' },
    c6Charged: { ch: 'c6.duringCharge' },
    p2Shield: { ch: 'p2.activeShield' },
  },
  Yaoyao: {
    adeptalLegacy: { ch: 'inLegacy' },
    c1Explode: { ch: 'inExplosionAoE' },
    c4AfterSkillBurst: { sheet: 'afterUse.skillOrBurst' },
  },
  Yelan: {
    a4Stacks: { sheet: 'afterUse.burst' },
    c4Stacks: { ch: 'c4.condName' },
  },
  Zhongli: {
    p1: { ch: 'p1cond' },
    skill: { ch: 'skill.nearShield' },
  },
}

const byName: Record<string, CondSrc> = {
  stack: { sheet: 'stacks' },
  stacks: { sheet: 'stacks' },
}

function charOverlayNs(characterKey: CharacterKey) {
  return `char_${characterKey}`
}

function charGenNs(characterKey: CharacterKey) {
  return characterKey === 'Somnia'
    ? charOverlayNs(characterKey)
    : `${charOverlayNs(characterKey)}_gen`
}

function toRef(characterKey: CharacterKey, src: CondSrc): CondI18nRef {
  if ('ch' in src)
    return {
      ns: charOverlayNs(characterKey),
      key: src.ch,
      values: src.values,
    }
  if ('chg' in src)
    return {
      ns: charGenNs(characterKey),
      key: src.chg,
      values: src.values,
    }
  return src.values
    ? { ns: 'sheet', key: src.sheet, values: src.values }
    : { ns: 'sheet', key: src.sheet }
}

function isElementKey(val: string): val is ElementKey {
  return (allElementKeys as readonly string[]).includes(val)
}

function patternRefs(name: string): CondI18nRef[] {
  const react = /^react_(.+)$/.exec(name)
  if (react && isElementKey(react[1]))
    return [{ ns: 'sheet', key: `elementalReaction.${react[1]}` }]
  return []
}

/** Unique i18n lookups: per-char `ch()` / `chg()` then shared `st()`. */
export function charCondI18nCandidates(
  characterKey: CharacterKey,
  name: string
): CondI18nRef[] {
  const charNs = charOverlayNs(characterKey)
  const refs: CondI18nRef[] = []
  const seen = new Set<string>()
  const add = (ref: CondI18nRef | undefined) => {
    if (!ref) return
    const id = `${ref.ns}:${ref.key}`
    if (seen.has(id)) return
    seen.add(id)
    refs.push(ref)
  }

  const mapped = byChar[characterKey]?.[name]
  if (mapped) add(toRef(characterKey, mapped))
  for (const ref of patternRefs(name)) add(ref)
  add({ ns: charNs, key: name })
  add({
    ns: charNs,
    key: `cond${name.charAt(0).toUpperCase()}${name.slice(1)}`,
  })
  const generic = byName[name]
  if (generic) add(toRef(characterKey, generic))
  add({ ns: 'sheet', key: name })
  return refs
}

export function humanizeCharCondName(name: string): string {
  return name
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/(\d+)([A-Za-z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d+)/g, '$1 $2')
    .trim()
}
