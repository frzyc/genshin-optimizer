import type { WeaponSwordKey } from '@genshin-optimizer/consts'
import type WeaponSheet from '../WeaponSheet'
import AmenomaKageuchi from './AmenomaKageuchi'
import AquilaFavonia from './AquilaFavonia'
import BlackcliffLongsword from './BlackcliffLongsword'
import CinnabarSpindle from './CinnabarSpindle'
import CoolSteel from './CoolSteel'
import DarkIronSword from './DarkIronSword'
import DullBlade from './DullBlade'
import FavoniusSword from './FavoniusSword'
import FesteringDesire from './FesteringDesire'
import FilletBlade from './FilletBlade'
import FinaleOfTheDeep from './FinaleOfTheDeep'
import FleuveCendreFerryman from './FleuveCendreFerryman'
import FreedomSworn from './FreedomSworn'
import HaranGeppakuFutsu from './HaranGeppakuFutsu'
import HarbingerOfDawn from './HarbingerOfDawn'
import IronSting from './IronSting'
import KagotsurubeIsshin from './KagotsurubeIsshin'
import KeyOfKhajNisut from './KeyOfKhajNisut'
import LightOfFoliarIncision from './LightOfFoliarIncision'
import LionsRoar from './LionsRoar'
import MistsplitterReforged from './MistsplitterReforged'
import PrimordialJadeCutter from './PrimordialJadeCutter'
import PrototypeRancour from './PrototypeRancour'
import RoyalLongsword from './RoyalLongsword'
import SacrificialSword from './SacrificialSword'
import SapwoodBlade from './SapwoodBlade'
import SilverSword from './SilverSword'
import SkyriderSword from './SkyriderSword'
import SkywardBlade from './SkywardBlade'
import SummitShaper from './SummitShaper'
import SwordOfDescension from './SwordOfDescension'
import TheAlleyFlash from './TheAlleyFlash'
import TheBlackSword from './TheBlackSword'
import TheDockhandsAssistant from './TheDockhandsAssistant'
import TheFlute from './TheFlute'
import ToukabouShigure from './ToukabouShigure'
import TravelersHandySword from './TravelersHandySword'
import WolfFang from './WolfFang'
import XiphosMoonlight from './XiphosMoonlight'
const sword: Record<WeaponSwordKey, WeaponSheet> = {
  AmenomaKageuchi,
  AquilaFavonia,
  BlackcliffLongsword,
  CinnabarSpindle,
  CoolSteel,
  DarkIronSword,
  DullBlade,
  FavoniusSword,
  FesteringDesire,
  FilletBlade,
  FinaleOfTheDeep,
  FleuveCendreFerryman,
  FreedomSworn,
  HaranGeppakuFutsu,
  HarbingerOfDawn,
  IronSting,
  KagotsurubeIsshin,
  KeyOfKhajNisut,
  LightOfFoliarIncision,
  LionsRoar,
  MistsplitterReforged,
  PrimordialJadeCutter,
  PrototypeRancour,
  RoyalLongsword,
  SacrificialSword,
  SapwoodBlade,
  SilverSword,
  SkyriderSword,
  SkywardBlade,
  SummitShaper,
  SwordOfDescension,
  TheAlleyFlash,
  TheBlackSword,
  TheDockhandsAssistant,
  TheFlute,
  ToukabouShigure,
  TravelersHandySword,
  WolfFang,
  XiphosMoonlight,
} as const
export default sword
