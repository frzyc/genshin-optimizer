import type { WeaponPoleArmKey } from '@genshin-optimizer/gi/consts'
import type { WeaponSheet } from '../WeaponSheet'
import BalladOfTheFjords from './BalladOfTheFjords'
import BeginnersProtector from './BeginnersProtector'
import BlackTassel from './BlackTassel'
import BlackcliffPole from './BlackcliffPole'
import BloodsoakedRuins from './BloodsoakedRuins'
import CalamityQueller from './CalamityQueller'
import CrescentPike from './CrescentPike'
import CrimsonMoonsSemblance from './CrimsonMoonsSemblance'
import Deathmatch from './Deathmatch'
import DialoguesOfTheDesertSages from './DialoguesOfTheDesertSages'
import DragonsBane from './DragonsBane'
import DragonspineSpear from './DragonspineSpear'
import EngulfingLightning from './EngulfingLightning'
import FavoniusLance from './FavoniusLance'
import FootprintOfTheRainbow from './FootprintOfTheRainbow'
import FracturedHalo from './FracturedHalo'
import Halberd from './Halberd'
import IronPoint from './IronPoint'
import KitainCrossSpear from './KitainCrossSpear'
import LithicSpear from './LithicSpear'
import LumidouceElegy from './LumidouceElegy'
import MissiveWindspear from './MissiveWindspear'
import Moonpiercer from './Moonpiercer'
import MountainBracingBolt from './MountainBracingBolt'
import PrimordialJadeWingedSpear from './PrimordialJadeWingedSpear'
import ProspectorsDrill from './ProspectorsDrill'
import ProspectorsShovel from './ProspectorsShovel'
import PrototypeStarglitter from './PrototypeStarglitter'
import RightfulReward from './RightfulReward'
import RoyalSpear from './RoyalSpear'
import SacrificersStaff from './SacrificersStaff'
import SkywardSpine from './SkywardSpine'
import StaffOfHoma from './StaffOfHoma'
import StaffOfTheScarletSands from './StaffOfTheScarletSands'
import SymphonistOfScents from './SymphonistOfScents'
import TamayurateiNoOhanashi from './TamayurateiNoOhanashi'
import TheCatch from './TheCatch'
import VortexVanquisher from './VortexVanquisher'
import WavebreakersFin from './WavebreakersFin'
import WhiteTassel from './WhiteTassel'
const polearm: Record<WeaponPoleArmKey, WeaponSheet> = {
  BalladOfTheFjords,
  BeginnersProtector,
  BlackcliffPole,
  BlackTassel,
  BloodsoakedRuins,
  CalamityQueller,
  CrescentPike,
  CrimsonMoonsSemblance,
  Deathmatch,
  DialoguesOfTheDesertSages,
  DragonsBane,
  DragonspineSpear,
  EngulfingLightning,
  FavoniusLance,
  FootprintOfTheRainbow,
  FracturedHalo,
  Halberd,
  IronPoint,
  KitainCrossSpear,
  LithicSpear,
  LumidouceElegy,
  MissiveWindspear,
  Moonpiercer,
  MountainBracingBolt,
  PrimordialJadeWingedSpear,
  ProspectorsDrill,
  ProspectorsShovel,
  PrototypeStarglitter,
  RightfulReward,
  RoyalSpear,
  SacrificersStaff,
  SkywardSpine,
  StaffOfHoma,
  StaffOfTheScarletSands,
  SymphonistOfScents,
  TamayurateiNoOhanashi,
  TheCatch,
  VortexVanquisher,
  WavebreakersFin,
  WhiteTassel,
} as const
export default polearm
