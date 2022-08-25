import { WeaponBowKey } from '../../../Types/consts'
import WeaponSheet from '../WeaponSheet'

import AlleyHunter from './AlleyHunter'
import AmosBow from "./AmosBow"
import AquaSimulacra from "./AquaSimulacra"
import BlackcliffWarbow from './BlackcliffWarbow'
import CompoundBow from './CompoundBow'
import ElegyForTheEnd from "./ElegyForTheEnd"
import FadingTwilight from "./FadingTwilight"
import FavoniusWarbow from './FavoniusWarbow'
import Hamayumi from './Hamayumi'
import HuntersBow from "./HuntersBow"
import HuntersPath from './HuntersPath'
import KingsSquire from './KingsSquire'
import Messenger from './Messenger'
import MitternachtsWaltz from './MitternachtsWaltz'
import MouunsMoon from './MouunsMoon'
import PolarStar from './PolarStar'
import Predator from './Predator'
import PrototypeCrescent from './PrototypeCrescent'
import RavenBow from './RavenBow'
import RecurveBow from './RecurveBow'
import RoyalBow from './RoyalBow'
import Rust from './Rust'
import SacrificialBow from "./SacrificialBow"
import SeasonedHuntersBow from './SeasonedHuntersBow'
import SharpshootersOath from './SharpshootersOath'
import SkywardHarp from './SkywardHarp'
import Slingshot from './Slingshot'
import TheStringless from './TheStringless'
import TheViridescentHunt from './TheViridescentHunt'
import ThunderingPulse from './ThunderingPulse'
import EndOfTheLine from './EndOfTheLine'
import WindblumeOde from './WindblumeOde'

const bow: Record<WeaponBowKey, WeaponSheet> = {
  AlleyHunter,
  AmosBow,
  AquaSimulacra,
  BlackcliffWarbow,
  CompoundBow,
  ElegyForTheEnd,
  FadingTwilight,
  FavoniusWarbow,
  Hamayumi,
  HuntersBow,
  HuntersPath,
  KingsSquire,
  Messenger,
  MitternachtsWaltz,
  MouunsMoon,
  PolarStar,
  Predator,
  PrototypeCrescent,
  RavenBow,
  RecurveBow,
  RoyalBow,
  Rust,
  SacrificialBow,
  SeasonedHuntersBow,
  SharpshootersOath,
  SkywardHarp,
  Slingshot,
  TheStringless,
  TheViridescentHunt,
  ThunderingPulse,
  EndOfTheLine,
  WindblumeOde,
} as const
export default bow
