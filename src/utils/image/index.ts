export async function compress(file?: File): Promise<File | undefined> {
  if (!file) return

  const { default: Compressor } = await import('compressorjs')

  const compressorPromise = new Promise<File | Blob>((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      width: 768,
      height: 768,
      resize: 'cover',
      success: resolve,
      error: reject,
      mimeType: 'image/jpg',
    })
  })

  return await (compressorPromise as Promise<File>)
}
