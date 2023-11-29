type Tag = Record<string, string>

export type IConditionalData =
  | IBoolConditionalData
  | IListConditionalData
  | INumConditionalData
export type IFormulaData = {
  src: string // entity
  name: string // formula name
  tag: Tag // tag used to access value
}

/// Conditional whose values are True (1.0) and False (0.0)
export type IBoolConditionalData = {
  type: 'bool' // type discriminator
  src: string // entity
  name: string // conditional name
  tag: Tag // tag used to access value
}
/// Conditional whose values are those in the list. When inputting the
/// entry, use the (0-based) position in the list
export type IListConditionalData = {
  type: 'list' // type discriminator
  src: string // entity
  name: string // conditional name
  tag: Tag // tag used to access value

  list: [string] // feasible values
}
/// Conditional whose values are regular numbers
export type INumConditionalData = {
  type: 'num' // type discriminator
  src: string // entity
  name: string // conditional name
  tag: Tag // tag used to access value

  int_only: boolean // whether the value must be an integer
  min?: number // smallest feasible value, if applicable
  max?: number // largest feasible value, if applicable
}

export const conditionals = {
  NoblesseOblige: {
    set4: {
      src: 'NoblesseOblige',
      name: 'set4',
      tag: { src: 'NoblesseOblige', name: 'set4' },
      type: 'bool',
    },
  },
  Candace: {
    afterBurst: {
      src: 'Candace',
      name: 'afterBurst',
      tag: { src: 'Candace', name: 'afterBurst' },
      type: 'bool',
    },
    c2AfterSkillHit: {
      src: 'Candace',
      name: 'c2AfterSkillHit',
      tag: { src: 'Candace', name: 'c2AfterSkillHit' },
      type: 'bool',
    },
  },
  Nahida: {
    a1ActiveInBurst: {
      src: 'Nahida',
      name: 'a1ActiveInBurst',
      tag: { src: 'Nahida', name: 'a1ActiveInBurst' },
      type: 'bool',
    },
    c2Bloom: {
      src: 'Nahida',
      name: 'c2Bloom',
      tag: { src: 'Nahida', name: 'c2Bloom' },
      type: 'bool',
    },
    c2QSA: {
      src: 'Nahida',
      name: 'c2QSA',
      tag: { src: 'Nahida', name: 'c2QSA' },
      type: 'bool',
    },
    partyInBurst: {
      src: 'Nahida',
      name: 'partyInBurst',
      tag: { src: 'Nahida', name: 'partyInBurst' },
      type: 'bool',
    },
    c4Count: {
      src: 'Nahida',
      name: 'c4Count',
      tag: { src: 'Nahida', name: 'c4Count' },
      type: 'num',
      int_only: true,
      min: 0,
      max: 4,
    },
  },
  Nilou: {
    a1AfterSkill: {
      src: 'Nilou',
      name: 'a1AfterSkill',
      tag: { src: 'Nilou', name: 'a1AfterSkill' },
      type: 'bool',
    },
    a1AfterHit: {
      src: 'Nilou',
      name: 'a1AfterHit',
      tag: { src: 'Nilou', name: 'a1AfterHit' },
      type: 'bool',
    },
    c4AfterPirHit: {
      src: 'Nilou',
      name: 'c4AfterPirHit',
      tag: { src: 'Nilou', name: 'c4AfterPirHit' },
      type: 'bool',
    },
    c2Hydro: {
      src: 'Nilou',
      name: 'c2Hydro',
      tag: { src: 'Nilou', name: 'c2Hydro' },
      type: 'bool',
    },
    c2Dendro: {
      src: 'Nilou',
      name: 'c2Dendro',
      tag: { src: 'Nilou', name: 'c2Dendro' },
      type: 'bool',
    },
  },
  CalamityQueller: {
    stack: {
      src: 'CalamityQueller',
      name: 'stack',
      tag: { src: 'CalamityQueller', name: 'stack' },
      type: 'num',
      int_only: true,
      min: 0,
      max: 6,
    },
  },
  KeyOfKhajNisut: {
    afterSkillStacks: {
      src: 'KeyOfKhajNisut',
      name: 'afterSkillStacks',
      tag: { src: 'KeyOfKhajNisut', name: 'afterSkillStacks' },
      type: 'num',
      int_only: true,
      min: 0,
      max: 3,
    },
  },
  TulaytullahsRemembrance: {
    timePassive: {
      src: 'TulaytullahsRemembrance',
      name: 'timePassive',
      tag: { src: 'TulaytullahsRemembrance', name: 'timePassive' },
      type: 'num',
      int_only: false,
      min: 0,
      max: 12,
    },
    hitPassive: {
      src: 'TulaytullahsRemembrance',
      name: 'hitPassive',
      tag: { src: 'TulaytullahsRemembrance', name: 'hitPassive' },
      type: 'num',
      int_only: true,
      min: 0,
      max: 5,
    },
  },
}
export const formulas = {
  Candace: {
    normal_0: {
      src: 'Candace',
      name: 'normal_0',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'normal',
        name: 'normal_0',
      },
    },
    normal_1: {
      src: 'Candace',
      name: 'normal_1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'normal',
        name: 'normal_1',
      },
    },
    normal_2: {
      src: 'Candace',
      name: 'normal_2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'normal',
        name: 'normal_2',
      },
    },
    normal_3: {
      src: 'Candace',
      name: 'normal_3',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'normal',
        name: 'normal_3',
      },
    },
    normal_4: {
      src: 'Candace',
      name: 'normal_4',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'normal',
        name: 'normal_4',
      },
    },
    charged: {
      src: 'Candace',
      name: 'charged',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'charged',
        name: 'charged',
      },
    },
    plunging_dmg: {
      src: 'Candace',
      name: 'plunging_dmg',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'plunging',
        name: 'plunging_dmg',
      },
    },
    plunging_low: {
      src: 'Candace',
      name: 'plunging_low',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'plunging',
        name: 'plunging_low',
      },
    },
    plunging_high: {
      src: 'Candace',
      name: 'plunging_high',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'plunging',
        name: 'plunging_high',
      },
    },
    skill_basic: {
      src: 'Candace',
      name: 'skill_basic',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'skill',
        name: 'skill_basic',
      },
    },
    skill_charged: {
      src: 'Candace',
      name: 'skill_charged',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'skill',
        name: 'skill_charged',
      },
    },
    burst_skill: {
      src: 'Candace',
      name: 'burst_skill',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'burst',
        name: 'burst_skill',
      },
    },
    burst_wave: {
      src: 'Candace',
      name: 'burst_wave',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'burst',
        name: 'burst_wave',
      },
    },
    skill_shield: {
      src: 'Candace',
      name: 'skill_shield',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'shield',
        src: 'Candace',
        name: 'skill_shield',
      },
    },
    skill_hydroShield: {
      src: 'Candace',
      name: 'skill_hydroShield',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'shield',
        src: 'Candace',
        ele: 'hydro',
        name: 'skill_hydroShield',
      },
    },
    c6: {
      src: 'Candace',
      name: 'c6',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Candace',
        move: 'burst',
        name: 'c6',
      },
    },
  },
  Nahida: {
    normal_0: {
      src: 'Nahida',
      name: 'normal_0',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'normal',
        name: 'normal_0',
      },
    },
    normal_1: {
      src: 'Nahida',
      name: 'normal_1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'normal',
        name: 'normal_1',
      },
    },
    normal_2: {
      src: 'Nahida',
      name: 'normal_2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'normal',
        name: 'normal_2',
      },
    },
    normal_3: {
      src: 'Nahida',
      name: 'normal_3',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'normal',
        name: 'normal_3',
      },
    },
    charged: {
      src: 'Nahida',
      name: 'charged',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'charged',
        name: 'charged',
      },
    },
    plunging_dmg: {
      src: 'Nahida',
      name: 'plunging_dmg',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'plunging',
        name: 'plunging_dmg',
      },
    },
    plunging_low: {
      src: 'Nahida',
      name: 'plunging_low',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'plunging',
        name: 'plunging_low',
      },
    },
    plunging_high: {
      src: 'Nahida',
      name: 'plunging_high',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'plunging',
        name: 'plunging_high',
      },
    },
    skill_press: {
      src: 'Nahida',
      name: 'skill_press',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'skill',
        name: 'skill_press',
      },
    },
    skill_hold: {
      src: 'Nahida',
      name: 'skill_hold',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'skill',
        name: 'skill_hold',
      },
    },
    karma_dmg: {
      src: 'Nahida',
      name: 'karma_dmg',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nahida',
        move: 'skill',
        name: 'karma_dmg',
      },
    },
  },
  Nilou: {
    normal_0: {
      src: 'Nilou',
      name: 'normal_0',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'normal',
        name: 'normal_0',
      },
    },
    normal_1: {
      src: 'Nilou',
      name: 'normal_1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'normal',
        name: 'normal_1',
      },
    },
    normal_2: {
      src: 'Nilou',
      name: 'normal_2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'normal',
        name: 'normal_2',
      },
    },
    charged_1: {
      src: 'Nilou',
      name: 'charged_1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'charged',
        name: 'charged_1',
      },
    },
    charged_2: {
      src: 'Nilou',
      name: 'charged_2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'charged',
        name: 'charged_2',
      },
    },
    plunging_dmg: {
      src: 'Nilou',
      name: 'plunging_dmg',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'plunging',
        name: 'plunging_dmg',
      },
    },
    plunging_low: {
      src: 'Nilou',
      name: 'plunging_low',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'plunging',
        name: 'plunging_low',
      },
    },
    plunging_high: {
      src: 'Nilou',
      name: 'plunging_high',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'plunging',
        name: 'plunging_high',
      },
    },
    skill_skill: {
      src: 'Nilou',
      name: 'skill_skill',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'skill',
        name: 'skill_skill',
      },
    },
    skill_dance1: {
      src: 'Nilou',
      name: 'skill_dance1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'skill',
        name: 'skill_dance1',
      },
    },
    skill_dance2: {
      src: 'Nilou',
      name: 'skill_dance2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'skill',
        name: 'skill_dance2',
      },
    },
    skill_whirl1: {
      src: 'Nilou',
      name: 'skill_whirl1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'skill',
        name: 'skill_whirl1',
      },
    },
    skill_whirl2: {
      src: 'Nilou',
      name: 'skill_whirl2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'skill',
        name: 'skill_whirl2',
      },
    },
    skill_wheel: {
      src: 'Nilou',
      name: 'skill_wheel',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'skill',
        name: 'skill_wheel',
      },
    },
    skill_moon: {
      src: 'Nilou',
      name: 'skill_moon',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'skill',
        name: 'skill_moon',
      },
    },
    burst_skill: {
      src: 'Nilou',
      name: 'burst_skill',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'burst',
        name: 'burst_skill',
      },
    },
    burst_aeon: {
      src: 'Nilou',
      name: 'burst_aeon',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        src: 'Nilou',
        move: 'burst',
        name: 'burst_aeon',
      },
    },
  },
  PrototypeAmber: {
    heal: {
      src: 'PrototypeAmber',
      name: 'heal',
      tag: {
        et: 'teamBuff',
        qt: 'formula',
        q: 'heal',
        src: 'PrototypeAmber',
        name: 'heal',
      },
    },
  },
}
