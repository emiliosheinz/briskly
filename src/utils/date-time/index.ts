export function formatToDayMonthYearWithHourAndSeconds(dateTime?: Date) {
  if (!dateTime) return 'Data Inválida'

  return dateTime.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function addHours(dateTime: Date, hours: number) {
  const copiedDate = new Date(dateTime.getTime())
  copiedDate.setTime(copiedDate.getTime() + hours * 60 * 60 * 1000)
  return copiedDate
}

export function differenceInHours(future: Date, past: Date) {
  return Math.abs(future.getTime() - past.getTime()) / 36e5
}
