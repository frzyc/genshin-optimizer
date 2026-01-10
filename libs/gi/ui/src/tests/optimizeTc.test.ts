import { SandboxStorage } from '@genshin-optimizer/common/database'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { BuildTc, LoadoutDatum } from '@genshin-optimizer/gi/db'
import { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { optimizeTcUsingNodes } from '@genshin-optimizer/gi/solver-tc'
import {
  getBuildTcArtifactData,
  getBuildTcWeaponData,
  getTeamDataCalc,
  optimizeNodesForScaling,
} from '../'

describe('A general optimizeTC usecase', () => {
  it('generate correct distribution', () => {
    const database = new ArtCharDatabase(1, new SandboxStorage({}))
    const buildTcId = database.buildTcs.new({
      name: 'test',
      description: 'test',
      artifact: {
        slots: {
          flower: { level: 20, rarity: 5, statKey: 'hp' },
          plume: { level: 20, rarity: 5, statKey: 'atk' },
          sands: { level: 20, rarity: 5, statKey: 'hp_' },
          goblet: { level: 20, rarity: 5, statKey: 'pyro_dmg_' },
          circlet: { level: 20, rarity: 5, statKey: 'critDMG_' },
        },
        substats: {
          type: 'mid',
          stats: {
            hp: 507.88,
            hp_: 9.91,
            atk: 33.07,
            atk_: 9.91,
            def: 39.349999999999994,
            def_: 12.39,
            eleMas: 39.63,
            enerRech_: 49.545, // very close to 50%
            critRate_: 6.609999999999999,
            critDMG_: 13.209999999999999,
          },
          rarity: 5,
        },
        sets: { CrimsonWitchOfFlames: 4 },
      },
      weapon: { key: 'StaffOfHoma', level: 90, ascension: 6, refinement: 1 },
      optimization: {
        distributedSubstats: 2,
        maxSubstats: {
          hp: 10,
          hp_: 10,
          atk: 10,
          atk_: 10,
          def: 10,
          def_: 10,
          eleMas: 10,
          enerRech_: 10,
          critRate_: 10,
          critDMG_: 10,
        },
      },
    })
    const buildTc: BuildTc = database.buildTcs.get(buildTcId)!
    expect(buildTc).toBeTruthy()
    const characterKey: CharacterKey = 'HuTao'

    database.weapons.new({
      key: 'StaffOfHoma',
      level: 90,
      ascension: 6,
      refinement: 1,
      location: 'HuTao',
      lock: true,
    })
    database.chars.set(characterKey, {
      key: 'HuTao',
      level: 89,
      ascension: 6,

      talent: { auto: 9, skill: 9, burst: 9 },
    })
    database.chars.set('Xingqiu', {
      key: 'Xingqiu',
      level: 89,
      ascension: 6,
      talent: { auto: 9, skill: 9, burst: 9 },
      constellation: 0,
    })
    database.chars.set('Yelan', {
      key: 'Yelan',
      level: 89,
      ascension: 6,
      talent: { auto: 9, skill: 9, burst: 9 },
      constellation: 0,
    })
    database.chars.set('Xiangling', {
      key: 'Xiangling',
      level: 89,
      ascension: 6,
      talent: { auto: 9, skill: 9, burst: 9 },
      constellation: 0,
    })
    const HuTaoTeamCharId = database.teamChars.new(characterKey, {
      bonusStats: {},
      conditional: {
        StaffOfHoma: { RecklessCinnabar: 'on' },
        HuTao: { GuideToAfterlifeVoyage: 'on', SanguineRouge: 'on' },
        ShimenawasReminiscence: {},
        CrimsonWitchOfFlames: { stack: '1' },
        GildedDreams: { passive: 'on' },
        DesertPavilionChronicle: { set4: 'on' },
        DragonsBane: { BaneOfFlameAndWater: 'on' },
      },
      infusionAura: '',
      hitMode: 'avgHit',
      reaction: 'vaporize',
    })
    const loadoutData = [
      { teamCharId: HuTaoTeamCharId },
      {
        teamCharId: database.teamChars.new('Xingqiu', {
          conditional: {
            NoblesseOblige: { set4: 'on' },
            Xingqiu: { c2: 'on', skill: 'on' },
          },
        }),
      },
      {
        teamCharId: database.teamChars.new('Yelan', {
          conditional: { Yelan: { a4Stacks: '9' } },
        }),
      },
      {
        teamCharId: database.teamChars.new('Xiangling', {
          conditional: {
            Xiangling: {
              afterGuobaHit: 'afterGuobaHit',
              afterPyronado: 'duringPyronado',
              afterChili: 'afterChili',
            },
          },
        }),
      },
    ] as LoadoutDatum[]
    const teamId = database.teams.new({
      loadoutData,
    })
    expect(teamId).toBeTruthy()
    const overrideArt = getBuildTcArtifactData(buildTc)
    const overrideWeapon = getBuildTcWeaponData(buildTc)
    const teamData = getTeamDataCalc(
      database,
      teamId,
      'F',
      HuTaoTeamCharId,
      0,
      { [HuTaoTeamCharId]: { art: overrideArt, weapon: overrideWeapon } }
    )!

    expect(teamData).toBeTruthy()
    const statFilters = {
      '["basic","enerRech_"]': [
        {
          value: 150,
          disabled: false,
        },
      ],
    }
    const { nodes, valueFilter } = optimizeNodesForScaling(
      teamData,
      characterKey,
      ['normal', '0'],
      statFilters
    )
    expect(nodes).toBeTruthy()
    nodes &&
      optimizeTcUsingNodes(nodes, valueFilter, buildTc, (data) => {
        if (data.resultType !== 'finalize') return
        expect(data.maxBufferRolls).toEqual({
          atk: 0,
          atk_: 0,
          critDMG_: 0,
          critRate_: 1, // dmg assignment
          eleMas: 0,
          enerRech_: 1, // assigned to enerRech for 150
          hp: 0,
          hp_: 0,
          other: 0,
        })
      })
  })
})
