import { useRouter } from 'next/router'

import { Button } from '~/components/button'

export const SubmitButtons = () => {
  const router = useRouter()

  return (
    <footer className='mt-5 flex justify-end gap-5'>
      <Button variant='bad' type='button' onClick={() => router.back()}>
        Cancelar
      </Button>
      <Button type='submit'>Salvar</Button>
    </footer>
  )
}
