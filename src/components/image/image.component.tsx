import { memo } from 'react'

import NextImage from 'next/image'

import { isServerSide } from '~/utils/runtime'

import type { ImageProps, SafeNumber } from './image.types'

const BACKGROUND_COLOR = '#E2E8F0'
const SHIMMER_COLLOR = '#CBD5E1'

const shimmer = (width: SafeNumber, height: SafeNumber) => `
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="${BACKGROUND_COLOR}" offset="20%" />
      <stop stop-color="${SHIMMER_COLLOR}" offset="50%" />
      <stop stop-color="${BACKGROUND_COLOR}" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${BACKGROUND_COLOR}" />
  <rect id="r" width="${width}" height="${height}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${width}" to="${width}" dur="1s" repeatCount="indefinite"  />
</svg>`

const toBase64 = (str: string) =>
  isServerSide() ? Buffer.from(str).toString('base64') : window.btoa(str)

export function BaseImage(props: ImageProps) {
  const { width, height, ...otherProps } = props

  const hasWidthAndHeight = width && height
  const blurDataURL = hasWidthAndHeight
    ? `data:image/svg+xml;base64,${toBase64(shimmer(width, height))}`
    : undefined

  return (
    <NextImage
      width={width}
      height={height}
      placeholder='blur'
      blurDataURL={blurDataURL}
      {...otherProps}
    />
  )
}

export const Image = memo(BaseImage)
