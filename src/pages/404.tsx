import { useRouter } from 'next/router'

import { Button } from '~/components/button'
import { Image } from '~/components/image'
import { routes } from '~/utils/navigation'

export default function FourOhFor() {
  const router = useRouter()

  return (
    <div className='mx-auto flex max-w-md flex-col items-center gap-10 p-5'>
      <div className='flex flex-col gap-2 text-center'>
        <h1 className='text-5xl font-extralight text-primary-900'>Desculpe,</h1>
        <h2 className='text-2xl font-extralight'>
          não foi possível encontrar esta página.
        </h2>
      </div>
      <Image
        src='/images/not-found-illustration.svg'
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
