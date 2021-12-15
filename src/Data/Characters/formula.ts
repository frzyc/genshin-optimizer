import Albedo from './Albedo/data'
import Aloy from './Aloy/data'
import Amber from './Amber/data'
import Barbara from './Barbara/data'
import Beidou from './Beidou/data'
import Bennett from './Bennett/data'
import Chongyun from './Chongyun/data'
import Diluc from './Diluc/data'
import Diona from './Diona/data'
import Eula from './Eula/data'
import Fischl from './Fischl/data'
import Ganyu from './Ganyu/data'
import Gorou from './Gorou/data'
import HuTao from './HuTao/data'
import Jean from './Jean/data'
import KaedeharaKazuha from './KaedeharaKazuha/data'
import Kaeya from './Kaeya/data'
import KamisatoAyaka from './KamisatoAyaka/data'
import Keqing from './Keqing/data'
import Klee from './Klee/data'
import KujouSara from './KujouSara/data'
import Lisa from './Lisa/data'
import Mona from './Mona/data'
import Ningguang from './Ningguang/data'
import Noelle from './Noelle/data'
import Qiqi from './Qiqi/data'
import RaidenShogun from './RaidenShogun/data'
import Razor from './Razor/data'
import Rosaria from './Rosaria/data'
import SangonomiyaKokomi from './SangonomiyaKokomi/data'
import Sayu from './Sayu/data'
import Sucrose from './Sucrose/data'
import Tartaglia from './Tartaglia/data'
import Thoma from './Thoma/data'
import Traveler from './Traveler/data'
import Venti from './Venti/data'
import Xiao from './Xiao/data'
import Xiangling from './Xiangling/data'
import Xingqiu from './Xingqiu/data'
import Xinyan from './Xinyan/data'
import Yanfei from './Yanfei/data'
import Yoimiya from './Yoimiya/data'
import Zhongli from './Zhongli/data'
import { IFormulaSheet } from '../../Types/character'
import { CharacterKey, ElementKey } from '../../Types/consts'
type IFormulaSheets = StrictDict<CharacterKey, IFormulaSheet | Dict<ElementKey, IFormulaSheet>>
const formula: IFormulaSheets = {
  Albedo,
  Aloy,
  Amber,
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
  Keqing,
  Klee,
  KujouSara,
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
  Sucrose,
  Tartaglia,
  Thoma,
  Traveler,
  Venti,
  Xiao,
  Xiangling,
  Xingqiu,
  Xinyan,
  Yanfei,
  Yoimiya,
  Zhongli
};
export default formula
