import { CharacterSheetKey } from '../../Types/consts'
import CharacterSheet from './CharacterSheet'
import { CharacterKey, GenderKey, TravelerKey, allTravelerKeys } from '@genshin-optimizer/consts'

import Albedo from './Albedo'
import Alhaitham from './Alhaitham'
import Aloy from './Aloy'
import Amber from './Amber'
import AratakiItto from './AratakiItto'
import Barbara from './Barbara'
import Beidou from './Beidou'
import Bennett from './Bennett'
import Candace from './Candace'
import Chongyun from './Chongyun'
import Collei from './Collei'
import Cyno from './Cyno'
import Diluc from './Diluc'
import Diona from './Diona'
import Dori from './Dori'
import Eula from './Eula'
import Faruzan from './Faruzan'
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
import KukiShinobu from './KukiShinobu'
import Layla from './Layla'
import Lisa from './Lisa'
import Mona from './Mona'
import Nahida from './Nahida'
import Nilou from './Nilou'
import Ningguang from './Ningguang'
import Noelle from './Noelle'
import Qiqi from './Qiqi'
import RaidenShogun from './RaidenShogun'
import Razor from './Razor'
import Rosaria from './Rosaria'
import SangonomiyaKokomi from './SangonomiyaKokomi'
import Sayu from './Sayu'
import Shenhe from "./Shenhe"
import ShikanoinHeizou from "./ShikanoinHeizou"
import Sucrose from "./Sucrose"
import Tartaglia from './Tartaglia'
import Wanderer from './Wanderer'
import Thoma from './Thoma'
import Tighnari from './Tighnari'
import TravelerAnemoF from './TravelerAnemoF'
import TravelerAnemoM from './TravelerAnemoM'
import TravelerDendroF from './TravelerDendroF'
import TravelerDendroM from './TravelerDendroM'
import TravelerElectroF from './TravelerElectroF'
import TravelerElectroM from './TravelerElectroM'
import TravelerGeoF from './TravelerGeoF'
import TravelerGeoM from './TravelerGeoM'
import Venti from './Venti'
import Xiangling from './Xiangling'
import Xiao from './Xiao'
import Xingqiu from './Xingqiu'
import Xinyan from './Xinyan'
import YaeMiko from './YaeMiko'
import Yanfei from './Yanfei'
import Yaoyao from './Yaoyao'
import Yelan from './Yelan'
import Yoimiya from './Yoimiya'
import YunJin from './YunJin'
import Zhongli from './Zhongli'

const characters: Record<CharacterSheetKey, CharacterSheet> = {
  Albedo,
  Alhaitham,
  Aloy,
  Amber,
  AratakiItto,
  Barbara,
  Beidou,
  Bennett,
  Candace,
  Chongyun,
  Collei,
  Cyno,
  Diluc,
  Diona,
  Dori,
  Eula,
  Faruzan,
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
  KukiShinobu,
  Layla,
  Lisa,
  Mona,
  Nahida,
  Nilou,
  Ningguang,
  Noelle,
  Qiqi,
  RaidenShogun,
  Razor,
  Rosaria,
  SangonomiyaKokomi,
  Sayu,
  Shenhe,
  ShikanoinHeizou,
  Sucrose,
  Tartaglia,
  Wanderer,
  Thoma,
  Tighnari,
  TravelerAnemoF,
  TravelerGeoF,
  TravelerElectroF,
  TravelerDendroF,
  TravelerAnemoM,
  TravelerGeoM,
  TravelerElectroM,
  TravelerDendroM,
  Venti,
  Xiangling,
  Xiao,
  Xingqiu,
  Xinyan,
  YaeMiko,
  Yanfei,
  Yaoyao,
  Yelan,
  Yoimiya,
  YunJin,
  Zhongli
} as const
export function getCharSheet(charKey: CharacterKey, gender: GenderKey = "F") {
  return characters[charKeyToCharSheetKey(charKey, gender)]
}

function charKeyToCharSheetKey(charKey: CharacterKey, gender: GenderKey): CharacterSheetKey {
  if (allTravelerKeys.includes(charKey as TravelerKey)) return `${charKey}${gender}` as CharacterSheetKey
  else return charKey as CharacterSheetKey
}

export default characters
