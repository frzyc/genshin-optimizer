import skillParam_gen from './skillParam_gen.json'


export const data = {
  normal: {
    hitArr: [
      skillParam_gen.auto[0],//x2
      skillParam_gen.auto[1],
      skillParam_gen.auto[2],
      skillParam_gen.auto[3],//x2
      skillParam_gen.auto[4],
    ]
  },
  charged: {
    hit: skillParam_gen.auto[5],
    full: skillParam_gen.auto[6],
    kindling: skillParam_gen.auto[7],
  },
  plunging: {
    dmg: skillParam_gen.auto[8],
    low: skillParam_gen.auto[9],
    high: skillParam_gen.auto[10],
  },
  skill: {
    dmg_: skillParam_gen.skill[3],
    duration: 10,
    cd: 18
  },
  burst: {
    dmg: skillParam_gen.burst[0],
    exp: skillParam_gen.burst[1],
    duration: 10,
    cd: 15,
    cost: 60
  },
  passive1: {
    pyro_dmg_: skillParam_gen.passive1[0][0],
    duration: skillParam_gen.passive1[1][0],
    maxStacks: 10,
  },
  passive2: {
    fixed_atk_: skillParam_gen.passive2[0][0],
    var_atk_: skillParam_gen.passive2[1][0],
    duration: skillParam_gen.passive2[2][0],
  },
  constellation1: {
    burst_durationInc: skillParam_gen.constellation1[0],
    atk_: skillParam_gen.constellation1[1],
    duration: skillParam_gen.constellation1[2]
  },
  constellation2: {
    pyro_dmg_: skillParam_gen.constellation2[0],
    duration: skillParam_gen.constellation2[1],
  },
  constellation3: {},
  constellation4: {
    cdRed: skillParam_gen.constellation4[0]
  },
  constellation5: {},
  constellation6: {
    chance: skillParam_gen.constellation6[0],
    dmg_: skillParam_gen.constellation6[1],
  },
} 