// WARNING: Generated file, do not modify
export const conditionals = {
  basic_hit: { sheet: 'Yanagi', name: 'basic_hit', type: 'bool' },
  clarity: { sheet: 'Yanagi', name: 'clarity', type: 'bool' },
  exSpecial_used: { sheet: 'Yanagi', name: 'exSpecial_used', type: 'bool' },
  exposed: { sheet: 'Yanagi', name: 'exposed', type: 'bool' },
  jougen: { sheet: 'Yanagi', name: 'jougen', type: 'bool' },
  kagen: { sheet: 'Yanagi', name: 'kagen', type: 'bool' },
  polarityDisorder: {
    sheet: 'Yanagi',
    name: 'polarityDisorder',
    type: 'list',
    list: ['exSpecial', 'ult'],
  },
  shinrabanshou: { sheet: 'Yanagi', name: 'shinrabanshou', type: 'bool' },
  thrusts: {
    sheet: 'Yanagi',
    name: 'thrusts',
    type: 'num',
    int_only: true,
    min: 0,
    max: 4,
  },
} as const
