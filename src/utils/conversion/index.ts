import { isServerSide } from '~/utils/runtime'

export function toBase64(str: string) {
  return isServerSide() ? Buffer.from(str).toString('base64') : window.btoa(str)
}
