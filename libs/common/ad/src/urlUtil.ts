export const GACHA_OPT_HOSTNAME = 'frzyc.github.io'
export const GO_PATHNAME = '/genshin-optimizer/'
export const ZO_PATHNAME = '/zenless-optimizer/'
export function isGOURL() {
  return (
    window.location.hostname === GACHA_OPT_HOSTNAME &&
    window.location.pathname === GO_PATHNAME
  )
}
export function isZOURL() {
  return (
    window.location.hostname === GACHA_OPT_HOSTNAME &&
    window.location.pathname === ZO_PATHNAME
  )
}
export const GO_LINK = 'https://frzyc.github.io/genshin-optimizer/'
export const ZO_LINK = 'https://frzyc.github.io/zenless-optimizer/'
export const DISCORD_LINK = 'https://discord.gg/CXUbQXyfUs'

export const GO_LOOTBAR_LINK =
  'https://lootbar.gg/top-up/genshin-impact-top-up?aff_short=frzyc'
export const ZO_LOOTBAR_LINK =
  'https://lootbar.gg/top-up/zenless-zone-zero?utm_source=ZO'
