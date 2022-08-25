import { WeaponClaymoreKey } from "../../../Types/consts"
import WeaponSheet from "../WeaponSheet"
import Akuoumaru from "./Akuoumaru"
import BlackcliffSlasher from "./BlackcliffSlasher"
import BloodtaintedGreatsword from "./BloodtaintedGreatsword"
import DebateClub from "./DebateClub"
import FavoniusGreatsword from "./FavoniusGreatsword"
import FerrousShadow from "./FerrousShadow"
import ForestRegalia from "./ForestRegalia"
import KatsuragikiriNagamasa from "./KatsuragikiriNagamasa"
import LithicBlade from "./LithicBlade"
import LuxuriousSeaLord from "./LuxuriousSeaLord"
import OldMercsPal from "./OldMercsPal"
import PrototypeArchaic from "./PrototypeArchaic"
import Rainslasher from "./Rainslasher"
import RedhornStonethresher from "./RedhornStonethresher"
import RoyalGreatsword from "./RoyalGreatsword"
import SacrificialGreatsword from "./SacrificialGreatsword"
import SerpentSpine from "./SerpentSpine"
import SkyriderGreatsword from "./SkyriderGreatsword"
import SkywardPride from "./SkywardPride"
import SnowTombedStarsilver from "./SnowTombedStarsilver"
import SongOfBrokenPines from "./SongOfBrokenPines"
import TheBell from "./TheBell"
import TheUnforged from "./TheUnforged"
import WasterGreatsword from "./WasterGreatsword"
import Whiteblind from "./Whiteblind"
import WhiteIronGreatsword from "./WhiteIronGreatsword"
import WolfsGravestone from "./WolfsGravestone"
const claymore: Record<WeaponClaymoreKey, WeaponSheet> = {
  Akuoumaru,
  BlackcliffSlasher,
  BloodtaintedGreatsword,
  DebateClub,
  FavoniusGreatsword,
  FerrousShadow,
  ForestRegalia,
  KatsuragikiriNagamasa,
  LithicBlade,
  LuxuriousSeaLord,
  OldMercsPal,
  PrototypeArchaic,
  Rainslasher,
  RedhornStonethresher,
  RoyalGreatsword,
  SacrificialGreatsword,
  SerpentSpine,
  SkyriderGreatsword,
  SkywardPride,
  SnowTombedStarsilver,
  SongOfBrokenPines,
  TheBell,
  TheUnforged,
  WasterGreatsword,
  Whiteblind,
  WhiteIronGreatsword,
  WolfsGravestone,
} as const
export default claymore
