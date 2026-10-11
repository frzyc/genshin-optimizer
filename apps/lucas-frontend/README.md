# lucas-frontend

Personal copy of `apps/frontend` (the Genshin Optimizer shell: App, Header, Footer, routes, `index.html`).
Customizations to the shell live here so `apps/frontend` stays identical to upstream and merges stay clean.
Pages and data still come from the shared `libs/gi/*`, so new characters, weapons and images arrive with upstream merges.

## Dev Server

Run `yarn lucas` (or `nx serve lucas-frontend`). It uses port 4200, same as the original frontend, so the browser keeps the same local database.

## Preview

To preview the production build locally, run `nx build lucas-frontend` and then `nx preview lucas-frontend`

## Adding new assets

Either add assets to `apps/lucas-frontend/assets` or configure the call to `viteStaticCopy` in `vite.config.mts` to copy library assets to the `assets` folder.

You can then reference them without any leading path, e.g. `notification.mp3`.
