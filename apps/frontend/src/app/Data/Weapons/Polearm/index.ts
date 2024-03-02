import type { WeaponPoleArmKey } from '@genshin-optimizer/gi/consts'
import type WeaponSheet from '../WeaponSheet'
import BalladOfTheFjords from './BalladOfTheFjords'
import BeginnersProtector from './BeginnersProtector'
import BlackTassel from './BlackTassel'
import BlackcliffPole from './BlackcliffPole'
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
import MissiveWindspear from './MissiveWindspear'
import Moonpiercer from './Moonpiercer'
import PrimordialJadeWingedSpear from './PrimordialJadeWingedSpear'
import ProspectorsDrill from './ProspectorsDrill'
import PrototypeStarglitter from './PrototypeStarglitter'
import RightfulReward from './RightfulReward'
import RoyalSpear from './RoyalSpear'
import SkywardSpine from './SkywardSpine'
import StaffOfHoma from './StaffOfHoma'
import StaffOfTheScarletSands from './StaffOfTheScarletSands'
import TheCatch from './TheCatch'
import VortexVanquisher from './VortexVanquisher'
import WavebreakersFin from './WavebreakersFin'
import WhiteTassel from './WhiteTassel'
const polearm: Record<WeaponPoleArmKey, WeaponSheet> = {
  BalladOfTheFjords,
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
  MissiveWindspear,
  Moonpiercer,
  PrimordialJadeWingedSpear,
  ProspectorsDrill,
  PrototypeStarglitter,
  RightfulReward,
  RoyalSpear,
  SkywardSpine,
  StaffOfHoma,
  StaffOfTheScarletSands,
  TheCatch,
  VortexVanquisher,
  WavebreakersFin,
  WhiteTassel,
} as const
export default polearm
