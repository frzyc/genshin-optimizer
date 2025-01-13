# zzz-frontend

Frontend code for static Star Rail Optimizer.

## Dev Server

Run `nx serve zzz-frontend`

## Preview

To preview the production build locally, run `nx build zzz-frontend` and then `nx preview zzz-frontend`

## Adding new assets

Either add assets to `apps/zzz-frontend/assets` or configure the call to `viteStaticCopy` in `vite.config.mts` to copy library assets to the `assets` folder.

You can then reference them without any leading path, e.g. `notification.mp3`.
