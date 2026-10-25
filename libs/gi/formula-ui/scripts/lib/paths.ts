import { join } from 'node:path'

export const REPO_ROOT = process.cwd()
export const FORMULA_UI_ROOT = join(REPO_ROOT, 'libs/gi/formula-ui')
export const CHAR_SHEETS_DIR = join(FORMULA_UI_ROOT, 'src/char/sheets')
export const FORMULA_CHAR_DIR = join(REPO_ROOT, 'libs/gi/formula/src/data/char')
export const WR_CHAR_DIR = join(REPO_ROOT, 'libs/gi/sheets/src/Characters')

export const TALENT_SECTIONS = [
  'auto',
  'skill',
  'burst',
  'passive1',
  'passive2',
  'passive3',
  'constellation1',
  'constellation2',
  'constellation3',
  'constellation4',
  'constellation5',
  'constellation6',
] as const

export type TalentSection = (typeof TALENT_SECTIONS)[number]
