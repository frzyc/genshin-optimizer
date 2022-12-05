import { WeaponSwordKey } from "../../../Types/consts"
import WeaponSheet from "../WeaponSheet"
import AmenomaKageuchi from "./AmenomaKageuchi"
import AquilaFavonia from "./AquilaFavonia"
import BlackcliffLongsword from "./BlackcliffLongsword"
import CinnabarSpindle from "./CinnabarSpindle"
import CoolSteel from "./CoolSteel"
import KagotsurubeIsshin from "./KagotsurubeIsshin"
import DarkIronSword from "./DarkIronSword"
import DullBlade from "./DullBlade"
import FavoniusSword from "./FavoniusSword"
import FesteringDesire from "./FesteringDesire"
import FilletBlade from "./FilletBlade"
import ToukabouShigure from "./ToukabouShigure"
import FreedomSworn from "./FreedomSworn"
import HaranGeppakuFutsu from "./HaranGeppakuFutsu"
import HarbingerOfDawn from "./HarbingerOfDawn"
import IronSting from "./IronSting"
import KeyOfKhajNisut from "./KeyOfKhajNisut"
import LionsRoar from "./LionsRoar"
import MistsplitterReforged from "./MistsplitterReforged"
import PrimordialJadeCutter from "./PrimordialJadeCutter"
import PrototypeRancour from "./PrototypeRancour"
import RoyalLongsword from "./RoyalLongsword"
import SacrificialSword from "./SacrificialSword"
import SapwoodBlade from "./SapwoodBlade"
import SilverSword from "./SilverSword"
import SkyriderSword from "./SkyriderSword"
import SkywardBlade from "./SkywardBlade"
import SummitShaper from "./SummitShaper"
import SwordOfDescension from "./SwordOfDescension"
import TheAlleyFlash from "./TheAlleyFlash"
import TheBlackSword from "./TheBlackSword"
import TheFlute from "./TheFlute"
import TravelersHandySword from "./TravelersHandySword"
import XiphosMoonlight from "./XiphosMoonlight"
const sword: Record<WeaponSwordKey, WeaponSheet> = {
  AmenomaKageuchi,
  AquilaFavonia,
  BlackcliffLongsword,
  CinnabarSpindle,
  CoolSteel,
  KagotsurubeIsshin,
  DarkIronSword,
  DullBlade,
  FavoniusSword,
  FesteringDesire,
  FilletBlade,
  ToukabouShigure,
  FreedomSworn,
  HaranGeppakuFutsu,
  HarbingerOfDawn,
  IronSting,
  KeyOfKhajNisut,
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
  TheFlute,
  TravelersHandySword,
  XiphosMoonlight,
} as const
export default sword
