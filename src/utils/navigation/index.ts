export const routes = {
  home: () => '/',
  createNewDeck: () => '/decks/new',
  signIn: (params?: { callbackUrl?: string }) => {
    const { callbackUrl } = params ?? {}
    const basePath = '/api/auth/signin'

    if (!callbackUrl) return basePath

    return `${basePath}?${new URLSearchParams({ callbackUrl })}`
  },
}
