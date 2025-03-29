import type {
  CharacterKey,
  CharacterSheetKey,
  GenderKey,
  TravelerKey,
} from '@genshin-optimizer/gi/consts'
import { allTravelerKeys } from '@genshin-optimizer/gi/consts'
import type { CharacterSheet } from './CharacterSheet'

import Albedo from './Albedo'
import Alhaitham from './Alhaitham'
import Aloy from './Aloy'
import Amber from './Amber'
import AratakiItto from './AratakiItto'
import Arlecchino from './Arlecchino'
import Baizhu from './Baizhu'
import Barbara from './Barbara'
import Beidou from './Beidou'
import Bennett from './Bennett'
import Candace from './Candace'
import Charlotte from './Charlotte'
import Chasca from './Chasca'
import Chevreuse from './Chevreuse'
import Chiori from './Chiori'
import Chongyun from './Chongyun'
import Citlali from './Citlali'
import Clorinde from './Clorinde'
import Collei from './Collei'
import Cyno from './Cyno'
import Dehya from './Dehya'
import Diluc from './Diluc'
import Diona from './Diona'
import Dori from './Dori'
import Emilie from './Emilie'
import Eula from './Eula'
import Faruzan from './Faruzan'
import Fischl from './Fischl'
import Freminet from './Freminet'
import Furina from './Furina'
import Gaming from './Gaming'
import Ganyu from './Ganyu'
import Gorou from './Gorou'
import HuTao from './HuTao'
import Iansan from './Iansan'
import Jean from './Jean'
import Kachina from './Kachina'
import KaedeharaKazuha from './KaedeharaKazuha'
import Kaeya from './Kaeya'
import KamisatoAyaka from './KamisatoAyaka'
import KamisatoAyato from './KamisatoAyato'
import Kaveh from './Kaveh'
import Keqing from './Keqing'
import Kinich from './Kinich'
import Kirara from './Kirara'
import Klee from './Klee'
import KujouSara from './KujouSara'
import KukiShinobu from './KukiShinobu'
import LanYan from './LanYan'
import Layla from './Layla'
import Lisa from './Lisa'
import Lynette from './Lynette'
import Lyney from './Lyney'
import Mavuika from './Mavuika'
import Mika from './Mika'
import Mona from './Mona'
import Mualani from './Mualani'
import Nahida from './Nahida'
import Navia from './Navia'
import Neuvillette from './Neuvillette'
import Nilou from './Nilou'
import Ningguang from './Ningguang'
import Noelle from './Noelle'
import Ororon from './Ororon'
import Qiqi from './Qiqi'
import RaidenShogun from './RaidenShogun'
import Razor from './Razor'
import Rosaria from './Rosaria'
import SangonomiyaKokomi from './SangonomiyaKokomi'
import Sayu from './Sayu'
import Sethos from './Sethos'
import Shenhe from './Shenhe'
import ShikanoinHeizou from './ShikanoinHeizou'
import Sigewinne from './Sigewinne'
import Somnia from './Somnia'
import Sucrose from './Sucrose'
import Tartaglia from './Tartaglia'
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
import TravelerHydroF from './TravelerHydroF'
import TravelerHydroM from './TravelerHydroM'
import TravelerPyroF from './TravelerPyroF'
import TravelerPyroM from './TravelerPyroM'
import Varesa from './Varesa'
import Venti from './Venti'
import Wanderer from './Wanderer'
import Wriothesley from './Wriothesley'
import Xiangling from './Xiangling'
import Xianyun from './Xianyun'
import Xiao from './Xiao'
import Xilonen from './Xilonen'
import Xingqiu from './Xingqiu'
import Xinyan from './Xinyan'
import YaeMiko from './YaeMiko'
import Yanfei from './Yanfei'
import Yaoyao from './Yaoyao'
import Yelan from './Yelan'
import Yoimiya from './Yoimiya'
import YumemizukiMizuki from './YumemizukiMizuki'
import YunJin from './YunJin'
import Zhongli from './Zhongli'

const characters: Record<CharacterSheetKey, CharacterSheet> = {
  Albedo,
  Alhaitham,
  Aloy,
  Amber,
  AratakiItto,
  Arlecchino,
  Baizhu,
  Barbara,
  Beidou,
  Bennett,
  Candace,
  Charlotte,
  Chasca,
  Chevreuse,
  Chiori,
  Chongyun,
  Citlali,
  Clorinde,
  Collei,
  Cyno,
  Dehya,
  Diluc,
  Diona,
  Dori,
  Emilie,
  Eula,
  Faruzan,
  Fischl,
  Freminet,
  Furina,
  Gaming,
  Ganyu,
  Gorou,
  HuTao,
  Iansan,
  Jean,
  Kachina,
  KaedeharaKazuha,
  Kaeya,
  KamisatoAyaka,
  KamisatoAyato,
  Kaveh,
  Keqing,
  Kinich,
  Kirara,
  Klee,
  KujouSara,
  KukiShinobu,
  LanYan,
  Layla,
  Lisa,
  Lynette,
  Lyney,
  Mavuika,
  Mika,
  Mona,
  Mualani,
  Nahida,
  Navia,
  Neuvillette,
  Nilou,
  Ningguang,
  Noelle,
  Ororon,
  Qiqi,
  RaidenShogun,
  Razor,
  Rosaria,
  SangonomiyaKokomi,
  Sayu,
  Sethos,
  Shenhe,
  ShikanoinHeizou,
  Sigewinne,
  Somnia,
  Sucrose,
  Tartaglia,
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
  TravelerHydroF,
  TravelerHydroM,
  TravelerPyroF,
  TravelerPyroM,
  Varesa,
  Venti,
  Wanderer,
  Wriothesley,
  Xiangling,
  Xianyun,
  Xiao,
  Xilonen,
  Xingqiu,
  Xinyan,
  YaeMiko,
  Yanfei,
  Yaoyao,
  Yelan,
  Yoimiya,
  YumemizukiMizuki,
  YunJin,
  Zhongli,
} as const
export function getCharSheet(charKey: CharacterKey, gender: GenderKey) {
  return characters[charKeyToCharSheetKey(charKey, gender)]
}

function charKeyToCharSheetKey(
  charKey: CharacterKey,
  gender: GenderKey
): CharacterSheetKey {
  if (allTravelerKeys.includes(charKey as TravelerKey))
    return `${charKey}${gender}` as CharacterSheetKey
  else return charKey as CharacterSheetKey
}

export default characters
