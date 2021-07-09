import { ElementKey } from "../Types/consts"

const ElementalData: StrictDict<ElementKey | "physical", { name: string }> = {
  physical: { name: "Physical" },
  anemo: { name: "Anemo" },
  geo: { name: "Geo" },
  electro: { name: "Electro" },
  hydro: { name: "Hydro" },
  pyro: { name: "Pyro" },
  cryo: { name: "Cryo" },
  // dendro: { name: "Dendro" }
}
export default ElementalData