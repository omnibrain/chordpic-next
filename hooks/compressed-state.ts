import { decompressFromEncodedURIComponent } from 'lz-string'

export function decompress<T>(compressedData: string): T | null {
  try {
    const decompressed = decompressFromEncodedURIComponent(compressedData)
    return decompressed ? JSON.parse(decompressed) : null
  } catch (err) {
    // decompression failed -> return default value
    return null
  }
}
