import { IFormulaSheet } from "../../../Types/character"
import { basicDMGFormula } from "../../../Util/FormulaUtil"
import {  } from "../../../Util/DataminedUtil"
import skillParam_gen from './skillParam_gen.json'


export const data = {
  normal: {
    hitArr: [
      (skillParam_gen.auto[0]),//1
      (skillParam_gen.auto[1]),//2
      (skillParam_gen.auto[2]),//3
      // (skillParam_gen.auto[3]),
      (skillParam_gen.auto[4]),//4
      (skillParam_gen.auto[5]),//5
      // (skillParam_gen.auto[6]),
    ]
  },
  charged: {
    hit1: (skillParam_gen.auto[7]),
    hit2: (skillParam_gen.auto[8]),
    stam: skillParam_gen.auto[9][0]
  },
  plunging: {
    dmg: (skillParam_gen.auto[10]),
    low: (skillParam_gen.auto[11]),
    high: (skillParam_gen.auto[12]),
  },
  skill: {
    hit1: (skillParam_gen.skill[0]),
    hit2: (skillParam_gen.skill[1]),
    dmgRed: (skillParam_gen.skill[2]),
    duration: skillParam_gen.skill[3][0],
    cd: skillParam_gen.skill[4][0],
  },
  burst: {
    dmg: (skillParam_gen.burst[0]),
    duration: skillParam_gen.burst[1][0],
    cd: skillParam_gen.burst[2][0],
    cost: skillParam_gen.burst[3][0],
  },
  passive1: {},
  passive2: {
    hydro_dmg_: 0.20
  },
  passive3: {},
  constellation1: {},
  constellation2: {
    hydro_enemyRes_: -0.15,
    skill_duration: 3
  },
  constellation3: {},
  constellation4: {
    skill_dmg_: 0.50
  },
  constellation5: {},
  constellation6: {},
}

