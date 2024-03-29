import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { Image } from '~/components/image'
import { routes } from '~/utils/navigation'

import type { FeedbackProps } from './feedback.types'

const isString = (value: unknown): value is string => typeof value === 'string'

export function Feedback(props: FeedbackProps) {
  const {
    title,
    subtitle,
    buttonLabel,
    onButtonClick,
    shouldHideButton,
    customImageSrc,
  } = props

  const router = useRouter()

  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick()
    } else {
      router.push(routes.home())
    }
  }

  const renderButton = () => {
    if (shouldHideButton) return null

    return (
      <Button fullWidth onClick={handleClick}>
        {buttonLabel || 'Voltar para a página inicial'}
      </Button>
    )
  }

  return (
    <div className='mx-auto flex max-w-2xl flex-col items-center gap-10 p-2 md:p-5'>
      <div className='flex flex-col items-center gap-10 md:flex-row'>
        <div className='flex flex-col gap-2 text-center'>
          <h1 className='text-2xl font-light text-primary-900 md:text-4xl'>
            {isString(title) ? title : title()}
          </h1>
          <h2 className='text-xl font-extralight md:text-xl'>
            {isString(subtitle) ? subtitle : subtitle()}
          </h2>
        </div>
        <Image
          width={300}
          height={300}
          alt={`${subtitle} illustration`}
          src={customImageSrc || '/images/petting.svg'}
        />
      </div>
      {renderButton()}
    </div>
  )
}
