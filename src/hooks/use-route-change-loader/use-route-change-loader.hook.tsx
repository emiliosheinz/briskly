import { useEffect } from 'react'

import { useSetAtom } from 'jotai'
import { useRouter } from 'next/router'

import { fullScreenLoaderAtom } from '~/utils/atoms'

export function useRouteChangeLoader() {
  const router = useRouter()
  const setIsLoading = useSetAtom(fullScreenLoaderAtom)

  useEffect(() => {
    const handleStart = (url: string) =>
      url !== router.asPath && setIsLoading(true)
    const handleComplete = (url: string) =>
      url === router.asPath && setIsLoading(false)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router.asPath, router.events, setIsLoading])
}
