import { memo } from 'react'

import NextImage from 'next/image'

import { toBase64 } from '~/utils/conversion'

import type { ImageProps } from './image.types'

const shimmer = `
<svg version="1.1" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#E2E8F0" />
</svg>`

export function BaseImage(props: ImageProps) {
  return (
    <NextImage
      placeholder='blur'
      blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer)}`}
      {...props}
    />
  )
}

export const Image = memo(BaseImage)
