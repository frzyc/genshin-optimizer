import type { WeaponCatalystKey } from '@genshin-optimizer/gi/consts'
import type { WeaponSheet } from '../WeaponSheet'
import AThousandFloatingDreams from './AThousandFloatingDreams'
import ApprenticesNotes from './ApprenticesNotes'
import AshGravenDrinkingHorn from './AshGravenDrinkingHorn'
import BalladOfTheBoundlessBlue from './BalladOfTheBoundlessBlue'
import BlackcliffAgate from './BlackcliffAgate'
import BlackmarrowLantern from './BlackmarrowLantern'
import CashflowSupervision from './CashflowSupervision'
import CranesEchoingCall from './CranesEchoingCall'
import DodocoTales from './DodocoTales'
import EmeraldOrb from './EmeraldOrb'
import EtherlightSpindlelute from './EtherlightSpindlelute'
import EverlastingMoonglow from './EverlastingMoonglow'
import EyeOfPerception from './EyeOfPerception'
import FavoniusCodex from './FavoniusCodex'
import FlowingPurity from './FlowingPurity'
import Frostbearer from './Frostbearer'
import FruitOfFulfillment from './FruitOfFulfillment'
import HakushinRing from './HakushinRing'
import JadefallsSplendor from './JadefallsSplendor'
import KagurasVerity from './KagurasVerity'
import LostPrayerToTheSacredWinds from './LostPrayerToTheSacredWinds'
import MagicGuide from './MagicGuide'
import MappaMare from './MappaMare'
import MemoryOfDust from './MemoryOfDust'
import NightweaversLookingGlass from './NightweaversLookingGlass'
import OathswornEye from './OathswornEye'
import OtherworldlyStory from './OtherworldlyStory'
import PocketGrimoire from './PocketGrimoire'
import PrototypeAmber from './PrototypeAmber'
import QuantumCatalyst from './QuantumCatalyst'
import RingOfYaxche from './RingOfYaxche'
import RoyalGrimoire from './RoyalGrimoire'
import SacrificialFragments from './SacrificialFragments'
import SacrificialJade from './SacrificialJade'
import SkywardAtlas from './SkywardAtlas'
import SolarPearl from './SolarPearl'
import StarcallersWatch from './StarcallersWatch'
import SunnyMorningSleepIn from './SunnyMorningSleepIn'
import SurfsUp from './SurfsUp'
import TheWidsith from './TheWidsith'
import ThrillingTalesOfDragonSlayers from './ThrillingTalesOfDragonSlayers'
import TomeOfTheEternalFlow from './TomeOfTheEternalFlow'
import TulaytullahsRemembrance from './TulaytullahsRemembrance'
import TwinNephrite from './TwinNephrite'
import VividNotions from './VividNotions'
import WanderingEvenstar from './WanderingEvenstar'
import WaveridingWhirl from './WaveridingWhirl'
import WineAndSong from './WineAndSong'
const catalyst: Record<WeaponCatalystKey, WeaponSheet> = {
  ApprenticesNotes,
  AshGravenDrinkingHorn,
  AThousandFloatingDreams,
  BalladOfTheBoundlessBlue,
  BlackcliffAgate,
  BlackmarrowLantern,
  CashflowSupervision,
  CranesEchoingCall,
  DodocoTales,
  EmeraldOrb,
  EtherlightSpindlelute,
  EverlastingMoonglow,
  EyeOfPerception,
  FavoniusCodex,
  FlowingPurity,
  Frostbearer,
  FruitOfFulfillment,
  HakushinRing,
  JadefallsSplendor,
  KagurasVerity,
  LostPrayerToTheSacredWinds,
  MagicGuide,
  MappaMare,
  MemoryOfDust,
  NightweaversLookingGlass,
  OathswornEye,
  OtherworldlyStory,
  PocketGrimoire,
  PrototypeAmber,
  QuantumCatalyst,
  RingOfYaxche,
  RoyalGrimoire,
  SacrificialFragments,
  SacrificialJade,
  SkywardAtlas,
  SolarPearl,
  StarcallersWatch,
  SunnyMorningSleepIn,
  SurfsUp,
  TheWidsith,
  ThrillingTalesOfDragonSlayers,
  TomeOfTheEternalFlow,
  TulaytullahsRemembrance,
  TwinNephrite,
  VividNotions,
  WanderingEvenstar,
  WaveridingWhirl,
  WineAndSong,
} as const
export default catalyst
