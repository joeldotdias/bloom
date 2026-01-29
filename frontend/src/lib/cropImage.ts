export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (err) => reject(err))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  canvas.width = image.width
  canvas.height = image.height

  ctx.drawImage(image, 0, 0)

  const croppedImage = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
  )

  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  ctx.putImageData(croppedImage, 0, 0)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/jpeg')
  })
}
