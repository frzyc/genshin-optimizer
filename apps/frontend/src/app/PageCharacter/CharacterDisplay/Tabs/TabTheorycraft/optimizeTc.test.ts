import { SandboxStorage } from '@genshin-optimizer/common/database'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { ICharTC } from '@genshin-optimizer/gi/db'
import { ArtCharDatabase } from '@genshin-optimizer/gi/db'
import { getTeamDataCalc } from '../../../../ReactHooks/useTeamData'
import {
  getArtifactData,
  getWeaponData,
  optimizeTcGetNodes,
  optimizeTcUsingNodes,
} from './optimizeTc'

describe('A general optimizeTC usecase', () => {
  it('generate correct distribution', () => {
    const charTC: ICharTC = {
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
        target: ['normal', '0'],
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
        minTotal: { enerRech_: 150 },
      },
    }
    const characterKey: CharacterKey = 'HuTao'
    const database = new ArtCharDatabase(1, new SandboxStorage({}))
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
      hitMode: 'avgHit',
      reaction: 'vaporize',
      conditional: {
        StaffOfHoma: { RecklessCinnabar: 'on' },
        HuTao: { GuideToAfterlifeVoyage: 'on', SanguineRouge: 'on' },
        ShimenawasReminiscence: {},
        CrimsonWitchOfFlames: { stack: '1' },
        GildedDreams: { passive: 'on' },
        DesertPavilionChronicle: { set4: 'on' },
        DragonsBane: { BaneOfFlameAndWater: 'on' },
      },
      bonusStats: {},
      enemyOverride: {},
      talent: { auto: 9, skill: 9, burst: 9 },
      infusionAura: '',
      constellation: 0,
      team: ['Xingqiu', 'Yelan', 'Xiangling'],
      teamConditional: {
        Xiangling: {
          Xiangling: {
            afterGuobaHit: 'afterGuobaHit',
            afterPyronado: 'duringPyronado',
            afterChili: 'afterChili',
          },
        },
        Xingqiu: {
          NoblesseOblige: { set4: 'on' },
          Xingqiu: { c2: 'on', skill: 'on' },
        },
        Yelan: { Yelan: { a4Stacks: '9' } },
        Zhongli: { Zhongli: { skill: 'on', p1: '5' } },
        KaedeharaKazuha: {
          ViridescentVenerer: { swirlpyro: 'pyro' },
          KaedeharaKazuha: { swirlpyro: 'pyro' },
        },
        Diona: {
          NoblesseOblige: { set4: 'on' },
          Diona: { Ascension1: 'on', Constellation6: 'higher' },
        },
      },
      compareData: false,
      customMultiTarget: [],
    })

    const overrideArt = getArtifactData(charTC)
    const overrideWeapon = getWeaponData(charTC)
    const teamData = getTeamDataCalc(
      database,
      characterKey,
      0,
      'F',
      overrideArt,
      overrideWeapon
    )

    const { nodes } = optimizeTcGetNodes(teamData, characterKey, charTC)

    optimizeTcUsingNodes(nodes, charTC, (data) => {
      if (data.resultType !== 'finalize') return
      console.log('TEST')
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
