export function getResponsiveImageSources(image: string, widths = [480, 760, 1120, 1600]) {
  try {
    const original = new URL(image)
    if (original.hostname !== 'images.unsplash.com') return undefined

    return widths.map((width) => {
      const sized = new URL(original)
      sized.searchParams.set('w', String(width))
      return `${sized.toString()} ${width}w`
    }).join(', ')
  } catch {
    return undefined
  }
}
