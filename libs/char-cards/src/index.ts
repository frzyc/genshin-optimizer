import type { CharacterKey, GenderKey } from '@genshin-optimizer/consts'
import Albedo from './Character_Albedo_Card.png'
import Alhaitham from './Character_Alhaitham_Card.jpg'
import Aloy from './Character_Aloy_Card.png'
import Amber from './Character_Amber_Card.jpg'
import AratakiItto from './Character_Arataki_Itto_Card.jpg'
import Baizhu from './Character_Baizhu_Card.jpg'
import Barbara from './Character_Barbara_Card.jpg'
import Beidou from './Character_Beidou_Card.jpg'
import Bennett from './Character_Bennett_Card.jpg'
import Candace from './Character_Candace_Card.jpg'
import Chongyun from './Character_Chongyun_Card.jpg'
import Collei from './Character_Collei_Card.jpg'
import Cyno from './Character_Cyno_Card.jpg'
import Dehya from './Character_Dehya_Card.jpg'
import Diluc from './Character_Diluc_Card.jpg'
import Diona from './Character_Diona_Card.png'
import Dori from './Character_Dori_Card.jpg'
import Eula from './Character_Eula_Card.png'
import Faruzan from './Character_Faruzan_Card.jpg'
import Fischl from './Character_Fischl_Card.jpg'
import Freminet from './Character_Freminet_Card.jpg'
import Ganyu from './Character_Ganyu_Card.png'
import Gorou from './Character_Gorou_Card.png'
import HuTao from './Character_Hu_Tao_Card.png'
import Jean from './Character_Jean_Card.jpg'
import Kaeya from './Character_Kaeya_Card.jpg'
import Kaveh from './Character_Kaveh_Card.jpg'
import KamisatoAyaka from './Character_Kamisato_Ayaka_Card.png'
import KamisatoAyato from './Character_Kamisato_Ayato_Card.png'
import KaedeharaKazuha from './Character_Kazuha_Card.png'
import Keqing from './Character_Keqing_Card.jpg'
import Kirara from './Character_Kirara_Card.jpg'
import Klee from './Character_Klee_Card.jpg'
import KujouSara from './Character_Kujou_Sara_Card.jpg'
import KukiShinobu from './Character_Kuki_Shinobu_Card.jpg'
import Layla from './Character_Layla_Card.jpeg'
import Lisa from './Character_Lisa_Card.jpg'
import Lyney from './Character_Lyney_Card.jpg'
import Lynette from './Character_Lynette_Card.jpg'
import Mika from './Character_Mika_Card.jpg'
import Mona from './Character_Mona_Card.jpg'
import Nahida from './Character_Nahida_Card.jpeg'
import Neuvillette from './Character_Neuvillette_Card.jpg'
import Nilou from './Character_Nilou_Card.jpg'
import Ningguang from './Character_Ningguang_Card.jpg'
import Noelle from './Character_Noelle_Card.jpg'
import Qiqi from './Character_Qiqi_Card.jpg'
import RaidenShogun from './Character_Raiden_Shogun_Card.png'
import Razor from './Character_Razor_Card.jpg'
import Rosaria from './Character_Rosaria_Card.png'
import SangonomiyaKokomi from './Character_Sangonomiya_Kokomi_Card.jpg'
import Sayu from './Character_Sayu_Card.png'
import Shenhe from './Character_Shenhe_Card.jpg'
import ShikanoinHeizou from './Character_Shikanoin_Heizou_Card.png'
import Somnia from './Character_Somnia_Card.png'
import Sucrose from './Character_Sucrose_Card.jpg'
import Tartaglia from './Character_Tartaglia_Card.png'
import Thoma from './Character_Thoma_Card.jpg'
import Tighnari from './Character_Tighnari_Card.jpg'
import Venti from './Character_Venti_Card.jpg'
import Wanderer from './Character_Wanderer_Card.jpg'
import Xiangling from './Character_Xiangling_Card.jpg'
import Xiao from './Character_Xiao_Card.jpg'
import Xingqiu from './Character_Xingqiu_Card.jpg'
import Xinyan from './Character_Xinyan_Card.jpg'
import YaeMiko from './Character_Yae_Miko_Card.png'
import Yanfei from './Character_Yanfei_Card.png'
import Yaoyao from './Character_Yaoyao_Card.jpg'
import Yelan from './Character_Yelan_Card.jpg'
import Yoimiya from './Character_Yoimiya_Card.png'
import YunJin from './Character_Yun_Jin_Card.jpg'
import Zhongli from './Character_Zhongli_Card.png'
import TravelerF from './Traveler_Female_Card.jpg'
import TravelerM from './Traveler_Male_Card.jpg'

const charCards = {
  Albedo,
  Alhaitham,
  Aloy,
  Amber,
  AratakiItto,
  Baizhu,
  Barbara,
  Beidou,
  Bennett,
  Candace,
  Chongyun,
  Collei,
  Cyno,
  Dehya,
  Diluc,
  Diona,
  Dori,
  Eula,
  Faruzan,
  Fischl,
  Freminet,
  Ganyu,
  Gorou,
  HuTao,
  Jean,
  KaedeharaKazuha,
  Kaeya,
  KamisatoAyaka,
  KamisatoAyato,
  Kaveh,
  Keqing,
  Kirara,
  Klee,
  KujouSara,
  KukiShinobu,
  Layla,
  Lisa,
  Lyney,
  Lynette,
  Mika,
  Mona,
  Nahida,
  Neuvillette,
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
  Somnia,
  Sucrose,
  Tartaglia,
  Thoma,
  Tighnari,
  TravelerF,
  TravelerM,
  Venti,
  Wanderer,
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
  Zhongli,
} as const

export function charCard(charKey: CharacterKey, gender: GenderKey): string {
  switch (charKey) {
    case 'TravelerAnemo':
    case 'TravelerDendro':
    case 'TravelerElectro':
    case 'TravelerGeo':
    case 'TravelerHydro':
      return charCards[`Traveler${gender}`] ?? ''
    default:
      return charCards[charKey] ?? ''
  }
}
