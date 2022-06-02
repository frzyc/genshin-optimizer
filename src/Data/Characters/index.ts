import { CharacterKey } from '../../Types/consts'
import CharacterSheet from './CharacterSheet'

import Albedo from './Albedo'
import Aloy from './Aloy'
import Amber from './Amber'
import AratakiItto from './AratakiItto'
import Barbara from './Barbara'
import Beidou from './Beidou'
import Bennett from './Bennett'
import Chongyun from './Chongyun'
import Diluc from './Diluc'
import Diona from './Diona'
import Eula from './Eula'
import Fischl from './Fischl'
import Ganyu from './Ganyu'
import Gorou from './Gorou'
import HuTao from './HuTao'
import Jean from './Jean'
import KaedeharaKazuha from './KaedeharaKazuha'
import Kaeya from './Kaeya'
import KamisatoAyaka from './KamisatoAyaka'
import KamisatoAyato from './KamisatoAyato'
import Keqing from './Keqing'
import Klee from './Klee'
import KujouSara from './KujouSara'
// import KukiShinobu from './KukiShinobu'
import Lisa from './Lisa'
import Mona from './Mona'
import Ningguang from './Ningguang'
import Noelle from './Noelle'
import Qiqi from './Qiqi'
import RaidenShogun from './RaidenShogun'
import Razor from './Razor'
import Rosaria from './Rosaria'
import SangonomiyaKokomi from './SangonomiyaKokomi'
import Sayu from './Sayu'
import Shenhe from "./Shenhe"
import Sucrose from "./Sucrose"
import Tartaglia from './Tartaglia'
import Thoma from './Thoma'
import Traveler from './Traveler'
import Venti from './Venti'
import Xiangling from './Xiangling'
import Xiao from './Xiao'
import Xingqiu from './Xingqiu'
import Xinyan from './Xinyan'
import YaeMiko from './YaeMiko'
import Yanfei from './Yanfei'
import Yelan from './Yelan'
import Yoimiya from './Yoimiya'
import YunJin from './YunJin'
import Zhongli from './Zhongli'

const characters: Record<CharacterKey, CharacterSheet> = {
  Albedo,
  Aloy,
  Amber,
  AratakiItto,
  Barbara,
  Beidou,
  Bennett,
  Chongyun,
  Diluc,
  Diona,
  Eula,
  Fischl,
  Ganyu,
  Gorou,
  HuTao,
  Jean,
  KaedeharaKazuha,
  Kaeya,
  KamisatoAyaka,
  KamisatoAyato,
  Keqing,
  Klee,
  KujouSara,
  // KukiShinobu,
  Lisa,
  Mona,
  Ningguang,
  Noelle,
  Qiqi,
  RaidenShogun,
  Razor,
  Rosaria,
  SangonomiyaKokomi,
  Sayu,
  Shenhe,
  Sucrose,
  Tartaglia,
  Thoma,
  Traveler,
  Venti,
  Xiangling,
  Xiao,
  Xingqiu,
  Xinyan,
  YaeMiko,
  Yanfei,
  Yelan,
  Yoimiya,
  YunJin,
  Zhongli
} as const
export default characters
