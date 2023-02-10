import { memo, useMemo } from 'react'

import type { ImageProps } from 'next/image'
import NextImage from 'next/image'

import { toBase64 } from '~/utils/conversion'

const shimmer = `
<svg version="1.1" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#E2E8F0" />
</svg>`

const MINIMUM_IMAGE_SIZE_WITH_BLUE = 40

function BaseImage(props: ImageProps) {
  const { width, height, style, ...otherProps } = props

  const blurProps: Pick<ImageProps, 'placeholder' | 'blurDataURL'> =
    useMemo(() => {
      if (width && width < MINIMUM_IMAGE_SIZE_WITH_BLUE) return {}

      if (height && height < MINIMUM_IMAGE_SIZE_WITH_BLUE) return {}

      return {
        placeholder: 'blur',
        blurDataURL: `data:image/svg+xml;base64,${toBase64(shimmer)}`,
      }
    }, [width, height])

  return (
    <NextImage
      width={width}
      height={height}
      data-testid='image-component'
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...blurProps}
      {...otherProps}
    />
  )
}

export const Image = memo(BaseImage)
