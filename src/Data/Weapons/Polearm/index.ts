import { WeaponPoleArmKey } from '../../../Types/consts'
import WeaponSheet from '../WeaponSheet'
import BeginnersProtector from './BeginnersProtector'
import BlackcliffPole from './BlackcliffPole'
import BlackTassel from './BlackTassel'
import CalamityQueller from './CalamityQueller'
import CrescentPike from './CrescentPike'
import Deathmatch from './Deathmatch'
import DragonsBane from './DragonsBane'
import DragonspineSpear from './DragonspineSpear'
import EngulfingLightning from './EngulfingLightning'
import FavoniusLance from './FavoniusLance'
import Halberd from './Halberd'
import IronPoint from './IronPoint'
import KitainCrossSpear from './KitainCrossSpear'
import LithicSpear from './LithicSpear'
import Moonpiercer from './Moonpiercer'
import PrimordialJadeWingedSpear from './PrimordialJadeWingedSpear'
import PrototypeStarglitter from './PrototypeStarglitter'
import RoyalSpear from './RoyalSpear'
import SkywardSpine from './SkywardSpine'
import StaffOfHoma from './StaffOfHoma'
import TheCatch from './TheCatch'
import VortexVanquisher from './VortexVanquisher'
import WavebreakersFin from './WavebreakersFin'
import WhiteTassel from './WhiteTassel'
const polearm: Record<WeaponPoleArmKey, WeaponSheet> = {
  BeginnersProtector,
  BlackcliffPole,
  BlackTassel,
  CalamityQueller,
  CrescentPike,
  Deathmatch,
  DragonsBane,
  DragonspineSpear,
  EngulfingLightning,
  FavoniusLance,
  Halberd,
  IronPoint,
  KitainCrossSpear,
  LithicSpear,
  Moonpiercer,
  PrimordialJadeWingedSpear,
  PrototypeStarglitter,
  RoyalSpear,
  SkywardSpine,
  StaffOfHoma,
  TheCatch,
  VortexVanquisher,
  WavebreakersFin,
  WhiteTassel,
} as const
export default polearm
