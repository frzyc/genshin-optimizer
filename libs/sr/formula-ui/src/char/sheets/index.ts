import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { TalentSheetElementKey } from '../consts'
import Acheron from './Acheron'
import Argenti from './Argenti'
import Arlan from './Arlan'
import Asta from './Asta'
import Aventurine from './Aventurine'
import Bailu from './Bailu'
import BlackSwan from './BlackSwan'
import Blade from './Blade'
import Boothill from './Boothill'
import Bronya from './Bronya'
import Clara from './Clara'
import DanHeng from './DanHeng'
import DanHengImbibitorLunae from './DanHengImbibitorLunae'
import DrRatio from './DrRatio'
import Firefly from './Firefly'
import FuXuan from './FuXuan'
import Gallagher from './Gallagher'
import Gepard from './Gepard'
import Guinaifen from './Guinaifen'
import Hanya from './Hanya'
import Herta from './Herta'
import Himeko from './Himeko'
import Hook from './Hook'
import Huohuo from './Huohuo'
import Jade from './Jade'
import JingYuan from './JingYuan'
import Jingliu from './Jingliu'
import Kafka from './Kafka'
import Luka from './Luka'
import Luocha from './Luocha'
import Lynx from './Lynx'
import March7th from './March7th'
import March7thTheHunt from './March7thTheHunt'
import Misha from './Misha'
import Natasha from './Natasha'
import Pela from './Pela'
import Qingque from './Qingque'
import Robin from './Robin'
import RuanMei from './RuanMei'
import Sampo from './Sampo'
import Seele from './Seele'
import Serval from './Serval'
import SilverWolf from './SilverWolf'
import Sparkle from './Sparkle'
import Sushang from './Sushang'
import Tingyun from './Tingyun'
import TopazAndNumby from './TopazAndNumby'
import TrailblazerFire from './TrailblazerFire'
import TrailblazerImaginary from './TrailblazerImaginary'
import TrailblazerPhysical from './TrailblazerPhysical'
import Welt from './Welt'
import Xueyi from './Xueyi'
import Yanqing from './Yanqing'
import Yukong from './Yukong'
import Yunli from './Yunli'

export const uiSheets: Record<CharacterKey, UISheet<TalentSheetElementKey>> = {
  Acheron,
  Argenti,
  Arlan,
  Asta,
  Aventurine,
  Bailu,
  BlackSwan,
  Blade,
  Boothill,
  Bronya,
  Clara,
  DanHeng,
  DanHengImbibitorLunae,
  DrRatio,
  Firefly,
  FuXuan,
  Gallagher,
  Gepard,
  Guinaifen,
  Hanya,
  Herta,
  Himeko,
  Hook,
  Huohuo,
  Jade,
  JingYuan,
  Jingliu,
  Kafka,
  Luka,
  Luocha,
  Lynx,
  March7th,
  March7thTheHunt,
  Misha,
  Natasha,
  Pela,
  Qingque,
  Robin,
  RuanMei,
  Sampo,
  Seele,
  Serval,
  SilverWolf,
  Sparkle,
  Sushang,
  Tingyun,
  TopazAndNumby,
  Welt,
  Xueyi,
  Yanqing,
  Yukong,
  Yunli,
  TrailblazerPhysical,
  TrailblazerFire,
  TrailblazerImaginary,
} as const
