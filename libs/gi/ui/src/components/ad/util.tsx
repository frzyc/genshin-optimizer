/**
 * @deprecated
 * This this prevent the on hover of an element showing the URL it's going to. Should probably use href and onClick somehow
 */
export function toMainSite() {
  if (
    window.location.hostname === 'frzyc.github.io' &&
    window.location.pathname === '/genshin-optimizer/'
  )
    window.alert(
      'Why did you click on this? You are already on Genshin Optimizer!'
    )
  else window.open('https://frzyc.github.io/genshin-optimizer/', '_blank')
}
export const DISCORD_LINK = 'https://discord.gg/CXUbQXyfUs'

export const LOOTBAR_LINK =
  'https://lootbar.gg/top-up/genshin-impact-top-up?aff_short=frzyc'
