import type { WeaponBowKey } from '@genshin-optimizer/gi/consts'
import type { WeaponSheet } from '../WeaponSheet'

import AlleyHunter from './AlleyHunter'
import AmosBow from './AmosBow'
import AquaSimulacra from './AquaSimulacra'
import AstralVulturesCrimsonPlumage from './AstralVulturesCrimsonPlumage'
import BlackcliffWarbow from './BlackcliffWarbow'
import ChainBreaker from './ChainBreaker'
import Cloudforged from './Cloudforged'
import CompoundBow from './CompoundBow'
import ElegyForTheEnd from './ElegyForTheEnd'
import EndOfTheLine from './EndOfTheLine'
import FadingTwilight from './FadingTwilight'
import FavoniusWarbow from './FavoniusWarbow'
import FlowerWreathedFeathers from './FlowerWreathedFeathers'
import Hamayumi from './Hamayumi'
import HuntersBow from './HuntersBow'
import HuntersPath from './HuntersPath'
import IbisPiercer from './IbisPiercer'
import KingsSquire from './KingsSquire'
import Messenger from './Messenger'
import MitternachtsWaltz from './MitternachtsWaltz'
import MouunsMoon from './MouunsMoon'
import PolarStar from './PolarStar'
import Predator from './Predator'
import PrototypeCrescent from './PrototypeCrescent'
import RangeGauge from './RangeGauge'
import RavenBow from './RavenBow'
import RecurveBow from './RecurveBow'
import RoyalBow from './RoyalBow'
import Rust from './Rust'
import SacrificialBow from './SacrificialBow'
import ScionOfTheBlazingSun from './ScionOfTheBlazingSun'
import SeasonedHuntersBow from './SeasonedHuntersBow'
import SequenceOfSolitude from './SequenceOfSolitude'
import SharpshootersOath from './SharpshootersOath'
import SilvershowerHeartstrings from './SilvershowerHeartstrings'
import SkywardHarp from './SkywardHarp'
import Slingshot from './Slingshot'
import SongOfStillness from './SongOfStillness'
import TheFirstGreatMagic from './TheFirstGreatMagic'
import TheStringless from './TheStringless'
import TheViridescentHunt from './TheViridescentHunt'
import ThunderingPulse from './ThunderingPulse'
import WindblumeOde from './WindblumeOde'
const bow: Record<WeaponBowKey, WeaponSheet> = {
  AlleyHunter,
  AmosBow,
  AquaSimulacra,
  AstralVulturesCrimsonPlumage,
  BlackcliffWarbow,
  ChainBreaker,
  Cloudforged,
  CompoundBow,
  ElegyForTheEnd,
  EndOfTheLine,
  FadingTwilight,
  FavoniusWarbow,
  FlowerWreathedFeathers,
  Hamayumi,
  HuntersBow,
  HuntersPath,
  IbisPiercer,
  KingsSquire,
  Messenger,
  MitternachtsWaltz,
  MouunsMoon,
  PolarStar,
  Predator,
  PrototypeCrescent,
  RangeGauge,
  RavenBow,
  RecurveBow,
  RoyalBow,
  Rust,
  SacrificialBow,
  ScionOfTheBlazingSun,
  SeasonedHuntersBow,
  SequenceOfSolitude,
  SharpshootersOath,
  SilvershowerHeartstrings,
  SkywardHarp,
  Slingshot,
  SongOfStillness,
  TheFirstGreatMagic,
  TheStringless,
  TheViridescentHunt,
  ThunderingPulse,
  WindblumeOde,
} as const
export default bow
