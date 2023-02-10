import type { StaticImageData } from 'next/image'

export type FeedbackProps = {
  title: (() => JSX.Element) | string
  subtitle: (() => JSX.Element) | string
  buttonLabel?: string
  onButtonClick?: () => void
  shouldHideButton?: boolean
  CustomImage?: StaticImageData
}
