# frontend

Frontend code for static Genshin Optimizer.

## Dev Server

Run `nx serve frontend`

## Preview

To preview the production build locally, run `nx build frontend` and then `nx preview frontend`

## Adding new assets

Either add assets to `apps/frontend/assets` or configure the call to `viteStaticCopy` in `vite.config.mts` to copy library assets to the `assets` folder.

You can then reference them without any leading path, e.g. `notification.mp3`.
