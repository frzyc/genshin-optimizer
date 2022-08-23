import { WeaponCatalystKey } from '../../../Types/consts'
import WeaponSheet from '../WeaponSheet'
import ApprenticesNotes from './ApprenticesNotes'
import BlackcliffAgate from './BlackcliffAgate'
import DodocoTales from './DodocoTales'
import EmeraldOrb from './EmeraldOrb'
import EverlastingMoonglow from './EverlastingMoonglow'
import EyeOfPerception from './EyeOfPerception'
import FavoniusCodex from './FavoniusCodex'
import Frostbearer from './Frostbearer'
import FruitOfFulfillment from './FruitOfFulfillment'
import HakushinRing from './HakushinRing'
import KagurasVerity from './KagurasVerity'
import LostPrayerToTheSacredWinds from './LostPrayerToTheSacredWinds'
import MagicGuide from './MagicGuide'
import MappaMare from './MappaMare'
import MemoryOfDust from './MemoryOfDust'
import OathswornEye from './OathswornEye'
import OtherworldlyStory from './OtherworldlyStory'
import PocketGrimoire from './PocketGrimoire'
import PrototypeAmber from './PrototypeAmber'
import RoyalGrimoire from './RoyalGrimoire'
import SacrificialFragments from './SacrificialFragments'
import SkywardAtlas from './SkywardAtlas'
import SolarPearl from './SolarPearl'
import TheWidsith from './TheWidsith'
import ThrillingTalesOfDragonSlayers from './ThrillingTalesOfDragonSlayers'
import TwinNephrite from './TwinNephrite'
import WineAndSong from './WineAndSong'
const catalyst: Record<WeaponCatalystKey, WeaponSheet> = {
  ApprenticesNotes,
  BlackcliffAgate,
  DodocoTales,
  EmeraldOrb,
  EverlastingMoonglow,
  EyeOfPerception,
  FavoniusCodex,
  Frostbearer,
  FruitOfFulfillment,
  HakushinRing,
  KagurasVerity,
  LostPrayerToTheSacredWinds,
  MagicGuide,
  MappaMare,
  MemoryOfDust,
  OathswornEye,
  OtherworldlyStory,
  PocketGrimoire,
  PrototypeAmber,
  RoyalGrimoire,
  SacrificialFragments,
  SkywardAtlas,
  SolarPearl,
  TheWidsith,
  ThrillingTalesOfDragonSlayers,
  TwinNephrite,
  WineAndSong,
} as const
export default catalyst
