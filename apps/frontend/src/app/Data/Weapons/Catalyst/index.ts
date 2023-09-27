import type { WeaponCatalystKey } from '@genshin-optimizer/consts'
import type WeaponSheet from '../WeaponSheet'
import ApprenticesNotes from './ApprenticesNotes'
import AThousandFloatingDreams from './AThousandFloatingDreams'
import BalladOfTheBoundlessBlue from './BalladOfTheBoundlessBlue'
import BlackcliffAgate from './BlackcliffAgate'
import DodocoTales from './DodocoTales'
import EmeraldOrb from './EmeraldOrb'
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
import OathswornEye from './OathswornEye'
import OtherworldlyStory from './OtherworldlyStory'
import PocketGrimoire from './PocketGrimoire'
import PrototypeAmber from './PrototypeAmber'
import QuantumCatalyst from './QuantumCatalyst'
import RoyalGrimoire from './RoyalGrimoire'
import SacrificialFragments from './SacrificialFragments'
import SacrificialJade from './SacrificialJade'
import SkywardAtlas from './SkywardAtlas'
import SolarPearl from './SolarPearl'
import TheWidsith from './TheWidsith'
import ThrillingTalesOfDragonSlayers from './ThrillingTalesOfDragonSlayers'
import TomeOfTheEternalFlow from './TomeOfTheEternalFlow'
import TulaytullahsRemembrance from './TulaytullahsRemembrance'
import TwinNephrite from './TwinNephrite'
import WanderingEvenstar from './WanderingEvenstar'
import WineAndSong from './WineAndSong'
const catalyst: Record<WeaponCatalystKey, WeaponSheet> = {
  ApprenticesNotes,
  AThousandFloatingDreams,
  BalladOfTheBoundlessBlue,
  BlackcliffAgate,
  DodocoTales,
  EmeraldOrb,
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
  OathswornEye,
  OtherworldlyStory,
  PocketGrimoire,
  PrototypeAmber,
  QuantumCatalyst,
  RoyalGrimoire,
  SacrificialFragments,
  SacrificialJade,
  SkywardAtlas,
  SolarPearl,
  TheWidsith,
  ThrillingTalesOfDragonSlayers,
  TomeOfTheEternalFlow,
  TulaytullahsRemembrance,
  TwinNephrite,
  WanderingEvenstar,
  WineAndSong,
} as const
export default catalyst
