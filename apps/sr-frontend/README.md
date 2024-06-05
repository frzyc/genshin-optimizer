# sr-frontend

Frontend code for static Star Rail Optimizer.

## Dev Server

Run `nx serve sr-frontend`

## Preview

To preview the production build locally, run `nx build sr-frontend` and then `nx preview sr-frontend`

## Adding new assets

Either add assets to `apps/sr-frontend/assets` or configure the call to `viteStaticCopy` in `vite.config.mts` to copy library assets to the `assets` folder.

You can then reference them without any leading path, e.g. `notification.mp3`.
