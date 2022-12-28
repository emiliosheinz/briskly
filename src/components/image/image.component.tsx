import { memo } from 'react'

import NextImage from 'next/image'

import { isServerSide } from '~/utils/runtime'

import type { ImageProps } from './image.types'

const shimmer = `
<svg version="1.1" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#E2E8F0" />
</svg>`

const toBase64 = (str: string) =>
  isServerSide() ? Buffer.from(str).toString('base64') : window.btoa(str)

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
