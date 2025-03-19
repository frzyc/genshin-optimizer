import type { WeaponClaymoreKey } from '@genshin-optimizer/gi/consts'
import type { WeaponSheet } from '../WeaponSheet'

import AThousandBlazingSuns from './AThousandBlazingSuns'
import Akuoumaru from './Akuoumaru'
import BeaconOfTheReedSea from './BeaconOfTheReedSea'
import BlackcliffSlasher from './BlackcliffSlasher'
import BloodtaintedGreatsword from './BloodtaintedGreatsword'
import DebateClub from './DebateClub'
import EarthShaker from './EarthShaker'
import FangOfTheMountainKing from './FangOfTheMountainKing'
import FavoniusGreatsword from './FavoniusGreatsword'
import FerrousShadow from './FerrousShadow'
import ForestRegalia from './ForestRegalia'
import FruitfulHook from './FruitfulHook'
import KatsuragikiriNagamasa from './KatsuragikiriNagamasa'
import LithicBlade from './LithicBlade'
import LuxuriousSeaLord from './LuxuriousSeaLord'
import MailedFlower from './MailedFlower'
import MakhairaAquamarine from './MakhairaAquamarine'
import OldMercsPal from './OldMercsPal'
import PortablePowerSaw from './PortablePowerSaw'
import PrototypeArchaic from './PrototypeArchaic'
import Rainslasher from './Rainslasher'
import RedhornStonethresher from './RedhornStonethresher'
import RoyalGreatsword from './RoyalGreatsword'
import SacrificialGreatsword from './SacrificialGreatsword'
import SerpentSpine from './SerpentSpine'
import SkyriderGreatsword from './SkyriderGreatsword'
import SkywardPride from './SkywardPride'
import SnowTombedStarsilver from './SnowTombedStarsilver'
import SongOfBrokenPines from './SongOfBrokenPines'
import TalkingStick from './TalkingStick'
import TheBell from './TheBell'
import TheUnforged from './TheUnforged'
import TidalShadow from './TidalShadow'
import UltimateOverlordsMegaMagicSword from './UltimateOverlordsMegaMagicSword'
import Verdict from './Verdict'
import WasterGreatsword from './WasterGreatsword'
import WhiteIronGreatsword from './WhiteIronGreatsword'
import Whiteblind from './Whiteblind'
import WolfsGravestone from './WolfsGravestone'
const claymore: Record<WeaponClaymoreKey, WeaponSheet> = {
  Akuoumaru,
  AThousandBlazingSuns,
  BeaconOfTheReedSea,
  BlackcliffSlasher,
  BloodtaintedGreatsword,
  DebateClub,
  EarthShaker,
  FangOfTheMountainKing,
  FavoniusGreatsword,
  FerrousShadow,
  ForestRegalia,
  FruitfulHook,
  KatsuragikiriNagamasa,
  LithicBlade,
  LuxuriousSeaLord,
  MailedFlower,
  MakhairaAquamarine,
  OldMercsPal,
  PortablePowerSaw,
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
  TalkingStick,
  TheBell,
  TheUnforged,
  TidalShadow,
  UltimateOverlordsMegaMagicSword,
  Verdict,
  WasterGreatsword,
  Whiteblind,
  WhiteIronGreatsword,
  WolfsGravestone,
} as const
export default claymore
