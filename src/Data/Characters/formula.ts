import albedo from './Albedo/data'
import amber from './Amber/data'
import barbara from './Barbara/data'
import beidou from './Beidou/data'
import bennett from './Bennett/data'
import chongyun from './Chongyun/data'
import diluc from './Diluc/data'
import diona from './Diona/data'
import eula from './Eula/data'
import fischl from './Fischl/data'
import ganyu from './Ganyu/data'
import hutao from './HuTao/data'
import jean from './Jean/data'
import kaedeharakazuha from './KaedeharaKazuha/data'
import kaeya from './Kaeya/data'
import keqing from './Keqing/data'
import klee from './Klee/data'
import lisa from './Lisa/data'
import mona from './Mona/data'
import ningguang from './Ningguang/data'
import noelle from './Noelle/data'
import qiqi from './Qiqi/data'
import razor from './Razor/data'
import rosaria from './Rosaria/data'
import sucrose from './Sucrose/data'
import tartaglia from './Tartaglia/data'
import travelerAnemo from './Traveler/anemoData'
import travelerGeo from './Traveler/geoData'
import venti from './Venti/data'
import xiao from './Xiao/data'
import xiangling from './Xiangling/data'
import xingqiu from './Xingqiu/data'
import xinyan from './Xinyan/data'
import yanfei from './Yanfei/data'
import zhongli from './Zhongli/data'
import { IFormulaSheet } from '../../Types/character'
import { CharacterKey, ElementKey } from '../../Types/consts'
type IFormulaSheets = StrictDict<CharacterKey, IFormulaSheet | Dict<ElementKey, IFormulaSheet>>
const formula: IFormulaSheets = {
  albedo,
  amber,
  barbara,
  beidou,
  bennett,
  chongyun,
  diluc,
  diona,
  eula,
  fischl,
  ganyu,
  hutao,
  jean,
  kaedeharakazuha,
  kaeya,
  keqing,
  klee,
  lisa,
  mona,
  ningguang,
  noelle,
  qiqi,
  razor,
  rosaria,
  sucrose,
  tartaglia,
  traveler: { anemo: travelerAnemo, geo: travelerGeo },
  venti,
  xiao,
  xiangling,
  xingqiu,
  xinyan,
  yanfei,
  zhongli
};
export default formula
