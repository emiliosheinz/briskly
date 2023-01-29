export function addHours(dateTime: Date, hours: number) {
  const copiedDate = new Date(dateTime.getTime())
  copiedDate.setTime(copiedDate.getTime() + hours * 60 * 60 * 1000)
  return copiedDate
}
