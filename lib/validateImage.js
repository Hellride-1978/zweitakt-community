const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_SIZE_MB = 10

export function validateImageFile(file) {
  if (!file) return 'Keine Datei ausgewählt.'
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Nicht erlaubter Dateityp: ${file.type}. Erlaubt: JPEG, PNG, WebP, AVIF.`
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `Datei zu groß (max. ${MAX_SIZE_MB} MB).`
  }
  return null
}
