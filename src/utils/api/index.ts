import { httpBatchLink, loggerLink, TRPCClientError } from '@trpc/client'
import { createTRPCNext } from '@trpc/next'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import superjson from 'superjson'

import type { AppRouter } from '~/server/api/root'

import { isServerSide } from '../runtime'
import { notify } from '../toast'

const getBaseUrl = () => {
  if (!isServerSide()) return '' // browser should use relative path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}` // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}` // dev SSR should use localhost
}

export const api = createTRPCNext<AppRouter>({
  config() {
    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: opts =>
            process.env.NODE_ENV === 'development' ||
            (opts.direction === 'down' && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
      abortOnUnmount: true,
      queryClientConfig: {
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            cacheTime: 1000 * 60 * 10, // 10 minutes
            retry: 3,
            // Applies a exponential backoff to retry
            // See https://tanstack.com/query/v4/docs/react/reference/useQuery
            retryDelay: attempt =>
              Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
          },
        },
      },
    }
  },
  ssr: false,
})

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>

function isTRPCClientError(
  error: unknown,
): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError
}

function handleTRPCClientError(error: TRPCClientError<AppRouter>) {
  const isArrayOfErrors = error.message.startsWith('[')

  if (isArrayOfErrors) {
    const errors = JSON.parse(error.message)

    for (const { message } of errors) {
      notify.error(message)
    }
  } else {
    notify.error(error.message)
  }
}

export function handleApiClientSideError({ error }: { error: unknown }) {
  if (isServerSide()) return

  try {
    if (isTRPCClientError(error)) handleTRPCClientError(error)
    else throw error
  } catch {
    notify.error('Ocorreu um erro inesperado! Tente novamente mais tarde.')
  }
}
