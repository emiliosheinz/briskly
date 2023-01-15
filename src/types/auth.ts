export type WithAuthentication<P = unknown> = P & {
  requiresAuthentication?: true
}
