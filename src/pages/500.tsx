import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { Image } from '~/components/image'
import { routes } from '~/utils/navigation'

export default function FiveHundred() {
  const router = useRouter()

  return (
    <div className='mx-auto flex max-w-md flex-col items-center gap-10 p-5'>
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='text-4xl font-extralight text-primary-900 md:text-5xl'>
          Erro inesperado!
        </h1>
        <h2 className='text-xl font-extralight md:text-2xl'>
          Desculpe, parece que houve um erro inesperado em nosso site.
        </h2>
      </div>
      <Image
        src='/images/lost-in-space.svg'
        width={448}
        height={297}
        alt='404 illustration'
      />
      <Button
        fullWidth
        variant='secondary'
        onClick={() => router.push(routes.home())}
      >
        Voltar para a Home
      </Button>
    </div>
  )
}
