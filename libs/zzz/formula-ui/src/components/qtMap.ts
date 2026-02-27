import i18n from 'i18next'

export const qtMap = {
  get initial() { return i18n.t('statKey_gen:initial') },
  get combat() { return i18n.t('statKey_gen:combat') },
  get final() { return i18n.t('statKey_gen:final') },
  get base() { return i18n.t('statKey_gen:base') },
}
