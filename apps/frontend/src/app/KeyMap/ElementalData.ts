import type { ElementWithPhyKey } from '@genshin-optimizer/consts'

/**
 * @deprecated use the translated element keys
 */
const elementalData: StrictDict<ElementWithPhyKey, { name: string }> = {
  physical: { name: 'Physical' },
  anemo: { name: 'Anemo' },
  geo: { name: 'Geo' },
  electro: { name: 'Electro' },
  hydro: { name: 'Hydro' },
  pyro: { name: 'Pyro' },
  cryo: { name: 'Cryo' },
  dendro: { name: 'Dendro' },
}
export default elementalData
