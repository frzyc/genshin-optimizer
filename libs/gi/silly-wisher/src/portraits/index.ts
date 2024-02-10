import type { CharacterKey, GenderKey } from '@genshin-optimizer/gi/consts'
import { charKeyToLocGenderedCharKey } from '@genshin-optimizer/gi/consts'
import TravelerM from './portrait_aether.png'
import Albedo from './portrait_albedo.png'
import Alhaitham from './portrait_alhaitham.png'
import Aloy from './portrait_aloy.png'
import Amber from './portrait_amber.png'
import KamisatoAyaka from './portrait_ayaka.png'
import KamisatoAyato from './portrait_ayato.png'
import Baizhu from './portrait_baizhu.png'
import Barbara from './portrait_barbara.png'
import Beidou from './portrait_beidou.png'
import Bennett from './portrait_bennett.png'
import Candace from './portrait_candace.png'
import Charlotte from './portrait_charlotte.png'
import Chevreuse from './portrait_chevreuse.png'
import Chongyun from './portrait_chongyun.png'
import Collei from './portrait_collei.png'
import Cyno from './portrait_cyno.png'
import Dehya from './portrait_dehya.png'
import Diluc from './portrait_diluc.png'
import Diona from './portrait_diona.png'
import Dori from './portrait_dori.png'
import Eula from './portrait_eula.png'
import Faruzan from './portrait_faruzan.png'
import Fischl from './portrait_fischl.png'
import Freminet from './portrait_freminet.png'
import Furina from './portrait_furina.png'
import Gaming from './portrait_gaming.png'
import Ganyu from './portrait_ganyu.png'
import Gorou from './portrait_gorou.png'
import HuTao from './portrait_hutao.png'
import AratakiItto from './portrait_itto.png'
import Jean from './portrait_jean.png'
import Kaeya from './portrait_kaeya.png'
import Kaveh from './portrait_kaveh.png'
import KaedeharaKazuha from './portrait_kazuha.png'
import Keqing from './portrait_keqing.png'
import Kirara from './portrait_kirara.png'
import Klee from './portrait_klee.png'
import SangonomiyaKokomi from './portrait_kokomi.png'
import KukiShinobu from './portrait_kuki.png'
import Layla from './portrait_layla.png'
import Lisa from './portrait_lisa.png'
import Lynette from './portrait_lynette.png'
import Lyney from './portrait_lyney.png'
import Mika from './portrait_mika.png'
import TravelerF from './portrait_lumine.png'
import Mona from './portrait_mona.png'
import Nahida from './portrait_nahida.png'
import Navia from './portrait_navia.png'
import Neuvillette from './portrait_neuvillette.png'
import Nilou from './portrait_nilou.png'
import Ningguang from './portrait_ningguang.png'
import Noelle from './portrait_noelle.png'
import Qiqi from './portrait_qiqi.png'
import RaidenShogun from './portrait_raiden.png'
import Razor from './portrait_razor.png'
import Rosaria from './portrait_rosaria.png'
import KujouSara from './portrait_sara.png'
import Sayu from './portrait_sayu.png'
import Shenhe from './portrait_shenhe.png'
import Sucrose from './portrait_sucrose.png'
import Tartaglia from './portrait_tartaglia.png'
import Thoma from './portrait_thoma.png'
import Tighnari from './portrait_tightnari.png'
import Venti from './portrait_venti.png'
import Wanderer from './portrait_wanderer.png'
import Wriothesley from './portrait_wriothesley.png'
import Xiangling from './portrait_xiangling.png'
import Xianyun from './portrait_xianyun.png'
import Xiao from './portrait_xiao.png'
import Xingqiu from './portrait_xingqiu.png'
import Xinyan from './portrait_xinyan.png'
import YaeMiko from './portrait_yae.png'
import Yanfei from './portrait_yanfei.png'
import Yaoyao from './portrait_yaoyao.png'
import Yelan from './portrait_yelan.png'
import Yoimiya from './portrait_yoimiya.png'
import YunJin from './portrait_yunjin.png'
import Zhongli from './portrait_zhongli.png'
import ShikanoinHeizou from './potrait_heizou.png'
const data = {
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
  Charlotte,
  Chevreuse,
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
  Furina,
  Ganyu,
  Gaming,
  Gorou,
  HuTao,
  Jean,
  KaedeharaKazuha,
  Kaeya,
  Kaveh,
  KamisatoAyaka,
  KamisatoAyato,
  Keqing,
  Kirara,
  Klee,
  KujouSara,
  KukiShinobu,
  Layla,
  Lisa,
  Lynette,
  Lyney,
  Mika,
  Mona,
  Nahida,
  Navia,
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
  Sucrose,
  Tartaglia,
  Thoma,
  Tighnari,
  TravelerF,
  TravelerM,
  Venti,
  Wanderer,
  Wriothesley,
  Xiangling,
  Xianyun,
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

export function portrait(charKey: CharacterKey, gender: GenderKey): string {
  return (
    data[charKeyToLocGenderedCharKey(charKey, gender) as keyof typeof data] ??
    ''
  )
}
