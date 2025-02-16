import type { Calculator, Read, Tag } from '@genshin-optimizer/game-opt/engine'

export type GenericRead = Read<
  Tag<string | null, string | null, string>,
  string | null,
  string | null,
  string
>
export type GenericCalculator = Calculator<
  string | null,
  string | null,
  string,
  string
>
