const char = {
  // Albedo,
  // Amber,
  // Barbara,
  // Beidou,
  // Bennett,
  // Chongyun,
  // Diluc,
  // Diona,
  Eula: {
    skill: {
      brandDMG: [3765549071, "skillParam"],
      grimheartDuration: [164817062, "skillParam"],
    }
  },
  // Fischl,
  // Ganyu,
  // HuTao,
  // Jean,
  KaedeharaKazuha: {
    burst: {
      name: 2015878197,
      description: [1543060392, "paragraph"],
      slashdmg: [439659606, "skillParam"],
    },
  },
  // Kaeya,
  KamisatoAyaka: {
    burst: {
      cutting: [373269062, "skillParam"],
      bloom: [2543020158, "skillParam"],
    }
  },
  // KamisatoAyato
  // Keqing,
  // Klee,
  // Lisa,
  // Mona,
  // Ningguang,
  Noelle: {
    skill: {
      triggerChance: [3971383039, "skillParam"],
    },
    burst: {
      atkBonus: [4151293863, "skillParam"]
    },
  },
  // Qiqi,
  // Razor,
  // Rosaria,
  // Sucrose,
  // Tartaglia,
  Traveler: {
    electro: {
      skill: {
        enerRegen: [2165261751, "skillParam"],
        enerRechInc: [3328414367, "skillParam"],
      },
      burst: {
        thunderDMG: [3560985918, "skillParam"]
      }
    }
  },
  // Venti,
  // Xiao,
  // Xiangling,
  // Xingqiu,
  // Xinyan,
  // Yanfei,
  Zhongli: {
    constellationName: 2721221067
  }
} as const
export default char
