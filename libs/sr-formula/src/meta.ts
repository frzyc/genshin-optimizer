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
  Serval: {
    c6Shocked: {
      src: 'Serval',
      name: 'c6Shocked',
      tag: { src: 'Serval', name: 'c6Shocked' },
      type: 'bool',
    },
  },
  TheSeriousnessOfBreakfast: {
    stackCount: {
      src: 'TheSeriousnessOfBreakfast',
      name: 'stackCount',
      tag: { src: 'TheSeriousnessOfBreakfast', name: 'stackCount' },
      type: 'num',
      int_only: true,
      min: 0,
      max: 3,
    },
  },
}
export const formulas = {
  March7th: {
    basicDmg_0: {
      src: 'March7th',
      name: 'basicDmg_0',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'basicDmg_0',
      },
    },
    skillShield: {
      src: 'March7th',
      name: 'skillShield',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'shield',
        et: 'self',
        name: 'skillShield',
      },
    },
    ultDmg_0: {
      src: 'March7th',
      name: 'ultDmg_0',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'ultDmg_0',
      },
    },
    ultDmg_1: {
      src: 'March7th',
      name: 'ultDmg_1',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'ultDmg_1',
      },
    },
    ultDmg_2: {
      src: 'March7th',
      name: 'ultDmg_2',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'ultDmg_2',
      },
    },
    ultDmg_3: {
      src: 'March7th',
      name: 'ultDmg_3',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'ultDmg_3',
      },
    },
    ultFreeze_0: {
      src: 'March7th',
      name: 'ultFreeze_0',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'ultFreeze_0',
      },
    },
    talentDmg_0: {
      src: 'March7th',
      name: 'talentDmg_0',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'talentDmg_0',
      },
    },
    techniqueFreeze_0: {
      src: 'March7th',
      name: 'techniqueFreeze_0',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'techniqueFreeze_0',
      },
    },
    e1Shield: {
      src: 'March7th',
      name: 'e1Shield',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'shield',
        et: 'self',
        name: 'e1Shield',
      },
    },
    e6Heal: {
      src: 'March7th',
      name: 'e6Heal',
      tag: {
        src: 'March7th',
        qt: 'formula',
        q: 'heal',
        et: 'self',
        name: 'e6Heal',
      },
    },
  },
  Serval: {
    basicDmg_0: {
      src: 'Serval',
      name: 'basicDmg_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'basicDmg_0',
      },
    },
    skillDmgPrimary_0: {
      src: 'Serval',
      name: 'skillDmgPrimary_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'skillDmgPrimary_0',
      },
    },
    skillDmgBlast_0: {
      src: 'Serval',
      name: 'skillDmgBlast_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'skillDmgBlast_0',
      },
    },
    skillShockDmg_0: {
      src: 'Serval',
      name: 'skillShockDmg_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'skillShockDmg_0',
      },
    },
    ultDmg_0: {
      src: 'Serval',
      name: 'ultDmg_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'ultDmg_0',
      },
    },
    talentDmg_0: {
      src: 'Serval',
      name: 'talentDmg_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'talentDmg_0',
      },
    },
    techniqueDmg_0: {
      src: 'Serval',
      name: 'techniqueDmg_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'techniqueDmg_0',
      },
    },
    techniqueShockDmg_0: {
      src: 'Serval',
      name: 'techniqueShockDmg_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'techniqueShockDmg_0',
      },
    },
    e1Dmg_0: {
      src: 'Serval',
      name: 'e1Dmg_0',
      tag: {
        src: 'Serval',
        qt: 'formula',
        q: 'dmg',
        et: 'self',
        name: 'e1Dmg_0',
      },
    },
  },
}
