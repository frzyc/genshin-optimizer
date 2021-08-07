import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAnemo, faCryo, faDendro, faElectro, faGeo, faHydro, faPyro } from "../faIcons";

export function Anemo({ noColor = false }) {
  return <FontAwesomeIcon icon={faAnemo as any} className={noColor ? "" : "text-anemo"} />
}

export function Cryo({ noColor = false }) {
  return <FontAwesomeIcon icon={faCryo as any} className={noColor ? "" : "text-cryo"} />
}

export function Dendro({ noColor = false }) {
  return <FontAwesomeIcon icon={faDendro as any} className={noColor ? "" : "text-dendro"} />
}

export function Electro({ noColor = false }) {
  return <FontAwesomeIcon icon={faElectro as any} className={noColor ? "" : "text-electro"} />
}

export function Geo({ noColor = false }) {
  return <FontAwesomeIcon icon={faGeo as any} className={noColor ? "" : "text-geo"} />
}

export function Hydro({ noColor = false }) {
  return <FontAwesomeIcon icon={faHydro as any} className={noColor ? "" : "text-hydro"} />
}

export function Pyro({ noColor = false }) {
  return <FontAwesomeIcon icon={faPyro as any} className={noColor ? "" : "text-pyro"} />
}
const ElementalIcon = {
  anemo: <Anemo />,
  cryo: <Cryo />,
  dendro: <Dendro />,
  electro: <Electro />,
  geo: <Geo />,
  hydro: <Hydro />,
  pyro: <Pyro />,
}
export const ElementalIconComponent = {
  anemo: Anemo,
  cryo: Cryo,
  dendro: Dendro,
  electro: Electro,
  geo: Geo,
  hydro: Hydro,
  pyro: Pyro,
}
export default ElementalIcon