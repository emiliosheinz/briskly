import type { ImageProps as NextImageProps } from 'next/image'

export type ImageProps = Omit<NextImageProps, 'placeholder' | 'blurDataURL'>
export type SafeNumber = number | `${number}`
