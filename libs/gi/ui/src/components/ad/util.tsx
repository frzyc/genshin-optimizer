export function toMainSite() {
  if (
    window.location.hostname === 'frzyc.github.io' &&
    window.location.pathname === '/genshin-optimizer/'
  )
    window.alert(
      'Why did you click on this? You are already on Genshin Optimizer!',
    )
  else window.open('https://frzyc.github.io/genshin-optimizer/', '_blank')
}
export function toDiscord() {
  window.open('https://discord.gg/CXUbQXyfUs', '_blank')
}
