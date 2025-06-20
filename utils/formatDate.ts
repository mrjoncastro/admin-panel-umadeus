export function formatDate(date: string | Date): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) {
    return ''
  }
  return d.toLocaleDateString('pt-BR')
}
