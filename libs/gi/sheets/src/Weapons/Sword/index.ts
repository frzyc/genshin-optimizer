import type { WeaponSwordKey } from '@genshin-optimizer/gi/consts'
import type { WeaponSheet } from '../WeaponSheet'
import Absolution from './Absolution'
import AmenomaKageuchi from './AmenomaKageuchi'
import AquilaFavonia from './AquilaFavonia'
import AthameArtis from './AthameArtis'
import Azurelight from './Azurelight'
import BlackcliffLongsword from './BlackcliffLongsword'
import CalamityOfEshu from './CalamityOfEshu'
import CinnabarSpindle from './CinnabarSpindle'
import CoolSteel from './CoolSteel'
import DarkIronSword from './DarkIronSword'
import DullBlade from './DullBlade'
import FavoniusSword from './FavoniusSword'
import FesteringDesire from './FesteringDesire'
import FilletBlade from './FilletBlade'
import FinaleOfTheDeep from './FinaleOfTheDeep'
import FleuveCendreFerryman from './FleuveCendreFerryman'
import FluteOfEzpitzal from './FluteOfEzpitzal'
import FreedomSworn from './FreedomSworn'
import HaranGeppakuFutsu from './HaranGeppakuFutsu'
import HarbingerOfDawn from './HarbingerOfDawn'
import IronSting from './IronSting'
import KagotsurubeIsshin from './KagotsurubeIsshin'
import KeyOfKhajNisut from './KeyOfKhajNisut'
import LightOfFoliarIncision from './LightOfFoliarIncision'
import LionsRoar from './LionsRoar'
import MistsplitterReforged from './MistsplitterReforged'
import MoonweaversDawn from './MoonweaversDawn'
import PeakPatrolSong from './PeakPatrolSong'
import PrimordialJadeCutter from './PrimordialJadeCutter'
import PrototypeRancour from './PrototypeRancour'
import RoyalLongsword from './RoyalLongsword'
import SacrificialSword from './SacrificialSword'
import SapwoodBlade from './SapwoodBlade'
import SerenitysCall from './SerenitysCall'
import SilverSword from './SilverSword'
import SkyriderSword from './SkyriderSword'
import SkywardBlade from './SkywardBlade'
import SplendorOfTranquilWaters from './SplendorOfTranquilWaters'
import SturdyBone from './SturdyBone'
import SummitShaper from './SummitShaper'
import SwordOfDescension from './SwordOfDescension'
import SwordOfNarzissenkreuz from './SwordOfNarzissenkreuz'
import TheAlleyFlash from './TheAlleyFlash'
import TheBlackSword from './TheBlackSword'
import TheDockhandsAssistant from './TheDockhandsAssistant'
import TheFlute from './TheFlute'
import ToukabouShigure from './ToukabouShigure'
import TravelersHandySword from './TravelersHandySword'
import UrakuMisugiri from './UrakuMisugiri'
import WolfFang from './WolfFang'
import XiphosMoonlight from './XiphosMoonlight'
const sword: Record<WeaponSwordKey, WeaponSheet> = {
  Absolution,
  AmenomaKageuchi,
  AquilaFavonia,
  AthameArtis,
  Azurelight,
  BlackcliffLongsword,
  CalamityOfEshu,
  CinnabarSpindle,
  CoolSteel,
  DarkIronSword,
  DullBlade,
  FavoniusSword,
  FesteringDesire,
  FilletBlade,
  FinaleOfTheDeep,
  FleuveCendreFerryman,
  FluteOfEzpitzal,
  FreedomSworn,
  HaranGeppakuFutsu,
  HarbingerOfDawn,
  IronSting,
  KagotsurubeIsshin,
  KeyOfKhajNisut,
  LightOfFoliarIncision,
  LionsRoar,
  MistsplitterReforged,
  MoonweaversDawn,
  PeakPatrolSong,
  PrimordialJadeCutter,
  PrototypeRancour,
  RoyalLongsword,
  SacrificialSword,
  SapwoodBlade,
  SerenitysCall,
  SilverSword,
  SkyriderSword,
  SkywardBlade,
  SplendorOfTranquilWaters,
  SturdyBone,
  SummitShaper,
  SwordOfDescension,
  SwordOfNarzissenkreuz,
  TheAlleyFlash,
  TheBlackSword,
  TheDockhandsAssistant,
  TheFlute,
  ToukabouShigure,
  TravelersHandySword,
  UrakuMisugiri,
  WolfFang,
  XiphosMoonlight,
} as const
export default sword
