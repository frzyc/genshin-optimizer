import * as React from 'react'

/**
 * Dynamically loaded next/image Image element
 */
let NextImage: React.ElementType | undefined
if (
  typeof require !== 'undefined' &&
  typeof require.resolve === 'function' &&
  require.resolve('next/image')
) {
  NextImage = React.lazy(() => import('next/image'))
}
export { NextImage }
