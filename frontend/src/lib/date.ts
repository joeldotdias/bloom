export function formatTimeAgo(dateInput: Date | string): string {
  const data = new Date(dateInput)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - data.getTime()) / 1000)

  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; seconds: number }> = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ]

  const rtf = new Intl.RelativeTimeFormat('en', { style: 'narrow' })

  for (const { unit, seconds } of units) {
    if (diffInSeconds >= seconds || unit === 'second') {
      const value = Math.floor(diffInSeconds / seconds)
      return rtf.format(-value, unit)
    }
  }

  return 'just now'
}
