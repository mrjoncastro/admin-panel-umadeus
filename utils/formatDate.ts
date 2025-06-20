export function formatDate(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return ''
  }
  const iso = d.toISOString().slice(0, 10).split('-')
  return `${iso[2]}/${iso[1]}/${iso[0]}`
}
