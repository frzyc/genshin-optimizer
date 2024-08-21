type Tag = Record<string, string>

export type IConditionalData =
  | IBoolConditionalData
  | IListConditionalData
  | INumConditionalData
export type IFormulaData = {
  sheet: string // entity
  name: string // formula name
  tag: Tag // tag used to access value
}

/// Conditional whose values are True (1.0) and False (0.0)
export type IBoolConditionalData = {
  type: 'bool' // type discriminator
  sheet: string // entity
  name: string // conditional name
}
/// Conditional whose values are those in the list. When inputting the
/// entry, use the (0-based) position in the list
export type IListConditionalData = {
  type: 'list' // type discriminator
  sheet: string // entity
  name: string // conditional name

  list: [string] // feasible values
}
/// Conditional whose values are regular numbers
export type INumConditionalData = {
  type: 'num' // type discriminator
  sheet: string // entity
  name: string // conditional name

  int_only: boolean // whether the value must be an integer
  min?: number // smallest feasible value, if applicable
  max?: number // largest feasible value, if applicable
}

export const conditionals = {
  Adventurer: {
    someBoolConditional: {
      sheet: 'Adventurer',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Adventurer',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Adventurer',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ArchaicPetra: {
    someBoolConditional: {
      sheet: 'ArchaicPetra',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ArchaicPetra',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ArchaicPetra',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Berserker: {
    someBoolConditional: {
      sheet: 'Berserker',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Berserker',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Berserker',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BlizzardStrayer: {
    someBoolConditional: {
      sheet: 'BlizzardStrayer',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BlizzardStrayer',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BlizzardStrayer',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BloodstainedChivalry: {
    someBoolConditional: {
      sheet: 'BloodstainedChivalry',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BloodstainedChivalry',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BloodstainedChivalry',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BraveHeart: {
    someBoolConditional: {
      sheet: 'BraveHeart',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BraveHeart',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BraveHeart',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  CrimsonWitchOfFlames: {
    someBoolConditional: {
      sheet: 'CrimsonWitchOfFlames',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'CrimsonWitchOfFlames',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'CrimsonWitchOfFlames',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DeepwoodMemories: {
    someBoolConditional: {
      sheet: 'DeepwoodMemories',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DeepwoodMemories',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DeepwoodMemories',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DefendersWill: {
    someBoolConditional: {
      sheet: 'DefendersWill',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DefendersWill',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DefendersWill',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DesertPavilionChronicle: {
    someBoolConditional: {
      sheet: 'DesertPavilionChronicle',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DesertPavilionChronicle',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DesertPavilionChronicle',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  EchoesOfAnOffering: {
    someBoolConditional: {
      sheet: 'EchoesOfAnOffering',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'EchoesOfAnOffering',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'EchoesOfAnOffering',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  EmblemOfSeveredFate: {
    someBoolConditional: {
      sheet: 'EmblemOfSeveredFate',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'EmblemOfSeveredFate',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'EmblemOfSeveredFate',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FlowerOfParadiseLost: {
    someBoolConditional: {
      sheet: 'FlowerOfParadiseLost',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FlowerOfParadiseLost',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FlowerOfParadiseLost',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FragmentOfHarmonicWhimsy: {
    someBoolConditional: {
      sheet: 'FragmentOfHarmonicWhimsy',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FragmentOfHarmonicWhimsy',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FragmentOfHarmonicWhimsy',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Gambler: {
    someBoolConditional: {
      sheet: 'Gambler',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Gambler',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Gambler',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  GildedDreams: {
    someBoolConditional: {
      sheet: 'GildedDreams',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'GildedDreams',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'GildedDreams',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  GladiatorsFinale: {
    someBoolConditional: {
      sheet: 'GladiatorsFinale',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'GladiatorsFinale',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'GladiatorsFinale',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  GoldenTroupe: {
    someBoolConditional: {
      sheet: 'GoldenTroupe',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'GoldenTroupe',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'GoldenTroupe',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  HeartOfDepth: {
    someBoolConditional: {
      sheet: 'HeartOfDepth',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'HeartOfDepth',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'HeartOfDepth',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  HuskOfOpulentDreams: {
    someBoolConditional: {
      sheet: 'HuskOfOpulentDreams',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'HuskOfOpulentDreams',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'HuskOfOpulentDreams',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Instructor: {
    someBoolConditional: {
      sheet: 'Instructor',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Instructor',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Instructor',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Lavawalker: {
    someBoolConditional: {
      sheet: 'Lavawalker',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Lavawalker',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Lavawalker',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  LuckyDog: {
    someBoolConditional: {
      sheet: 'LuckyDog',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'LuckyDog',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'LuckyDog',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MaidenBeloved: {
    someBoolConditional: {
      sheet: 'MaidenBeloved',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MaidenBeloved',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MaidenBeloved',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MarechausseeHunter: {
    someBoolConditional: {
      sheet: 'MarechausseeHunter',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MarechausseeHunter',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MarechausseeHunter',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MartialArtist: {
    someBoolConditional: {
      sheet: 'MartialArtist',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MartialArtist',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MartialArtist',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  NighttimeWhispersInTheEchoingWoods: {
    someBoolConditional: {
      sheet: 'NighttimeWhispersInTheEchoingWoods',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'NighttimeWhispersInTheEchoingWoods',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'NighttimeWhispersInTheEchoingWoods',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  NoblesseOblige: {
    set4: { sheet: 'NoblesseOblige', name: 'set4', type: 'bool' },
  },
  NymphsDream: {
    someBoolConditional: {
      sheet: 'NymphsDream',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'NymphsDream',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'NymphsDream',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  OceanHuedClam: {
    someBoolConditional: {
      sheet: 'OceanHuedClam',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'OceanHuedClam',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'OceanHuedClam',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PaleFlame: {
    someBoolConditional: {
      sheet: 'PaleFlame',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PaleFlame',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PaleFlame',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrayersForDestiny: {
    someBoolConditional: {
      sheet: 'PrayersForDestiny',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrayersForDestiny',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrayersForDestiny',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrayersForIllumination: {
    someBoolConditional: {
      sheet: 'PrayersForIllumination',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrayersForIllumination',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrayersForIllumination',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrayersForWisdom: {
    someBoolConditional: {
      sheet: 'PrayersForWisdom',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrayersForWisdom',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrayersForWisdom',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrayersToSpringtime: {
    someBoolConditional: {
      sheet: 'PrayersToSpringtime',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrayersToSpringtime',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrayersToSpringtime',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ResolutionOfSojourner: {
    someBoolConditional: {
      sheet: 'ResolutionOfSojourner',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ResolutionOfSojourner',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ResolutionOfSojourner',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RetracingBolide: {
    someBoolConditional: {
      sheet: 'RetracingBolide',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RetracingBolide',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RetracingBolide',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Scholar: {
    someBoolConditional: {
      sheet: 'Scholar',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Scholar',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Scholar',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ShimenawasReminiscence: {
    someBoolConditional: {
      sheet: 'ShimenawasReminiscence',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ShimenawasReminiscence',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ShimenawasReminiscence',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SongOfDaysPast: {
    someBoolConditional: {
      sheet: 'SongOfDaysPast',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SongOfDaysPast',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SongOfDaysPast',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TenacityOfTheMillelith: {
    someBoolConditional: {
      sheet: 'TenacityOfTheMillelith',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TenacityOfTheMillelith',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TenacityOfTheMillelith',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheExile: {
    someBoolConditional: {
      sheet: 'TheExile',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheExile',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheExile',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ThunderingFury: {
    someBoolConditional: {
      sheet: 'ThunderingFury',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ThunderingFury',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ThunderingFury',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Thundersoother: {
    someBoolConditional: {
      sheet: 'Thundersoother',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Thundersoother',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Thundersoother',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TinyMiracle: {
    someBoolConditional: {
      sheet: 'TinyMiracle',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TinyMiracle',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TinyMiracle',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TravelingDoctor: {
    someBoolConditional: {
      sheet: 'TravelingDoctor',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TravelingDoctor',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TravelingDoctor',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  UnfinishedReverie: {
    someBoolConditional: {
      sheet: 'UnfinishedReverie',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'UnfinishedReverie',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'UnfinishedReverie',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  VermillionHereafter: {
    someBoolConditional: {
      sheet: 'VermillionHereafter',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'VermillionHereafter',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'VermillionHereafter',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ViridescentVenerer: {
    someBoolConditional: {
      sheet: 'ViridescentVenerer',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ViridescentVenerer',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ViridescentVenerer',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  VourukashasGlow: {
    someBoolConditional: {
      sheet: 'VourukashasGlow',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'VourukashasGlow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'VourukashasGlow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WanderersTroupe: {
    someBoolConditional: {
      sheet: 'WanderersTroupe',
      name: 'someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WanderersTroupe',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WanderersTroupe',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Albedo: {
    _someBoolConditional: {
      sheet: 'Albedo',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Albedo',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Albedo',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Alhaitham: {
    _someBoolConditional: {
      sheet: 'Alhaitham',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Alhaitham',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Alhaitham',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Aloy: {
    _someBoolConditional: {
      sheet: 'Aloy',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Aloy',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Aloy',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Amber: {
    _someBoolConditional: {
      sheet: 'Amber',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Amber',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Amber',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  AratakiItto: {
    _someBoolConditional: {
      sheet: 'AratakiItto',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'AratakiItto',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'AratakiItto',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Arlecchino: {
    _someBoolConditional: {
      sheet: 'Arlecchino',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Arlecchino',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Arlecchino',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Baizhu: {
    _someBoolConditional: {
      sheet: 'Baizhu',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Baizhu',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Baizhu',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Barbara: {
    _someBoolConditional: {
      sheet: 'Barbara',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Barbara',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Barbara',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Beidou: {
    _someBoolConditional: {
      sheet: 'Beidou',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Beidou',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Beidou',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Bennett: {
    _someBoolConditional: {
      sheet: 'Bennett',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Bennett',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Bennett',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Candace: {
    afterBurst: { sheet: 'Candace', name: 'afterBurst', type: 'bool' },
    c2AfterSkillHit: {
      sheet: 'Candace',
      name: 'c2AfterSkillHit',
      type: 'bool',
    },
  },
  Charlotte: {
    _someBoolConditional: {
      sheet: 'Charlotte',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Charlotte',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Charlotte',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Chevreuse: {
    _someBoolConditional: {
      sheet: 'Chevreuse',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Chevreuse',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Chevreuse',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Chiori: {
    _someBoolConditional: {
      sheet: 'Chiori',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Chiori',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Chiori',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Chongyun: {
    _someBoolConditional: {
      sheet: 'Chongyun',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Chongyun',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Chongyun',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Clorinde: {
    _someBoolConditional: {
      sheet: 'Clorinde',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Clorinde',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Clorinde',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Collei: {
    _someBoolConditional: {
      sheet: 'Collei',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Collei',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Collei',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Cyno: {
    _someBoolConditional: {
      sheet: 'Cyno',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Cyno',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Cyno',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Dehya: {
    _someBoolConditional: {
      sheet: 'Dehya',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Dehya',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Dehya',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Diluc: {
    _someBoolConditional: {
      sheet: 'Diluc',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Diluc',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Diluc',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Diona: {
    _someBoolConditional: {
      sheet: 'Diona',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Diona',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Diona',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Dori: {
    _someBoolConditional: {
      sheet: 'Dori',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Dori',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Dori',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Eula: {
    _someBoolConditional: {
      sheet: 'Eula',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Eula',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Eula',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Faruzan: {
    _someBoolConditional: {
      sheet: 'Faruzan',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Faruzan',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Faruzan',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Fischl: {
    _someBoolConditional: {
      sheet: 'Fischl',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Fischl',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Fischl',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Freminet: {
    _someBoolConditional: {
      sheet: 'Freminet',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Freminet',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Freminet',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Furina: {
    _someBoolConditional: {
      sheet: 'Furina',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Furina',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Furina',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Gaming: {
    _someBoolConditional: {
      sheet: 'Gaming',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Gaming',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Gaming',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Ganyu: {
    _someBoolConditional: {
      sheet: 'Ganyu',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Ganyu',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Ganyu',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Gorou: {
    _someBoolConditional: {
      sheet: 'Gorou',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Gorou',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Gorou',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  HuTao: {
    _someBoolConditional: {
      sheet: 'HuTao',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'HuTao',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'HuTao',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Jean: {
    _someBoolConditional: {
      sheet: 'Jean',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Jean',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Jean',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KaedeharaKazuha: {
    _someBoolConditional: {
      sheet: 'KaedeharaKazuha',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KaedeharaKazuha',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KaedeharaKazuha',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Kaeya: {
    _someBoolConditional: {
      sheet: 'Kaeya',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Kaeya',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Kaeya',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KamisatoAyaka: {
    _someBoolConditional: {
      sheet: 'KamisatoAyaka',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KamisatoAyaka',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KamisatoAyaka',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KamisatoAyato: {
    _someBoolConditional: {
      sheet: 'KamisatoAyato',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KamisatoAyato',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KamisatoAyato',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Kaveh: {
    _someBoolConditional: {
      sheet: 'Kaveh',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Kaveh',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Kaveh',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Keqing: {
    _someBoolConditional: {
      sheet: 'Keqing',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Keqing',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Keqing',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Kirara: {
    _someBoolConditional: {
      sheet: 'Kirara',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Kirara',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Kirara',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Klee: {
    _someBoolConditional: {
      sheet: 'Klee',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Klee',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Klee',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KujouSara: {
    _someBoolConditional: {
      sheet: 'KujouSara',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KujouSara',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KujouSara',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KukiShinobu: {
    _someBoolConditional: {
      sheet: 'KukiShinobu',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KukiShinobu',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KukiShinobu',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Layla: {
    _someBoolConditional: {
      sheet: 'Layla',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Layla',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Layla',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Lisa: {
    _someBoolConditional: {
      sheet: 'Lisa',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Lisa',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Lisa',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Lynette: {
    _someBoolConditional: {
      sheet: 'Lynette',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Lynette',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Lynette',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Lyney: {
    _someBoolConditional: {
      sheet: 'Lyney',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Lyney',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Lyney',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Mika: {
    _someBoolConditional: {
      sheet: 'Mika',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Mika',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Mika',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Mona: {
    _someBoolConditional: {
      sheet: 'Mona',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Mona',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Mona',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Nahida: {
    a1ActiveInBurst: { sheet: 'Nahida', name: 'a1ActiveInBurst', type: 'bool' },
    c2Bloom: { sheet: 'Nahida', name: 'c2Bloom', type: 'bool' },
    c2QSA: { sheet: 'Nahida', name: 'c2QSA', type: 'bool' },
    partyInBurst: { sheet: 'Nahida', name: 'partyInBurst', type: 'bool' },
    isActive: { sheet: 'Nahida', name: 'isActive', type: 'bool' },
    c4Count: {
      sheet: 'Nahida',
      name: 'c4Count',
      type: 'num',
      int_only: true,
      min: 0,
      max: 4,
    },
  },
  Navia: {
    _someBoolConditional: {
      sheet: 'Navia',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Navia',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Navia',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Neuvillette: {
    _someBoolConditional: {
      sheet: 'Neuvillette',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Neuvillette',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Neuvillette',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Nilou: {
    a1AfterSkill: { sheet: 'Nilou', name: 'a1AfterSkill', type: 'bool' },
    a1AfterHit: { sheet: 'Nilou', name: 'a1AfterHit', type: 'bool' },
    c4AfterPirHit: { sheet: 'Nilou', name: 'c4AfterPirHit', type: 'bool' },
    c2Hydro: { sheet: 'Nilou', name: 'c2Hydro', type: 'bool' },
    c2Dendro: { sheet: 'Nilou', name: 'c2Dendro', type: 'bool' },
  },
  Ningguang: {
    _someBoolConditional: {
      sheet: 'Ningguang',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Ningguang',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Ningguang',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Noelle: {
    _someBoolConditional: {
      sheet: 'Noelle',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Noelle',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Noelle',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Qiqi: {
    _someBoolConditional: {
      sheet: 'Qiqi',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Qiqi',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Qiqi',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RaidenShogun: {
    _someBoolConditional: {
      sheet: 'RaidenShogun',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RaidenShogun',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RaidenShogun',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Razor: {
    _someBoolConditional: {
      sheet: 'Razor',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Razor',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Razor',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Rosaria: {
    _someBoolConditional: {
      sheet: 'Rosaria',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Rosaria',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Rosaria',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SangonomiyaKokomi: {
    _someBoolConditional: {
      sheet: 'SangonomiyaKokomi',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SangonomiyaKokomi',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SangonomiyaKokomi',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Sayu: {
    _someBoolConditional: {
      sheet: 'Sayu',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Sayu',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Sayu',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Sethos: {
    _someBoolConditional: {
      sheet: 'Sethos',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Sethos',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Sethos',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Shenhe: {
    _someBoolConditional: {
      sheet: 'Shenhe',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Shenhe',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Shenhe',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ShikanoinHeizou: {
    _someBoolConditional: {
      sheet: 'ShikanoinHeizou',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ShikanoinHeizou',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ShikanoinHeizou',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Somnia: {
    _someBoolConditional: {
      sheet: 'Somnia',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Somnia',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Somnia',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Sucrose: {
    _someBoolConditional: {
      sheet: 'Sucrose',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Sucrose',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Sucrose',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Tartaglia: {
    _someBoolConditional: {
      sheet: 'Tartaglia',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Tartaglia',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Tartaglia',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Thoma: {
    _someBoolConditional: {
      sheet: 'Thoma',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Thoma',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Thoma',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Tighnari: {
    _someBoolConditional: {
      sheet: 'Tighnari',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Tighnari',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Tighnari',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TravelerAnemo: {
    _someBoolConditional: {
      sheet: 'TravelerAnemo',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TravelerAnemo',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TravelerAnemo',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TravelerDendro: {
    _someBoolConditional: {
      sheet: 'TravelerDendro',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TravelerDendro',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TravelerDendro',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TravelerElectro: {
    _someBoolConditional: {
      sheet: 'TravelerElectro',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TravelerElectro',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TravelerElectro',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TravelerGeo: {
    _someBoolConditional: {
      sheet: 'TravelerGeo',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TravelerGeo',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TravelerGeo',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TravelerHydro: {
    _someBoolConditional: {
      sheet: 'TravelerHydro',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TravelerHydro',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TravelerHydro',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Venti: {
    _someBoolConditional: {
      sheet: 'Venti',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Venti',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Venti',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Wanderer: {
    _someBoolConditional: {
      sheet: 'Wanderer',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Wanderer',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Wanderer',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Wriothesley: {
    _someBoolConditional: {
      sheet: 'Wriothesley',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Wriothesley',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Wriothesley',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Xiangling: {
    _someBoolConditional: {
      sheet: 'Xiangling',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Xiangling',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Xiangling',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Xianyun: {
    _someBoolConditional: {
      sheet: 'Xianyun',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Xianyun',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Xianyun',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Xiao: {
    _someBoolConditional: {
      sheet: 'Xiao',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Xiao',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Xiao',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Xingqiu: {
    _someBoolConditional: {
      sheet: 'Xingqiu',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Xingqiu',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Xingqiu',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Xinyan: {
    _someBoolConditional: {
      sheet: 'Xinyan',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Xinyan',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Xinyan',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  YaeMiko: {
    _someBoolConditional: {
      sheet: 'YaeMiko',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'YaeMiko',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'YaeMiko',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Yanfei: {
    _someBoolConditional: {
      sheet: 'Yanfei',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Yanfei',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Yanfei',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Yaoyao: {
    _someBoolConditional: {
      sheet: 'Yaoyao',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Yaoyao',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Yaoyao',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Yelan: {
    _someBoolConditional: {
      sheet: 'Yelan',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Yelan',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Yelan',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Yoimiya: {
    _someBoolConditional: {
      sheet: 'Yoimiya',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Yoimiya',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Yoimiya',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  YunJin: {
    _someBoolConditional: {
      sheet: 'YunJin',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'YunJin',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'YunJin',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Zhongli: {
    _someBoolConditional: {
      sheet: 'Zhongli',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Zhongli',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Zhongli',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  static: {
    enemyFrozen: { sheet: 'static', name: 'enemyFrozen', type: 'bool' },
    hasShield: { sheet: 'static', name: 'hasShield', type: 'bool' },
  },
  reso: {
    nearbyDendro1: { sheet: 'reso', name: 'nearbyDendro1', type: 'bool' },
    nearbyDendro2: { sheet: 'reso', name: 'nearbyDendro2', type: 'bool' },
  },
  AThousandFloatingDreams: {
    _someBoolConditional: {
      sheet: 'AThousandFloatingDreams',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'AThousandFloatingDreams',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'AThousandFloatingDreams',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Absolution: {
    _someBoolConditional: {
      sheet: 'Absolution',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Absolution',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Absolution',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Akuoumaru: {
    _someBoolConditional: {
      sheet: 'Akuoumaru',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Akuoumaru',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Akuoumaru',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  AlleyHunter: {
    _someBoolConditional: {
      sheet: 'AlleyHunter',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'AlleyHunter',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'AlleyHunter',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  AmenomaKageuchi: {
    _someBoolConditional: {
      sheet: 'AmenomaKageuchi',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'AmenomaKageuchi',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'AmenomaKageuchi',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  AmosBow: {
    _someBoolConditional: {
      sheet: 'AmosBow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'AmosBow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'AmosBow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ApprenticesNotes: {
    _someBoolConditional: {
      sheet: 'ApprenticesNotes',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ApprenticesNotes',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ApprenticesNotes',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  AquaSimulacra: {
    _someBoolConditional: {
      sheet: 'AquaSimulacra',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'AquaSimulacra',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'AquaSimulacra',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  AquilaFavonia: {
    _someBoolConditional: {
      sheet: 'AquilaFavonia',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'AquilaFavonia',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'AquilaFavonia',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BalladOfTheBoundlessBlue: {
    _someBoolConditional: {
      sheet: 'BalladOfTheBoundlessBlue',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BalladOfTheBoundlessBlue',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BalladOfTheBoundlessBlue',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BalladOfTheFjords: {
    _someBoolConditional: {
      sheet: 'BalladOfTheFjords',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BalladOfTheFjords',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BalladOfTheFjords',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BeaconOfTheReedSea: {
    _someBoolConditional: {
      sheet: 'BeaconOfTheReedSea',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BeaconOfTheReedSea',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BeaconOfTheReedSea',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BeginnersProtector: {
    _someBoolConditional: {
      sheet: 'BeginnersProtector',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BeginnersProtector',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BeginnersProtector',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BlackTassel: {
    _someBoolConditional: {
      sheet: 'BlackTassel',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BlackTassel',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BlackTassel',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BlackcliffAgate: {
    _someBoolConditional: {
      sheet: 'BlackcliffAgate',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BlackcliffAgate',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BlackcliffAgate',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BlackcliffLongsword: {
    _someBoolConditional: {
      sheet: 'BlackcliffLongsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BlackcliffLongsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BlackcliffLongsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BlackcliffPole: {
    _someBoolConditional: {
      sheet: 'BlackcliffPole',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BlackcliffPole',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BlackcliffPole',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BlackcliffSlasher: {
    _someBoolConditional: {
      sheet: 'BlackcliffSlasher',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BlackcliffSlasher',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BlackcliffSlasher',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BlackcliffWarbow: {
    _someBoolConditional: {
      sheet: 'BlackcliffWarbow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BlackcliffWarbow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BlackcliffWarbow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  BloodtaintedGreatsword: {
    _someBoolConditional: {
      sheet: 'BloodtaintedGreatsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'BloodtaintedGreatsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'BloodtaintedGreatsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  CalamityQueller: {
    stack: {
      sheet: 'CalamityQueller',
      name: 'stack',
      type: 'num',
      int_only: true,
      min: 0,
      max: 6,
    },
    isActive: { sheet: 'CalamityQueller', name: 'isActive', type: 'bool' },
  },
  CashflowSupervision: {
    _someBoolConditional: {
      sheet: 'CashflowSupervision',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'CashflowSupervision',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'CashflowSupervision',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  CinnabarSpindle: {
    _someBoolConditional: {
      sheet: 'CinnabarSpindle',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'CinnabarSpindle',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'CinnabarSpindle',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Cloudforged: {
    _someBoolConditional: {
      sheet: 'Cloudforged',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Cloudforged',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Cloudforged',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  CompoundBow: {
    _someBoolConditional: {
      sheet: 'CompoundBow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'CompoundBow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'CompoundBow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  CoolSteel: {
    _someBoolConditional: {
      sheet: 'CoolSteel',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'CoolSteel',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'CoolSteel',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  CranesEchoingCall: {
    _someBoolConditional: {
      sheet: 'CranesEchoingCall',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'CranesEchoingCall',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'CranesEchoingCall',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  CrescentPike: {
    _someBoolConditional: {
      sheet: 'CrescentPike',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'CrescentPike',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'CrescentPike',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  CrimsonMoonsSemblance: {
    _someBoolConditional: {
      sheet: 'CrimsonMoonsSemblance',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'CrimsonMoonsSemblance',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'CrimsonMoonsSemblance',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DarkIronSword: {
    _someBoolConditional: {
      sheet: 'DarkIronSword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DarkIronSword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DarkIronSword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Deathmatch: {
    _someBoolConditional: {
      sheet: 'Deathmatch',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Deathmatch',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Deathmatch',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DebateClub: {
    _someBoolConditional: {
      sheet: 'DebateClub',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DebateClub',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DebateClub',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DialoguesOfTheDesertSages: {
    _someBoolConditional: {
      sheet: 'DialoguesOfTheDesertSages',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DialoguesOfTheDesertSages',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DialoguesOfTheDesertSages',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DodocoTales: {
    _someBoolConditional: {
      sheet: 'DodocoTales',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DodocoTales',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DodocoTales',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DragonsBane: {
    _someBoolConditional: {
      sheet: 'DragonsBane',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DragonsBane',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DragonsBane',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DragonspineSpear: {
    _someBoolConditional: {
      sheet: 'DragonspineSpear',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DragonspineSpear',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DragonspineSpear',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  DullBlade: {
    _someBoolConditional: {
      sheet: 'DullBlade',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'DullBlade',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'DullBlade',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ElegyForTheEnd: {
    _someBoolConditional: {
      sheet: 'ElegyForTheEnd',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ElegyForTheEnd',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ElegyForTheEnd',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  EmeraldOrb: {
    _someBoolConditional: {
      sheet: 'EmeraldOrb',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'EmeraldOrb',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'EmeraldOrb',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  EndOfTheLine: {
    _someBoolConditional: {
      sheet: 'EndOfTheLine',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'EndOfTheLine',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'EndOfTheLine',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  EngulfingLightning: {
    _someBoolConditional: {
      sheet: 'EngulfingLightning',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'EngulfingLightning',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'EngulfingLightning',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  EverlastingMoonglow: {
    _someBoolConditional: {
      sheet: 'EverlastingMoonglow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'EverlastingMoonglow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'EverlastingMoonglow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  EyeOfPerception: {
    _someBoolConditional: {
      sheet: 'EyeOfPerception',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'EyeOfPerception',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'EyeOfPerception',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FadingTwilight: {
    _someBoolConditional: {
      sheet: 'FadingTwilight',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FadingTwilight',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FadingTwilight',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FavoniusCodex: {
    _someBoolConditional: {
      sheet: 'FavoniusCodex',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FavoniusCodex',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FavoniusCodex',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FavoniusGreatsword: {
    _someBoolConditional: {
      sheet: 'FavoniusGreatsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FavoniusGreatsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FavoniusGreatsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FavoniusLance: {
    _someBoolConditional: {
      sheet: 'FavoniusLance',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FavoniusLance',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FavoniusLance',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FavoniusSword: {
    _someBoolConditional: {
      sheet: 'FavoniusSword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FavoniusSword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FavoniusSword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FavoniusWarbow: {
    _someBoolConditional: {
      sheet: 'FavoniusWarbow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FavoniusWarbow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FavoniusWarbow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FerrousShadow: {
    _someBoolConditional: {
      sheet: 'FerrousShadow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FerrousShadow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FerrousShadow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FesteringDesire: {
    _someBoolConditional: {
      sheet: 'FesteringDesire',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FesteringDesire',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FesteringDesire',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FilletBlade: {
    _someBoolConditional: {
      sheet: 'FilletBlade',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FilletBlade',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FilletBlade',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FinaleOfTheDeep: {
    _someBoolConditional: {
      sheet: 'FinaleOfTheDeep',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FinaleOfTheDeep',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FinaleOfTheDeep',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FleuveCendreFerryman: {
    _someBoolConditional: {
      sheet: 'FleuveCendreFerryman',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FleuveCendreFerryman',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FleuveCendreFerryman',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FlowingPurity: {
    _someBoolConditional: {
      sheet: 'FlowingPurity',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FlowingPurity',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FlowingPurity',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ForestRegalia: {
    _someBoolConditional: {
      sheet: 'ForestRegalia',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ForestRegalia',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ForestRegalia',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FreedomSworn: {
    _someBoolConditional: {
      sheet: 'FreedomSworn',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FreedomSworn',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FreedomSworn',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Frostbearer: {
    _someBoolConditional: {
      sheet: 'Frostbearer',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Frostbearer',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Frostbearer',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  FruitOfFulfillment: {
    _someBoolConditional: {
      sheet: 'FruitOfFulfillment',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'FruitOfFulfillment',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'FruitOfFulfillment',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  HakushinRing: {
    _someBoolConditional: {
      sheet: 'HakushinRing',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'HakushinRing',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'HakushinRing',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Halberd: {
    _someBoolConditional: {
      sheet: 'Halberd',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Halberd',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Halberd',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Hamayumi: {
    _someBoolConditional: {
      sheet: 'Hamayumi',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Hamayumi',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Hamayumi',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  HaranGeppakuFutsu: {
    _someBoolConditional: {
      sheet: 'HaranGeppakuFutsu',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'HaranGeppakuFutsu',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'HaranGeppakuFutsu',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  HarbingerOfDawn: {
    _someBoolConditional: {
      sheet: 'HarbingerOfDawn',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'HarbingerOfDawn',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'HarbingerOfDawn',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  HuntersBow: {
    _someBoolConditional: {
      sheet: 'HuntersBow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'HuntersBow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'HuntersBow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  HuntersPath: {
    _someBoolConditional: {
      sheet: 'HuntersPath',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'HuntersPath',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'HuntersPath',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  IbisPiercer: {
    _someBoolConditional: {
      sheet: 'IbisPiercer',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'IbisPiercer',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'IbisPiercer',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  IronPoint: {
    _someBoolConditional: {
      sheet: 'IronPoint',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'IronPoint',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'IronPoint',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  IronSting: {
    _someBoolConditional: {
      sheet: 'IronSting',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'IronSting',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'IronSting',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  JadefallsSplendor: {
    _someBoolConditional: {
      sheet: 'JadefallsSplendor',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'JadefallsSplendor',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'JadefallsSplendor',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KagotsurubeIsshin: {
    _someBoolConditional: {
      sheet: 'KagotsurubeIsshin',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KagotsurubeIsshin',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KagotsurubeIsshin',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KagurasVerity: {
    _someBoolConditional: {
      sheet: 'KagurasVerity',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KagurasVerity',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KagurasVerity',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KatsuragikiriNagamasa: {
    _someBoolConditional: {
      sheet: 'KatsuragikiriNagamasa',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KatsuragikiriNagamasa',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KatsuragikiriNagamasa',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KeyOfKhajNisut: {
    afterSkillStacks: {
      sheet: 'KeyOfKhajNisut',
      name: 'afterSkillStacks',
      type: 'num',
      int_only: true,
      min: 0,
      max: 3,
    },
  },
  KingsSquire: {
    _someBoolConditional: {
      sheet: 'KingsSquire',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KingsSquire',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KingsSquire',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  KitainCrossSpear: {
    _someBoolConditional: {
      sheet: 'KitainCrossSpear',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'KitainCrossSpear',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'KitainCrossSpear',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  LightOfFoliarIncision: {
    _someBoolConditional: {
      sheet: 'LightOfFoliarIncision',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'LightOfFoliarIncision',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'LightOfFoliarIncision',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  LionsRoar: {
    _someBoolConditional: {
      sheet: 'LionsRoar',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'LionsRoar',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'LionsRoar',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  LithicBlade: {
    _someBoolConditional: {
      sheet: 'LithicBlade',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'LithicBlade',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'LithicBlade',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  LithicSpear: {
    _someBoolConditional: {
      sheet: 'LithicSpear',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'LithicSpear',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'LithicSpear',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  LostPrayerToTheSacredWinds: {
    _someBoolConditional: {
      sheet: 'LostPrayerToTheSacredWinds',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'LostPrayerToTheSacredWinds',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'LostPrayerToTheSacredWinds',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  LuxuriousSeaLord: {
    _someBoolConditional: {
      sheet: 'LuxuriousSeaLord',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'LuxuriousSeaLord',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'LuxuriousSeaLord',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MagicGuide: {
    _someBoolConditional: {
      sheet: 'MagicGuide',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MagicGuide',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MagicGuide',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MailedFlower: {
    _someBoolConditional: {
      sheet: 'MailedFlower',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MailedFlower',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MailedFlower',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MakhairaAquamarine: {
    _someBoolConditional: {
      sheet: 'MakhairaAquamarine',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MakhairaAquamarine',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MakhairaAquamarine',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MappaMare: {
    _someBoolConditional: {
      sheet: 'MappaMare',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MappaMare',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MappaMare',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MemoryOfDust: {
    _someBoolConditional: {
      sheet: 'MemoryOfDust',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MemoryOfDust',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MemoryOfDust',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Messenger: {
    _someBoolConditional: {
      sheet: 'Messenger',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Messenger',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Messenger',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MissiveWindspear: {
    _someBoolConditional: {
      sheet: 'MissiveWindspear',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MissiveWindspear',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MissiveWindspear',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MistsplitterReforged: {
    _someBoolConditional: {
      sheet: 'MistsplitterReforged',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MistsplitterReforged',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MistsplitterReforged',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MitternachtsWaltz: {
    _someBoolConditional: {
      sheet: 'MitternachtsWaltz',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MitternachtsWaltz',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MitternachtsWaltz',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Moonpiercer: {
    _someBoolConditional: {
      sheet: 'Moonpiercer',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Moonpiercer',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Moonpiercer',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  MouunsMoon: {
    _someBoolConditional: {
      sheet: 'MouunsMoon',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'MouunsMoon',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'MouunsMoon',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  OathswornEye: {
    _someBoolConditional: {
      sheet: 'OathswornEye',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'OathswornEye',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'OathswornEye',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  OldMercsPal: {
    _someBoolConditional: {
      sheet: 'OldMercsPal',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'OldMercsPal',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'OldMercsPal',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  OtherworldlyStory: {
    _someBoolConditional: {
      sheet: 'OtherworldlyStory',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'OtherworldlyStory',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'OtherworldlyStory',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PocketGrimoire: {
    _someBoolConditional: {
      sheet: 'PocketGrimoire',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PocketGrimoire',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PocketGrimoire',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PolarStar: {
    _someBoolConditional: {
      sheet: 'PolarStar',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PolarStar',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PolarStar',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PortablePowerSaw: {
    _someBoolConditional: {
      sheet: 'PortablePowerSaw',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PortablePowerSaw',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PortablePowerSaw',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Predator: {
    _someBoolConditional: {
      sheet: 'Predator',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Predator',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Predator',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrimordialJadeCutter: {
    _someBoolConditional: {
      sheet: 'PrimordialJadeCutter',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrimordialJadeCutter',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrimordialJadeCutter',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrimordialJadeWingedSpear: {
    _someBoolConditional: {
      sheet: 'PrimordialJadeWingedSpear',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrimordialJadeWingedSpear',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrimordialJadeWingedSpear',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ProspectorsDrill: {
    _someBoolConditional: {
      sheet: 'ProspectorsDrill',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ProspectorsDrill',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ProspectorsDrill',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrototypeArchaic: {
    _someBoolConditional: {
      sheet: 'PrototypeArchaic',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrototypeArchaic',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrototypeArchaic',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrototypeCrescent: {
    _someBoolConditional: {
      sheet: 'PrototypeCrescent',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrototypeCrescent',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrototypeCrescent',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrototypeRancour: {
    _someBoolConditional: {
      sheet: 'PrototypeRancour',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrototypeRancour',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrototypeRancour',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  PrototypeStarglitter: {
    _someBoolConditional: {
      sheet: 'PrototypeStarglitter',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'PrototypeStarglitter',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'PrototypeStarglitter',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  QuantumCatalyst: {
    _someBoolConditional: {
      sheet: 'QuantumCatalyst',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'QuantumCatalyst',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'QuantumCatalyst',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Rainslasher: {
    _someBoolConditional: {
      sheet: 'Rainslasher',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Rainslasher',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Rainslasher',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RangeGauge: {
    _someBoolConditional: {
      sheet: 'RangeGauge',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RangeGauge',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RangeGauge',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RavenBow: {
    _someBoolConditional: {
      sheet: 'RavenBow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RavenBow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RavenBow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RecurveBow: {
    _someBoolConditional: {
      sheet: 'RecurveBow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RecurveBow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RecurveBow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RedhornStonethresher: {
    _someBoolConditional: {
      sheet: 'RedhornStonethresher',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RedhornStonethresher',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RedhornStonethresher',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RightfulReward: {
    _someBoolConditional: {
      sheet: 'RightfulReward',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RightfulReward',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RightfulReward',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RoyalBow: {
    _someBoolConditional: {
      sheet: 'RoyalBow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RoyalBow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RoyalBow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RoyalGreatsword: {
    _someBoolConditional: {
      sheet: 'RoyalGreatsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RoyalGreatsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RoyalGreatsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RoyalGrimoire: {
    _someBoolConditional: {
      sheet: 'RoyalGrimoire',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RoyalGrimoire',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RoyalGrimoire',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RoyalLongsword: {
    _someBoolConditional: {
      sheet: 'RoyalLongsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RoyalLongsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RoyalLongsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  RoyalSpear: {
    _someBoolConditional: {
      sheet: 'RoyalSpear',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'RoyalSpear',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'RoyalSpear',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Rust: {
    _someBoolConditional: {
      sheet: 'Rust',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Rust',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Rust',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SacrificialBow: {
    _someBoolConditional: {
      sheet: 'SacrificialBow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SacrificialBow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SacrificialBow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SacrificialFragments: {
    _someBoolConditional: {
      sheet: 'SacrificialFragments',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SacrificialFragments',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SacrificialFragments',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SacrificialGreatsword: {
    _someBoolConditional: {
      sheet: 'SacrificialGreatsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SacrificialGreatsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SacrificialGreatsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SacrificialJade: {
    _someBoolConditional: {
      sheet: 'SacrificialJade',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SacrificialJade',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SacrificialJade',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SacrificialSword: {
    _someBoolConditional: {
      sheet: 'SacrificialSword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SacrificialSword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SacrificialSword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SapwoodBlade: {
    _someBoolConditional: {
      sheet: 'SapwoodBlade',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SapwoodBlade',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SapwoodBlade',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ScionOfTheBlazingSun: {
    _someBoolConditional: {
      sheet: 'ScionOfTheBlazingSun',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ScionOfTheBlazingSun',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ScionOfTheBlazingSun',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SeasonedHuntersBow: {
    _someBoolConditional: {
      sheet: 'SeasonedHuntersBow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SeasonedHuntersBow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SeasonedHuntersBow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SerpentSpine: {
    _someBoolConditional: {
      sheet: 'SerpentSpine',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SerpentSpine',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SerpentSpine',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SharpshootersOath: {
    _someBoolConditional: {
      sheet: 'SharpshootersOath',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SharpshootersOath',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SharpshootersOath',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SilverSword: {
    _someBoolConditional: {
      sheet: 'SilverSword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SilverSword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SilverSword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SkyriderGreatsword: {
    _someBoolConditional: {
      sheet: 'SkyriderGreatsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SkyriderGreatsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SkyriderGreatsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SkyriderSword: {
    _someBoolConditional: {
      sheet: 'SkyriderSword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SkyriderSword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SkyriderSword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SkywardAtlas: {
    _someBoolConditional: {
      sheet: 'SkywardAtlas',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SkywardAtlas',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SkywardAtlas',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SkywardBlade: {
    _someBoolConditional: {
      sheet: 'SkywardBlade',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SkywardBlade',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SkywardBlade',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SkywardHarp: {
    _someBoolConditional: {
      sheet: 'SkywardHarp',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SkywardHarp',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SkywardHarp',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SkywardPride: {
    _someBoolConditional: {
      sheet: 'SkywardPride',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SkywardPride',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SkywardPride',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SkywardSpine: {
    _someBoolConditional: {
      sheet: 'SkywardSpine',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SkywardSpine',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SkywardSpine',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Slingshot: {
    _someBoolConditional: {
      sheet: 'Slingshot',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Slingshot',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Slingshot',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SnowTombedStarsilver: {
    _someBoolConditional: {
      sheet: 'SnowTombedStarsilver',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SnowTombedStarsilver',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SnowTombedStarsilver',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SolarPearl: {
    _someBoolConditional: {
      sheet: 'SolarPearl',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SolarPearl',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SolarPearl',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SongOfBrokenPines: {
    _someBoolConditional: {
      sheet: 'SongOfBrokenPines',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SongOfBrokenPines',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SongOfBrokenPines',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SongOfStillness: {
    _someBoolConditional: {
      sheet: 'SongOfStillness',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SongOfStillness',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SongOfStillness',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SplendorOfTranquilWaters: {
    _someBoolConditional: {
      sheet: 'SplendorOfTranquilWaters',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SplendorOfTranquilWaters',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SplendorOfTranquilWaters',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  StaffOfHoma: {
    _someBoolConditional: {
      sheet: 'StaffOfHoma',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'StaffOfHoma',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'StaffOfHoma',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  StaffOfTheScarletSands: {
    _someBoolConditional: {
      sheet: 'StaffOfTheScarletSands',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'StaffOfTheScarletSands',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'StaffOfTheScarletSands',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SummitShaper: {
    _someBoolConditional: {
      sheet: 'SummitShaper',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SummitShaper',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SummitShaper',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SwordOfDescension: {
    _someBoolConditional: {
      sheet: 'SwordOfDescension',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SwordOfDescension',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SwordOfDescension',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  SwordOfNarzissenkreuz: {
    _someBoolConditional: {
      sheet: 'SwordOfNarzissenkreuz',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'SwordOfNarzissenkreuz',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'SwordOfNarzissenkreuz',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TalkingStick: {
    _someBoolConditional: {
      sheet: 'TalkingStick',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TalkingStick',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TalkingStick',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheAlleyFlash: {
    _someBoolConditional: {
      sheet: 'TheAlleyFlash',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheAlleyFlash',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheAlleyFlash',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheBell: {
    _someBoolConditional: {
      sheet: 'TheBell',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheBell',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheBell',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheBlackSword: {
    _someBoolConditional: {
      sheet: 'TheBlackSword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheBlackSword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheBlackSword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheCatch: {
    _someBoolConditional: {
      sheet: 'TheCatch',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheCatch',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheCatch',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheDockhandsAssistant: {
    _someBoolConditional: {
      sheet: 'TheDockhandsAssistant',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheDockhandsAssistant',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheDockhandsAssistant',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheFirstGreatMagic: {
    _someBoolConditional: {
      sheet: 'TheFirstGreatMagic',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheFirstGreatMagic',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheFirstGreatMagic',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheFlute: {
    _someBoolConditional: {
      sheet: 'TheFlute',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheFlute',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheFlute',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheStringless: {
    _someBoolConditional: {
      sheet: 'TheStringless',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheStringless',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheStringless',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheUnforged: {
    _someBoolConditional: {
      sheet: 'TheUnforged',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheUnforged',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheUnforged',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheViridescentHunt: {
    _someBoolConditional: {
      sheet: 'TheViridescentHunt',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheViridescentHunt',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheViridescentHunt',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TheWidsith: {
    _someBoolConditional: {
      sheet: 'TheWidsith',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TheWidsith',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TheWidsith',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ThrillingTalesOfDragonSlayers: {
    _someBoolConditional: {
      sheet: 'ThrillingTalesOfDragonSlayers',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ThrillingTalesOfDragonSlayers',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ThrillingTalesOfDragonSlayers',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ThunderingPulse: {
    _someBoolConditional: {
      sheet: 'ThunderingPulse',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ThunderingPulse',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ThunderingPulse',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TidalShadow: {
    _someBoolConditional: {
      sheet: 'TidalShadow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TidalShadow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TidalShadow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TomeOfTheEternalFlow: {
    _someBoolConditional: {
      sheet: 'TomeOfTheEternalFlow',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TomeOfTheEternalFlow',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TomeOfTheEternalFlow',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  ToukabouShigure: {
    _someBoolConditional: {
      sheet: 'ToukabouShigure',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'ToukabouShigure',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'ToukabouShigure',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TravelersHandySword: {
    _someBoolConditional: {
      sheet: 'TravelersHandySword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TravelersHandySword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TravelersHandySword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  TulaytullahsRemembrance: {
    timePassive: {
      sheet: 'TulaytullahsRemembrance',
      name: 'timePassive',
      type: 'num',
      int_only: false,
      min: 0,
      max: 12,
    },
    hitPassive: {
      sheet: 'TulaytullahsRemembrance',
      name: 'hitPassive',
      type: 'num',
      int_only: true,
      min: 0,
      max: 5,
    },
  },
  TwinNephrite: {
    _someBoolConditional: {
      sheet: 'TwinNephrite',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'TwinNephrite',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'TwinNephrite',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  UltimateOverlordsMegaMagicSword: {
    _someBoolConditional: {
      sheet: 'UltimateOverlordsMegaMagicSword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'UltimateOverlordsMegaMagicSword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'UltimateOverlordsMegaMagicSword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  UrakuMisugiri: {
    _someBoolConditional: {
      sheet: 'UrakuMisugiri',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'UrakuMisugiri',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'UrakuMisugiri',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Verdict: {
    _someBoolConditional: {
      sheet: 'Verdict',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Verdict',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Verdict',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  VortexVanquisher: {
    _someBoolConditional: {
      sheet: 'VortexVanquisher',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'VortexVanquisher',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'VortexVanquisher',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WanderingEvenstar: {
    _someBoolConditional: {
      sheet: 'WanderingEvenstar',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WanderingEvenstar',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WanderingEvenstar',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WasterGreatsword: {
    _someBoolConditional: {
      sheet: 'WasterGreatsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WasterGreatsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WasterGreatsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WavebreakersFin: {
    _someBoolConditional: {
      sheet: 'WavebreakersFin',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WavebreakersFin',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WavebreakersFin',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WhiteIronGreatsword: {
    _someBoolConditional: {
      sheet: 'WhiteIronGreatsword',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WhiteIronGreatsword',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WhiteIronGreatsword',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WhiteTassel: {
    _someBoolConditional: {
      sheet: 'WhiteTassel',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WhiteTassel',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WhiteTassel',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  Whiteblind: {
    _someBoolConditional: {
      sheet: 'Whiteblind',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'Whiteblind',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'Whiteblind',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WindblumeOde: {
    _someBoolConditional: {
      sheet: 'WindblumeOde',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WindblumeOde',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WindblumeOde',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WineAndSong: {
    _someBoolConditional: {
      sheet: 'WineAndSong',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WineAndSong',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WineAndSong',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WolfFang: {
    _someBoolConditional: {
      sheet: 'WolfFang',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WolfFang',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WolfFang',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  WolfsGravestone: {
    _someBoolConditional: {
      sheet: 'WolfsGravestone',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'WolfsGravestone',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'WolfsGravestone',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
  XiphosMoonlight: {
    _someBoolConditional: {
      sheet: 'XiphosMoonlight',
      name: '_someBoolConditional',
      type: 'bool',
    },
    _someListConditional: {
      sheet: 'XiphosMoonlight',
      name: '_someListConditional',
      type: 'list',
      list: [],
    },
    _someNumConditional: {
      sheet: 'XiphosMoonlight',
      name: '_someNumConditional',
      type: 'num',
      int_only: true,
    },
  },
}
export const formulas = {
  Albedo: {
    normal1: {
      sheet: 'Albedo',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Albedo',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Alhaitham: {
    normal1: {
      sheet: 'Alhaitham',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Alhaitham',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Aloy: {
    normal1: {
      sheet: 'Aloy',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Aloy',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Amber: {
    normal1: {
      sheet: 'Amber',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Amber',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  AratakiItto: {
    normal1: {
      sheet: 'AratakiItto',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'AratakiItto',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Arlecchino: {
    normal1: {
      sheet: 'Arlecchino',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Arlecchino',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Baizhu: {
    normal1: {
      sheet: 'Baizhu',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Baizhu',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Barbara: {
    normal1: {
      sheet: 'Barbara',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Barbara',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Beidou: {
    normal1: {
      sheet: 'Beidou',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Beidou',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Bennett: {
    normal1: {
      sheet: 'Bennett',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Bennett',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Candace: {
    normal_0: {
      sheet: 'Candace',
      name: 'normal_0',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'normal',
        name: 'normal_0',
      },
    },
    normal_1: {
      sheet: 'Candace',
      name: 'normal_1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'normal',
        name: 'normal_1',
      },
    },
    normal_2: {
      sheet: 'Candace',
      name: 'normal_2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'normal',
        name: 'normal_2',
      },
    },
    normal_3: {
      sheet: 'Candace',
      name: 'normal_3',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'normal',
        name: 'normal_3',
      },
    },
    normal_4: {
      sheet: 'Candace',
      name: 'normal_4',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'normal',
        name: 'normal_4',
      },
    },
    charged: {
      sheet: 'Candace',
      name: 'charged',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'charged',
        name: 'charged',
      },
    },
    plunging_dmg: {
      sheet: 'Candace',
      name: 'plunging_dmg',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'plunging',
        name: 'plunging_dmg',
      },
    },
    plunging_low: {
      sheet: 'Candace',
      name: 'plunging_low',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'plunging',
        name: 'plunging_low',
      },
    },
    plunging_high: {
      sheet: 'Candace',
      name: 'plunging_high',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'plunging',
        name: 'plunging_high',
      },
    },
    skill_basic: {
      sheet: 'Candace',
      name: 'skill_basic',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'skill',
        name: 'skill_basic',
      },
    },
    skill_charged: {
      sheet: 'Candace',
      name: 'skill_charged',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'skill',
        name: 'skill_charged',
      },
    },
    burst_skill: {
      sheet: 'Candace',
      name: 'burst_skill',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'burst',
        name: 'burst_skill',
      },
    },
    burst_wave: {
      sheet: 'Candace',
      name: 'burst_wave',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'burst',
        name: 'burst_wave',
      },
    },
    skill_shield: {
      sheet: 'Candace',
      name: 'skill_shield',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'shield',
        sheet: 'Candace',
        name: 'skill_shield',
      },
    },
    skill_hydroShield: {
      sheet: 'Candace',
      name: 'skill_hydroShield',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'shield',
        sheet: 'Candace',
        ele: 'hydro',
        name: 'skill_hydroShield',
      },
    },
    c6: {
      sheet: 'Candace',
      name: 'c6',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Candace',
        move: 'burst',
        name: 'c6',
      },
    },
  },
  Charlotte: {
    normal1: {
      sheet: 'Charlotte',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Charlotte',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Chevreuse: {
    normal1: {
      sheet: 'Chevreuse',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Chevreuse',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Chiori: {
    normal1: {
      sheet: 'Chiori',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Chiori',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Chongyun: {
    normal1: {
      sheet: 'Chongyun',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Chongyun',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Clorinde: {
    normal1: {
      sheet: 'Clorinde',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Clorinde',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Collei: {
    normal1: {
      sheet: 'Collei',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Collei',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Cyno: {
    normal1: {
      sheet: 'Cyno',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Cyno',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Dehya: {
    normal1: {
      sheet: 'Dehya',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Dehya',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Diluc: {
    normal1: {
      sheet: 'Diluc',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Diluc',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Diona: {
    normal1: {
      sheet: 'Diona',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Diona',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Dori: {
    normal1: {
      sheet: 'Dori',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Dori',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Eula: {
    normal1: {
      sheet: 'Eula',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Eula',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Faruzan: {
    normal1: {
      sheet: 'Faruzan',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Faruzan',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Fischl: {
    normal1: {
      sheet: 'Fischl',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Fischl',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Freminet: {
    normal1: {
      sheet: 'Freminet',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Freminet',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Furina: {
    normal1: {
      sheet: 'Furina',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Furina',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Gaming: {
    normal1: {
      sheet: 'Gaming',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Gaming',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Ganyu: {
    normal1: {
      sheet: 'Ganyu',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Ganyu',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Gorou: {
    normal1: {
      sheet: 'Gorou',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Gorou',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  HuTao: {
    normal1: {
      sheet: 'HuTao',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'HuTao',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Jean: {
    normal1: {
      sheet: 'Jean',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Jean',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  KaedeharaKazuha: {
    normal1: {
      sheet: 'KaedeharaKazuha',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'KaedeharaKazuha',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Kaeya: {
    normal1: {
      sheet: 'Kaeya',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Kaeya',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  KamisatoAyaka: {
    normal1: {
      sheet: 'KamisatoAyaka',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'KamisatoAyaka',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  KamisatoAyato: {
    normal1: {
      sheet: 'KamisatoAyato',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'KamisatoAyato',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Kaveh: {
    normal1: {
      sheet: 'Kaveh',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Kaveh',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Keqing: {
    normal1: {
      sheet: 'Keqing',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Keqing',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Kirara: {
    normal1: {
      sheet: 'Kirara',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Kirara',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Klee: {
    normal1: {
      sheet: 'Klee',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Klee',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  KujouSara: {
    normal1: {
      sheet: 'KujouSara',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'KujouSara',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  KukiShinobu: {
    normal1: {
      sheet: 'KukiShinobu',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'KukiShinobu',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Layla: {
    normal1: {
      sheet: 'Layla',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Layla',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Lisa: {
    normal1: {
      sheet: 'Lisa',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Lisa',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Lynette: {
    normal1: {
      sheet: 'Lynette',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Lynette',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Lyney: {
    normal1: {
      sheet: 'Lyney',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Lyney',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Mika: {
    normal1: {
      sheet: 'Mika',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Mika',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Mona: {
    normal1: {
      sheet: 'Mona',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Mona',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Nahida: {
    normal_0: {
      sheet: 'Nahida',
      name: 'normal_0',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'normal',
        name: 'normal_0',
      },
    },
    normal_1: {
      sheet: 'Nahida',
      name: 'normal_1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'normal',
        name: 'normal_1',
      },
    },
    normal_2: {
      sheet: 'Nahida',
      name: 'normal_2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'normal',
        name: 'normal_2',
      },
    },
    normal_3: {
      sheet: 'Nahida',
      name: 'normal_3',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'normal',
        name: 'normal_3',
      },
    },
    charged: {
      sheet: 'Nahida',
      name: 'charged',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'charged',
        name: 'charged',
      },
    },
    plunging_dmg: {
      sheet: 'Nahida',
      name: 'plunging_dmg',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'plunging',
        name: 'plunging_dmg',
      },
    },
    plunging_low: {
      sheet: 'Nahida',
      name: 'plunging_low',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'plunging',
        name: 'plunging_low',
      },
    },
    plunging_high: {
      sheet: 'Nahida',
      name: 'plunging_high',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'plunging',
        name: 'plunging_high',
      },
    },
    skill_press: {
      sheet: 'Nahida',
      name: 'skill_press',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'skill',
        name: 'skill_press',
      },
    },
    skill_hold: {
      sheet: 'Nahida',
      name: 'skill_hold',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'skill',
        name: 'skill_hold',
      },
    },
    karma_dmg: {
      sheet: 'Nahida',
      name: 'karma_dmg',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nahida',
        move: 'skill',
        name: 'karma_dmg',
      },
    },
  },
  Navia: {
    normal1: {
      sheet: 'Navia',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Navia',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Neuvillette: {
    normal1: {
      sheet: 'Neuvillette',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Neuvillette',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Nilou: {
    normal_0: {
      sheet: 'Nilou',
      name: 'normal_0',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'normal',
        name: 'normal_0',
      },
    },
    normal_1: {
      sheet: 'Nilou',
      name: 'normal_1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'normal',
        name: 'normal_1',
      },
    },
    normal_2: {
      sheet: 'Nilou',
      name: 'normal_2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'normal',
        name: 'normal_2',
      },
    },
    charged_1: {
      sheet: 'Nilou',
      name: 'charged_1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'charged',
        name: 'charged_1',
      },
    },
    charged_2: {
      sheet: 'Nilou',
      name: 'charged_2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'charged',
        name: 'charged_2',
      },
    },
    plunging_dmg: {
      sheet: 'Nilou',
      name: 'plunging_dmg',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'plunging',
        name: 'plunging_dmg',
      },
    },
    plunging_low: {
      sheet: 'Nilou',
      name: 'plunging_low',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'plunging',
        name: 'plunging_low',
      },
    },
    plunging_high: {
      sheet: 'Nilou',
      name: 'plunging_high',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'plunging',
        name: 'plunging_high',
      },
    },
    skill_skill: {
      sheet: 'Nilou',
      name: 'skill_skill',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'skill',
        name: 'skill_skill',
      },
    },
    skill_dance1: {
      sheet: 'Nilou',
      name: 'skill_dance1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'skill',
        name: 'skill_dance1',
      },
    },
    skill_dance2: {
      sheet: 'Nilou',
      name: 'skill_dance2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'skill',
        name: 'skill_dance2',
      },
    },
    skill_whirl1: {
      sheet: 'Nilou',
      name: 'skill_whirl1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'skill',
        name: 'skill_whirl1',
      },
    },
    skill_whirl2: {
      sheet: 'Nilou',
      name: 'skill_whirl2',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'skill',
        name: 'skill_whirl2',
      },
    },
    skill_wheel: {
      sheet: 'Nilou',
      name: 'skill_wheel',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'skill',
        name: 'skill_wheel',
      },
    },
    skill_moon: {
      sheet: 'Nilou',
      name: 'skill_moon',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'skill',
        name: 'skill_moon',
      },
    },
    burst_skill: {
      sheet: 'Nilou',
      name: 'burst_skill',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'burst',
        name: 'burst_skill',
      },
    },
    burst_aeon: {
      sheet: 'Nilou',
      name: 'burst_aeon',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Nilou',
        move: 'burst',
        name: 'burst_aeon',
      },
    },
  },
  Ningguang: {
    normal1: {
      sheet: 'Ningguang',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Ningguang',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Noelle: {
    normal1: {
      sheet: 'Noelle',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Noelle',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Qiqi: {
    normal1: {
      sheet: 'Qiqi',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Qiqi',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  RaidenShogun: {
    normal1: {
      sheet: 'RaidenShogun',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'RaidenShogun',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Razor: {
    normal1: {
      sheet: 'Razor',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Razor',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Rosaria: {
    normal1: {
      sheet: 'Rosaria',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Rosaria',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  SangonomiyaKokomi: {
    normal1: {
      sheet: 'SangonomiyaKokomi',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'SangonomiyaKokomi',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Sayu: {
    normal1: {
      sheet: 'Sayu',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Sayu',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Sethos: {
    normal1: {
      sheet: 'Sethos',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Sethos',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Shenhe: {
    normal1: {
      sheet: 'Shenhe',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Shenhe',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  ShikanoinHeizou: {
    normal1: {
      sheet: 'ShikanoinHeizou',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'ShikanoinHeizou',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Somnia: {
    normal1: {
      sheet: 'Somnia',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Somnia',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Sucrose: {
    normal1: {
      sheet: 'Sucrose',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Sucrose',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Tartaglia: {
    normal1: {
      sheet: 'Tartaglia',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Tartaglia',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Thoma: {
    normal1: {
      sheet: 'Thoma',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Thoma',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Tighnari: {
    normal1: {
      sheet: 'Tighnari',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Tighnari',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Venti: {
    normal1: {
      sheet: 'Venti',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Venti',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Wanderer: {
    normal1: {
      sheet: 'Wanderer',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Wanderer',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Wriothesley: {
    normal1: {
      sheet: 'Wriothesley',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Wriothesley',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Xiangling: {
    normal1: {
      sheet: 'Xiangling',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Xiangling',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Xianyun: {
    normal1: {
      sheet: 'Xianyun',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Xianyun',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Xiao: {
    normal1: {
      sheet: 'Xiao',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Xiao',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Xingqiu: {
    normal1: {
      sheet: 'Xingqiu',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Xingqiu',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Xinyan: {
    normal1: {
      sheet: 'Xinyan',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Xinyan',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  YaeMiko: {
    normal1: {
      sheet: 'YaeMiko',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'YaeMiko',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Yanfei: {
    normal1: {
      sheet: 'Yanfei',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Yanfei',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Yaoyao: {
    normal1: {
      sheet: 'Yaoyao',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Yaoyao',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Yelan: {
    normal1: {
      sheet: 'Yelan',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Yelan',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Yoimiya: {
    normal1: {
      sheet: 'Yoimiya',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Yoimiya',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  YunJin: {
    normal1: {
      sheet: 'YunJin',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'YunJin',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  Zhongli: {
    normal1: {
      sheet: 'Zhongli',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'Zhongli',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  TravelerAnemo: {
    normal1: {
      sheet: 'TravelerAnemo',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'TravelerAnemo',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  TravelerGeo: {
    normal1: {
      sheet: 'TravelerGeo',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'TravelerGeo',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  TravelerElectro: {
    normal1: {
      sheet: 'TravelerElectro',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'TravelerElectro',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  TravelerDendro: {
    normal1: {
      sheet: 'TravelerDendro',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'TravelerDendro',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  TravelerHydro: {
    normal1: {
      sheet: 'TravelerHydro',
      name: 'normal1',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'dmg',
        sheet: 'TravelerHydro',
        move: 'normal',
        name: 'normal1',
      },
    },
  },
  PrototypeAmber: {
    heal: {
      sheet: 'PrototypeAmber',
      name: 'heal',
      tag: {
        et: 'self',
        qt: 'formula',
        q: 'heal',
        sheet: 'PrototypeAmber',
        name: 'heal',
      },
    },
  },
}
